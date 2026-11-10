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

function extractParagraphText(xml) {
  const tokenRe = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>|<a:br\b[^>]*\/>|<a:tab\b[^>]*\/>/g
  let text = ''
  let match
  while ((match = tokenRe.exec(xml)) !== null) {
    if (match[1] !== undefined) text += decodeXml(match[1])
    else if (match[0].indexOf('<a:br') === 0 || match[0].indexOf('<a:tab') === 0) text += ' '
  }
  return text
}

function paragraphs(xml) {
  const list = []
  const paragraphRe = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g
  let match
  while ((match = paragraphRe.exec(xml)) !== null) {
    const raw = extractParagraphText(match[1])
    const text = cleanText(raw)
    if (!text) continue
    list.push({ text })
  }
  return list
}

function shapeIsTitle(shapeXml) {
  return /<p:ph\b[^>]*\btype\s*=\s*["'](?:title|ctrTitle)["']/.test(shapeXml)
}

function shapeIsSlideNumber(shapeXml) {
  return /<p:ph\b[^>]*\btype\s*=\s*["']sldNum["']/.test(shapeXml)
}

function collectSlideBlocks(slideXml) {
  const blocks = []
  const shapeRe = /<p:sp\b[^>]*>[\s\S]*?<\/p:sp>/g
  let match
  while ((match = shapeRe.exec(slideXml)) !== null) {
    const shape = match[0]
    const title = shapeIsTitle(shape)
    for (const paragraph of paragraphs(shape)) {
      blocks.push({
        kind: title ? 'heading' : 'paragraph',
        text: paragraph.text,
        level: title ? 1 : 0,
      })
    }
  }
  return blocks
}

function extractNotes(notesXml) {
  if (!notesXml) return ''
  let cleaned = notesXml
  const shapeRe = /<p:sp\b[^>]*>[\s\S]*?<\/p:sp>/g
  let match
  const parts = []
  while ((match = shapeRe.exec(notesXml)) !== null) {
    if (shapeIsSlideNumber(match[0])) continue
    for (const paragraph of paragraphs(match[0])) parts.push(paragraph.text)
  }
  if (parts.length === 0) {
    const textRe = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g
    while ((match = textRe.exec(cleaned)) !== null) {
      const text = cleanText(decodeXml(match[1]))
      if (text && !/^\d+$/.test(text)) parts.push(text)
    }
  }
  return cleanText(parts.join(' '))
}

/**
 * Parse a PPTX buffer. One slide maps to one page.
 * @param {Buffer|Uint8Array|ArrayBuffer} input
 * @param {{filename?: string}} [options]
 */
export function parsePptx(input, options = {}) {
  const files = readZip(input)
  const slideEntries = []
  for (const name of files.keys()) {
    const match = name.match(/^ppt\/slides\/slide(\d+)\.xml$/)
    if (match) slideEntries.push({ name, number: Number(match[1]) })
  }
  slideEntries.sort((a, b) => a.number - b.number)
  if (slideEntries.length === 0) throw new Error('PPTX: no slides found')

  const warnings = []
  const pages = []
  const allBlocks = []
  let order = 0

  for (let index = 0; index < slideEntries.length; index += 1) {
    const entry = slideEntries[index]
    const pageNo = index + 1
    const slideXml = textEntry(files, entry.name) || ''
    let slideBlocks = []
    try {
      slideBlocks = collectSlideBlocks(slideXml)
    } catch (error) {
      const message = error && error.message ? error.message : String(error)
      warnings.push('Slide ' + entry.number + ': ' + message)
    }

    const pageBlocks = []
    for (const info of slideBlocks) {
      order += 1
      const block = {
        id: 'b' + order,
        kind: info.kind,
        text: info.text,
        pageNo,
        order,
      }
      if (info.kind === 'heading') block.level = Math.max(1, Math.min(6, info.level || 1))
      pageBlocks.push(block)
      allBlocks.push(block)
    }

    const notesXml = textEntry(files, 'ppt/notesSlides/notesSlide' + entry.number + '.xml')
    const notes = extractNotes(notesXml)
    if (notes) {
      order += 1
      const block = { id: 'b' + order, kind: 'caption', text: notes, pageNo, order }
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
  if (!title) title = deriveTitle(allBlocks, options.filename)
  if (allBlocks.length === 0) warnings.push('PPTX contains no extractable text')

  return {
    parser: 'pptx',
    title,
    pages,
    charCount: allBlocks.reduce((sum, block) => sum + block.text.length, 0),
    warnings,
  }
}

export const pptxInternals = {
  decodeXml,
  extractParagraphText,
  collectSlideBlocks,
  extractNotes,
}
