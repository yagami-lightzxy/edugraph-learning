import { readZip } from './zip.js'
import { cleanText, deriveTitle } from './text.js'

function decodeXml(value) {
  return String(value).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10)
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match
      try {
        return String.fromCodePoint(code)
      } catch {
        return match
      }
    }
    const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
    return Object.prototype.hasOwnProperty.call(named, entity) ? named[entity] : match
  })
}

function getAttr(tag, name) {
  if (!tag) return null
  const doubleQuoted = tag.match(new RegExp('\\b' + name + '="([^"]*)"'))
  if (doubleQuoted) return decodeXml(doubleQuoted[1])
  const singleQuoted = tag.match(new RegExp("\\b" + name + "='([^']*)'"))
  return singleQuoted ? decodeXml(singleQuoted[1]) : null
}

function textEntry(files, name) {
  const direct = files.get(name) || files.get(name.replace(/^\/+/, ''))
  if (!direct) return null
  const text = direct.toString('utf8')
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function headingLevelFromStyleName(name) {
  if (!name) return 0
  const value = name.trim()
  if (/^title$/i.test(value) || value === '标题') return 1
  let match = value.match(/^heading\s*([1-6])$/i) || value.match(/^heading([1-6])$/i)
  if (match) return Number(match[1])
  match = value.match(/^标题\s*([1-6])$/)
  return match ? Number(match[1]) : 0
}

function parseStyleLevels(stylesXml) {
  const levels = new Map()
  if (!stylesXml) return levels
  const styleRe = /<w:style\b([^>]*)>([\s\S]*?)<\/w:style>/g
  let match
  while ((match = styleRe.exec(stylesXml)) !== null) {
    const styleId = getAttr(match[1], 'w:styleId')
    if (!styleId) continue
    const nameMatch = match[2].match(/<w:name\b[^>]*w:val="([^"]*)"/)
    const name = nameMatch ? decodeXml(nameMatch[1]) : ''
    const level = headingLevelFromStyleName(styleId) || headingLevelFromStyleName(name)
    if (level > 0) levels.set(styleId, level)
  }
  return levels
}

function extractParagraphText(xml) {
  const tokenRe = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<w:cr\b[^>]*\/>|<w:noBreakHyphen\b[^>]*\/>/g
  let text = ''
  let match
  while ((match = tokenRe.exec(xml)) !== null) {
    if (match[1] !== undefined) {
      text += decodeXml(match[1])
    } else if (match[0].indexOf('<w:tab') === 0) {
      text += '\t'
    } else if (match[0].indexOf('<w:br') === 0 || match[0].indexOf('<w:cr') === 0) {
      text += '\n'
    } else {
      text += '-'
    }
  }
  return text
}

function hasBoldRun(xml) {
  const boldRe = /<w:b(?:\s[^>]*)?\/?>/g
  let match
  while ((match = boldRe.exec(xml)) !== null) {
    const value = getAttr(match[0], 'w:val')
    if (value == null || !/^(?:0|false|off)$/i.test(value)) return true
  }
  return false
}

function paragraphInfo(xml, styleLevels) {
  const pPrMatch = xml.match(/<w:pPr\b[^>]*>[\s\S]*?<\/w:pPr>/)
  const pPr = pPrMatch ? pPrMatch[0] : ''
  const styleTag = pPr.match(/<w:pStyle\b[^>]*\/?>/)
  const styleId = styleTag ? getAttr(styleTag[0], 'w:val') : ''
  const text = cleanText(extractParagraphText(xml))
  if (!text) return null

  let level = styleId && styleLevels.has(styleId) ? styleLevels.get(styleId) : 0
  if (!level && styleId) level = headingLevelFromStyleName(styleId)
  if (!level) {
    const outline = pPr.match(/<w:outlineLvl\b[^>]*w:val="([0-8])"/)
    if (outline) level = Math.min(6, Number(outline[1]) + 1)
  }
  if (level > 0) level = Math.max(1, Math.min(6, level))

  const isList = /<w:numPr\b/.test(pPr) || (styleId ? /^list/i.test(styleId) : false)
  const bold = hasBoldRun(xml)
  return { kind: level > 0 ? 'heading' : isList ? 'list' : 'paragraph', text, level, bold }
}

