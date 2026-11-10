import { parsePdf } from './pdf.js'
import { parseDocx } from './docx.js'
import { parsePptx } from './pptx.js'
import { parseXlsx } from './xlsx.js'
import { parseMarkdown, parseText, decodeText, cleanText, cleanCodeText } from './text.js'

const BLOCK_KINDS = new Set(['heading', 'paragraph', 'list', 'table', 'code', 'formula', 'caption'])

const EXTENSION_KINDS = {
  pdf: 'pdf',
  docx: 'docx',
  docm: 'docx',
  pptx: 'pptx',
  pptm: 'pptx',
  xlsx: 'xlsx',
  xlsm: 'xlsx',
  md: 'markdown',
  markdown: 'markdown',
  mdown: 'markdown',
  mkd: 'markdown',
  txt: 'text',
  text: 'text',
  log: 'text',
  csv: 'text',
  tsv: 'text',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  webp: 'image',
  gif: 'image',
}

const LEGACY_EXTENSIONS = {
  doc: 'Legacy Word .doc files are not supported. Convert the file to .docx and retry.',
  ppt: 'Legacy PowerPoint .ppt files are not supported. Convert the file to .pptx and retry.',
  xls: 'Legacy Excel .xls files are not supported. Convert the file to .xlsx and retry.',
  xlsb: 'Binary Excel .xlsb files are not supported. Convert the file to .xlsx and retry.',
}

const MIME_KINDS = new Map([
  ['application/pdf', 'pdf'],
  ['application/x-pdf', 'pdf'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
  ['application/vnd.ms-word.document.macroenabled.12', 'docx'],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'pptx'],
  ['application/vnd.ms-powerpoint.presentation.macroenabled.12', 'pptx'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx'],
  ['application/vnd.ms-excel.sheet.macroenabled.12', 'xlsx'],
  ['text/markdown', 'markdown'],
  ['text/x-markdown', 'markdown'],
  ['text/plain', 'text'],
  ['text/csv', 'text'],
  ['text/tab-separated-values', 'text'],
  ['image/png', 'image'],
  ['image/jpeg', 'image'],
  ['image/jpg', 'image'],
  ['image/webp', 'image'],
  ['image/gif', 'image'],
])

const LEGACY_MIME = new Map([
  ['application/msword', 'Legacy Word .doc files are not supported. Convert the file to .docx and retry.'],
  ['application/vnd.ms-powerpoint', 'Legacy PowerPoint .ppt files are not supported. Convert the file to .pptx and retry.'],
  ['application/vnd.ms-excel', 'Legacy Excel .xls files are not supported. Convert the file to .xlsx and retry.'],
  ['application/vnd.ms-excel.sheet.binary.macroenabled.12', 'Binary Excel .xlsb files are not supported. Convert the file to .xlsx and retry.'],
])

const PARSER_FOR_KIND = {
  pdf: 'pdf',
  docx: 'docx',
  pptx: 'pptx',
  xlsx: 'xlsx',
  markdown: 'markdown',
  text: 'text',
  image: 'image',
}

function basename(filename) {
  if (!filename) return ''
  return String(filename).split(/[\\/]/).pop() || ''
}

function extensionOf(filename) {
  const base = basename(filename)
  const dot = base.lastIndexOf('.')
  if (dot < 0 || dot === base.length - 1) return ''
  return base.slice(dot + 1).toLowerCase()
}

function stemOf(filename) {
  const base = basename(filename)
  const dot = base.lastIndexOf('.')
  return (dot > 0 ? base.slice(0, dot) : base).trim()
}

function normalizeMime(mimeType) {
  if (typeof mimeType !== 'string') return ''
  return mimeType.split(';')[0].trim().toLowerCase()
}

function detectionError(filename, mimeType) {
  const ext = extensionOf(filename)
  const mime = normalizeMime(mimeType)
  const details = []
  if (ext) details.push('.' + ext)
  if (mime) details.push(mime)
  if (details.length === 0) return 'Unsupported file type: no filename extension or MIME type was provided.'
  return (
    'Unsupported file type ' +
    details.join(' / ') +
    '. Supported formats: pdf, docx, pptx, xlsx, markdown, plain text and png/jpg/jpeg/webp/gif images.'
  )
}

function detectKind(filename, mimeType) {
  const ext = extensionOf(filename)
  if (ext && Object.prototype.hasOwnProperty.call(LEGACY_EXTENSIONS, ext)) {
    return { kind: 'unknown', error: LEGACY_EXTENSIONS[ext] }
  }
  if (ext && Object.prototype.hasOwnProperty.call(EXTENSION_KINDS, ext)) {
    return { kind: EXTENSION_KINDS[ext] }
  }

  const mime = normalizeMime(mimeType)
  if (mime && LEGACY_MIME.has(mime)) return { kind: 'unknown', error: LEGACY_MIME.get(mime) }
  if (mime && MIME_KINDS.has(mime)) return { kind: MIME_KINDS.get(mime) }

  return { kind: 'unknown', error: detectionError(filename, mimeType) }
}

function normalizeBuffer(buffer) {
  if (Buffer.isBuffer(buffer)) return buffer
  if (buffer instanceof ArrayBuffer) return Buffer.from(buffer)
  if (ArrayBuffer.isView(buffer)) return Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  if (typeof buffer === 'string') return buffer
  throw new TypeError('No file buffer provided')
}

function errorMessage(error) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (typeof error.message === 'string' && error.message.trim()) return error.message
  return String(error)
}

function failedResult(parser, error, warnings = []) {
  return {
    parser,
    status: 'failed',
    title: null,
    pages: [],
    charCount: 0,
    warnings: warnings.slice(),
    error: errorMessage(error),
  }
}

