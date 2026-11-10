import { readZip } from './zip.js'
import { cleanText } from './text.js'

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

function parseSharedStrings(xml) {
  const strings = []
  if (!xml) return strings
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g
  let match
  while ((match = siRe.exec(xml)) !== null) {
    let text = ''
    const tRe = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g
    let textMatch
    while ((textMatch = tRe.exec(match[1])) !== null) text += decodeXml(textMatch[1])
    strings.push(text)
  }
  return strings
}

function parseSheetNames(workbookXml) {
  const names = []
  if (!workbookXml) return names
  const sheetRe = /<sheet\b[^>]*\/?>/g
  let match
  while ((match = sheetRe.exec(workbookXml)) !== null) {
    const name = getAttr(match[0], 'name')
    if (name) names.push(name)
  }
  return names
}

function parseCellValue(body, type, sharedStrings) {
  if (!body) return ''
  if (type === 'inlineStr') {
    let text = ''
    const tRe = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g
    let match
    while ((match = tRe.exec(body)) !== null) text += decodeXml(match[1])
    return cleanText(text)
  }

  const valueMatch = body.match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/)
  const raw = valueMatch ? decodeXml(valueMatch[1]) : ''
  if (!raw) {
    const tMatch = body.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/)
    return tMatch ? cleanText(decodeXml(tMatch[1])) : ''
  }

  if (type === 's') {
    const index = Number(raw)
    if (!Number.isInteger(index) || index < 0 || index >= sharedStrings.length) return ''
    return cleanText(sharedStrings[index])
  }
  if (type === 'b') return raw === '1' ? 'TRUE' : 'FALSE'
  return cleanText(raw)
}

function columnIndex(ref) {
  const match = /^([A-Za-z]+)/.exec(String(ref || ''))
  if (!match) return -1
  let value = 0
  for (const ch of match[1].toUpperCase()) value = value * 26 + (ch.charCodeAt(0) - 64)
  return value - 1
}

function parseSheetRows(xml, sharedStrings, warnings) {
  const rows = []
  const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/g
  let rowMatch
  while ((rowMatch = rowRe.exec(xml)) !== null) {
    const cells = []
    const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g
    let cellMatch
    while ((cellMatch = cellRe.exec(rowMatch[1])) !== null) {
      const attrs = cellMatch[1]
      const body = cellMatch[2] || ''
      const type = getAttr(attrs, 't') || ''
      const reference = getAttr(attrs, 'r') || ''
      const value = parseCellValue(body, type, sharedStrings)
      let index = columnIndex(reference)
      if (index < 0) index = cells.length
      while (cells.length < index) cells.push('')
      cells[index] = value
    }
    while (cells.length > 0 && cells[cells.length - 1] === '') cells.pop()
    if (cells.some((cell) => cell !== '')) rows.push(cells.join(' | '))
  }
  return rows
}

/**
 * Parse an XLSX buffer: each worksheet becomes a page and each non-empty row
 * becomes a table block with cells joined by " | ".
 * @param {Buffer|Uint8Array|ArrayBuffer} input
 * @param {{filename?: string}} [options]
 */
export function parseXlsx(input, options = {}) {
  const files = readZip(input)
  const sharedStrings = parseSharedStrings(textEntry(files, 'xl/sharedStrings.xml'))
  const workbookXml = textEntry(files, 'xl/workbook.xml')
  const sheetNames = parseSheetNames(workbookXml)

  const sheetEntries = []
  for (const name of files.keys()) {
    const match = name.match(/^xl\/worksheets\/sheet(\d+)\.xml$/)
    if (match) sheetEntries.push({ name, number: Number(match[1]) })
  }
  sheetEntries.sort((a, b) => a.number - b.number)
  if (sheetEntries.length === 0) throw new Error('XLSX: no worksheets found')

  const warnings = []
  if (!textEntry(files, 'xl/sharedStrings.xml')) {
    const hasSharedCells = /<c\b[^>]*\bt="s"/.test(textEntry(files, 'xl/worksheets/sheet1.xml') || '')
    if (hasSharedCells) warnings.push('XLSX: sharedStrings.xml is missing')
  }

  const pages = []
  const allBlocks = []
  let order = 0

  for (let index = 0; index < sheetEntries.length; index += 1) {
    const entry = sheetEntries[index]
    const pageNo = index + 1
    const sheetXml = textEntry(files, entry.name) || ''
    let rowTexts = []
    try {
      rowTexts = parseSheetRows(sheetXml, sharedStrings, warnings)
    } catch (error) {
      const message = error && error.message ? error.message : String(error)
      warnings.push('Sheet ' + entry.name + ': ' + message)
    }

    const pageBlocks = []
    for (const rowText of rowTexts) {
      const text = cleanText(rowText)
      if (!text) continue
      order += 1
      const block = { id: 'b' + order, kind: 'table', text, pageNo, order }
      pageBlocks.push(block)
      allBlocks.push(block)
    }
    pages.push({ pageNo, blocks: pageBlocks })
  }

  const coreTitle = textEntry(files, 'docProps/core.xml')
  let title = null
  if (coreTitle) {
    const titleMatch = coreTitle.match(/<dc:title\b[^>]*>([\s\S]*?)<\/dc:title>/)
    if (titleMatch) title = cleanText(decodeXml(titleMatch[1])) || null
  }
  if (!title) title = sheetNames[0] || options.filename || null
  if (allBlocks.length === 0) warnings.push('XLSX contains no extractable text')

  return {
    parser: 'xlsx',
    title,
    pages,
    charCount: allBlocks.reduce((sum, block) => sum + block.text.length, 0),
    warnings,
  }
}

export const xlsxInternals = {
  decodeXml,
  parseSharedStrings,
  parseSheetNames,
  parseSheetRows,
  columnIndex,
}