function findTableRanges(xml) {
  const ranges = []
  const tagRe = /<\/?w:tbl\b[^>]*>/g
  let open = null
  let depth = 0
  let match
  while ((match = tagRe.exec(xml)) !== null) {
    const tag = match[0]
    if (tag.startsWith('</')) {
      depth -= 1
      if (open !== null && depth <= 0) {
        ranges.push({ start: open, end: match.index + tag.length })
        open = null
        depth = 0
      }
    } else if (tag.endsWith('/>')) {
      if (open === null) ranges.push({ start: match.index, end: match.index + tag.length })
    } else {
      if (open === null) open = match.index
      depth += 1
    }
  }
  return ranges
}

function isInsideRanges(index, ranges) {
  for (const range of ranges) {
    if (index < range.start) return false
    if (index >= range.start && index < range.end) return true
  }
  return false
}

function parseTableRows(xml) {
  const rows = []
  const rowRe = /<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g
  let rowMatch
  while ((rowMatch = rowRe.exec(xml)) !== null) {
    const cells = []
    const cellRe = /<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g
    let cellMatch
    while ((cellMatch = cellRe.exec(rowMatch[1])) !== null) {
      const paragraphs = []
      const paragraphRe = /<w:p\b[^>]*\/>|<w:p\b[^>]*>[\s\S]*?<\/w:p>/g
      let paragraphMatch
      while ((paragraphMatch = paragraphRe.exec(cellMatch[1])) !== null) {
        if (paragraphMatch[0].endsWith('/>')) continue
        const text = cleanText(extractParagraphText(paragraphMatch[0]))
        if (text) paragraphs.push(text)
      }
      const cellText = cleanText(paragraphs.join(' ') || extractParagraphText(cellMatch[1]))
      cells.push(cellText)
    }
    while (cells.length > 0 && cells[cells.length - 1] === '') cells.pop()
    if (cells.some((cell) => cell !== '')) rows.push(cells.join(' | '))
  }
  return rows
}

function collectEntries(documentXml, styleLevels) {
  const tableRanges = findTableRanges(documentXml)
  const entries = []

  const paragraphRe = /<w:p\b[^>]*\/>|<w:p\b[^>]*>[\s\S]*?<\/w:p>/g
  let match
  while ((match = paragraphRe.exec(documentXml)) !== null) {
    if (isInsideRanges(match.index, tableRanges)) continue
    const info = paragraphInfo(match[0], styleLevels)
    if (info) entries.push({ start: match.index, type: 'paragraph', info })
  }

  for (const range of tableRanges) {
    const xml = documentXml.slice(range.start, range.end)
    for (const rowText of parseTableRows(xml)) {
      entries.push({ start: range.start, type: 'table', text: rowText })
    }
  }

  entries.sort((a, b) => a.start - b.start)
  return entries
}

/**
 * Parse a DOCX buffer (OOXML, no third-party libraries).
 * @param {Buffer|Uint8Array|ArrayBuffer} input
 * @param {{filename?: string}} [options]
 */
export function parseDocx(input, options = {}) {
  const files = readZip(input)
  const documentXml = textEntry(files, 'word/document.xml')
  if (!documentXml) throw new Error('DOCX: missing word/document.xml')

  const styleLevels = parseStyleLevels(textEntry(files, 'word/styles.xml'))
  const entries = collectEntries(documentXml, styleLevels)
  const blocks = []
  let order = 0

  for (const entry of entries) {
    order += 1
    if (entry.type === 'table') {
      blocks.push({ id: 'b' + order, kind: 'table', text: cleanText(entry.text), pageNo: 1, order })
      continue
    }
    const info = entry.info
    const block = {
      id: 'b' + order,
      kind: info.kind,
      text: info.text,
      pageNo: 1,
      order,
    }
    if (info.kind === 'heading') block.level = info.level
    if (info.bold) block.style = { bold: true }
    blocks.push(block)
  }

  const coreTitle = textEntry(files, 'docProps/core.xml')
  let title = null
  if (coreTitle) {
    const titleMatch = coreTitle.match(/<dc:title\b[^>]*>([\s\S]*?)<\/dc:title>/)
    if (titleMatch) title = cleanText(decodeXml(titleMatch[1])) || null
  }
  if (!title) title = deriveTitle(blocks, options.filename)

  const warnings = []
  if (blocks.length === 0) warnings.push('DOCX contains no extractable text')

  return {
    parser: 'docx',
    title,
    pages: [{ pageNo: 1, blocks }],
    charCount: blocks.reduce((sum, block) => sum + block.text.length, 0),
    warnings,
  }
}

export const docxInternals = {
  decodeXml,
  extractParagraphText,
  headingLevelFromStyleName,
  parseStyleLevels,
  collectEntries,
}