function sanitizeWarnings(value) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  const warnings = []
  for (const item of value) {
    const text = cleanText(item)
    if (!text || seen.has(text)) continue
    seen.add(text)
    warnings.push(text)
  }
  return warnings
}

function normalizeResult(parsed, parser, filename) {
  const sourcePages = parsed && Array.isArray(parsed.pages) ? parsed.pages : []
  const pages = []
  let order = 0
  let charCount = 0

  for (let pageIndex = 0; pageIndex < sourcePages.length; pageIndex += 1) {
    const sourcePage = sourcePages[pageIndex] || {}
    const pageNo =
      Number.isInteger(sourcePage.pageNo) && sourcePage.pageNo > 0 ? sourcePage.pageNo : pageIndex + 1
    const sourceBlocks = Array.isArray(sourcePage.blocks) ? sourcePage.blocks : []
    const blocks = []

    for (const sourceBlock of sourceBlocks) {
      if (!sourceBlock || typeof sourceBlock !== 'object') continue
      const kind = BLOCK_KINDS.has(sourceBlock.kind) ? sourceBlock.kind : 'paragraph'
      const text = kind === 'code' ? cleanCodeText(sourceBlock.text) : cleanText(sourceBlock.text)
      if (!text) continue

      order += 1
      const block = { id: 'b' + order, kind, text, pageNo, order }
      if (kind === 'heading') {
        const level = Number(sourceBlock.level)
        block.level = Number.isFinite(level) ? Math.min(6, Math.max(1, Math.round(level))) : 1
      }

      if (sourceBlock.style && typeof sourceBlock.style === 'object') {
        const style = {}
        const fontSize = Number(sourceBlock.style.fontSize)
        if (Number.isFinite(fontSize) && fontSize > 0) style.fontSize = Math.round(fontSize * 10) / 10
        if (sourceBlock.style.bold === true) style.bold = true
        if (Object.keys(style).length > 0) block.style = style
      }

      blocks.push(block)
      charCount += text.length
    }

    pages.push({ pageNo, blocks })
  }

  // PDF reports the full text-layer character count even though repeated
  // header/footer/watermark runs were dropped from the blocks.
  const declaredCharCount = Number(parsed && parsed.charCount)
  if (Number.isFinite(declaredCharCount) && declaredCharCount > charCount) charCount = declaredCharCount

  const title = parsed && parsed.title != null ? cleanText(parsed.title) || null : null
  return {
    parser,
    status: 'parsed',
    title,
    pages,
    charCount,
    warnings: sanitizeWarnings(parsed && parsed.warnings),
  }
}

function parseImage(filename, warnings) {
  const base = basename(filename)
  const caption = base || 'image'
  warnings.push('Image content was not parsed. Use a vision-capable tool to inspect the image.')
  return {
    parser: 'image',
    title: base ? stemOf(filename) || base : null,
    pages: [
      {
        pageNo: 1,
        blocks: [{ id: 'b1', kind: 'caption', text: caption, pageNo: 1, order: 1 }],
      },
    ],
    charCount: caption.length,
    warnings,
  }
}

/**
 * Parse an uploaded document into normalized pages and blocks.
 * This function never throws: every failure is returned as status "failed".
 * @param {{buffer?: Buffer|Uint8Array|ArrayBuffer|string, filename?: string, mimeType?: string}} input
 * @returns {Promise<{parser: string, status: string, title: string|null, pages: Array, charCount: number, warnings: string[], error?: string}>}
 */
export async function parseDocument(input) {
  const options = input && typeof input === 'object' ? input : {}
  const filename = typeof options.filename === 'string' ? options.filename : ''
  const mimeType = typeof options.mimeType === 'string' ? options.mimeType : ''

  let detection
  try {
    detection = detectKind(filename, mimeType)
  } catch (error) {
    return failedResult('unknown', 'Unable to detect file type: ' + errorMessage(error))
  }
  if (detection.kind === 'unknown') return failedResult('unknown', detection.error)

  const parser = PARSER_FOR_KIND[detection.kind]
  if (!parser) return failedResult('unknown', detectionError(filename, mimeType))

  try {
    const buffer = normalizeBuffer(options.buffer)
    let parsed

    if (detection.kind === 'image') {
      const warnings = []
      parsed = parseImage(filename, warnings)
    } else if (detection.kind === 'text' || detection.kind === 'markdown') {
      if (typeof buffer !== 'string' && buffer.length === 0) {
        parsed = {
          parser,
          title: stemOf(filename) || null,
          pages: [],
          charCount: 0,
          warnings: ['File is empty'],
        }
      } else {
        const text = typeof buffer === 'string' ? buffer : decodeText(buffer)
        parsed =
          detection.kind === 'markdown'
            ? parseMarkdown(text, { filename })
            : parseText(text, { filename })
      }
    } else if (detection.kind === 'pdf') {
      parsed = await parsePdf(buffer, { filename })
    } else if (detection.kind === 'docx') {
      parsed = parseDocx(buffer, { filename })
    } else if (detection.kind === 'pptx') {
      parsed = parsePptx(buffer, { filename })
    } else if (detection.kind === 'xlsx') {
      parsed = parseXlsx(buffer, { filename })
    } else {
      return failedResult('unknown', detectionError(filename, mimeType))
    }

    return normalizeResult(parsed, parser, filename)
  } catch (error) {
    return failedResult(parser, parser + ' parsing failed: ' + errorMessage(error))
  }
}

export const parserInternals = {
  detectKind,
  normalizeResult,
  extensionOf,
  normalizeMime,
}
