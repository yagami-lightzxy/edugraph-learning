import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { cleanText, deriveTitle, joinParts } from './text.js'

const ROW_TOLERANCE = 4
const REPEAT_MIN_CHARS = 2
const REPEAT_MAX_CHARS = 40
const SENTENCE_END = /[。！？!?；;：:]\s*$/
const HEADING_END = /[。！？!?；;]\s*$/

function resolvePdfjsAsset(directory) {
  try {
    const packagePath = fileURLToPath(import.meta.resolve('pdfjs-dist/package.json'))
    return path.join(path.dirname(packagePath), directory) + path.sep
  } catch {
    try {
      const require = createRequire(import.meta.url)
      const packagePath = require.resolve('pdfjs-dist/package.json')
      return path.join(path.dirname(packagePath), directory) + path.sep
    } catch {
      return undefined
    }
  }
}

const CMAP_URL = resolvePdfjsAsset('cmaps')
const STANDARD_FONT_URL = resolvePdfjsAsset('standard_fonts')

function round1(value) {
  return Math.round(value * 10) / 10
}

function modeByWeight(weights) {
  let best = null
  let bestWeight = -1
  for (const [value, weight] of weights) {
    if (weight > bestWeight || (weight === bestWeight && Number(value) > Number(best))) {
      best = value
      bestWeight = weight
    }
  }
  return best
}

function isLatinToken(ch) {
  return /[A-Za-z0-9.,;:!?)%\]}]/.test(ch)
}

function isLatinStart(ch) {
  return /[A-Za-z0-9(\\[{]/.test(ch)
}

function joinRowItems(items) {
  const ordered = items.slice().sort((a, b) => a.x - b.x)
  let text = ''
  let previousEnd = null
  let previousSize = 12

  for (const item of ordered) {
    const value = item.text.replace(/\s+/g, ' ').trim()
    if (!value) continue
    if (!text) {
      text = value
      previousEnd = item.x + item.width
      previousSize = item.fontSize
      continue
    }

    const gap = item.x - (previousEnd == null ? item.x : previousEnd)
    const last = text[text.length - 1]
    const first = value[0]
    const threshold = Math.max(1, Math.min(item.fontSize, previousSize) * 0.22)
    const needsSpace = gap > threshold && isLatinToken(last) && isLatinStart(first)

    if (needsSpace && !text.endsWith(' ')) text += ' '
    text += value
    previousEnd = item.x + item.width
    previousSize = item.fontSize
  }

  return cleanText(text)
}

function finalizeRow(rawRow) {
  const text = joinRowItems(rawRow.items)
  if (!text) return null

  const sizeWeights = new Map()
  let boldChars = 0
  let totalChars = 0
  let x0 = Infinity
  let x1 = -Infinity

  for (const item of rawRow.items) {
    const length = Math.max(1, item.text.trim().length)
    sizeWeights.set(item.fontSize, (sizeWeights.get(item.fontSize) || 0) + length)
    if (item.bold) boldChars += length
    totalChars += length
    x0 = Math.min(x0, item.x)
    x1 = Math.max(x1, item.x + item.width)
  }

  return {
    pageNo: rawRow.pageNo,
    y: rawRow.y,
    x0: Number.isFinite(x0) ? x0 : 0,
    x1: Number.isFinite(x1) ? x1 : 0,
    text,
    fontSize: modeByWeight(sizeWeights) || 12,
    bold: totalChars > 0 && boldChars / totalChars > 0.5,
  }
}

function buildPageRows(items, pageNo) {
  const ordered = items.slice().sort((a, b) => b.y - a.y || a.x - b.x)
  const groups = []

  for (const item of ordered) {
    const last = groups.length > 0 ? groups[groups.length - 1] : null
    if (last && Math.abs(last.y - item.y) <= ROW_TOLERANCE) last.items.push(item)
    else groups.push({ y: item.y, pageNo, items: [item] })
  }

  const rows = []
  for (const group of groups) {
    const row = finalizeRow(group)
    if (row) rows.push(row)
  }
  return rows
}

function itemSignature(item) {
  return cleanText(item.text) + '\u0001' + Math.round(item.y / 2) + '\u0001' + Math.round(item.fontSize)
}

function rowSignature(row) {
  return row.text
}

function pageThreshold(pageCount) {
  return Math.max(2, Math.ceil(pageCount * 0.5))
}

function sizeHeadingLevel(ratio) {
  if (ratio >= 2) return 1
  if (ratio >= 1.75) return 2
  if (ratio >= 1.5) return 3
  if (ratio >= 1.4) return 4
  if (ratio >= 1.3) return 5
  if (ratio >= 1.25) return 6
  return 0
}

function patternHeadingLevel(text) {
  const value = text.trim()
  if (value.length < 2 || value.length > 80) return 0
  if (HEADING_END.test(value)) return 0

  if (/^第\s*[一二三四五六七八九十百千万零〇\d]+\s*[章篇部]/.test(value)) return 1
  if (/^第\s*[一二三四五六七八九十百千万零〇\d]+\s*[节讲]/.test(value)) return 2
  if (/^(?:chapter|part)\s+(?:\d+|[IVXLCDM]+)\b/i.test(value)) return 1
  if (/^[一二三四五六七八九十]+[、.．]/.test(value)) return 2

  const numeric = value.match(/^(\d{1,3}(?:\.\d{1,3}){1,5})(?=[\s、.．:：\u4e00-\u9fff])(.+)$/)
  if (numeric) {
    const rest = numeric[2].replace(/^[\s、.．:：]+/, '').trim()
    const looksLikeTitle = /[\u4e00-\u9fff]/.test(rest) || /[A-Za-z]{3,}/.test(rest)
    if (looksLikeTitle) {
      const level = numeric[1].split('.').length
      return Math.min(6, Math.max(2, level))
    }
  }

  return 0
}

function isListRow(text) {
  const value = text.trim()
  if (/^[•·▪◦●○◆◇■□☐☑✓✔➢➤※]\s*\S/.test(value)) return true
  if (/^(?:[-–—*]|\d{1,3}[.)]|[a-zA-Z][.)]|[（(]\d{1,3}[）)])\s+\S/.test(value)) return true
  if (/^(?:\d{1,3}|[a-zA-Z])、\s*\S/.test(value)) return true
  return false
}

function isCaptionRow(text) {
  return /^(?:图|表|Figure|Fig\.?|Table)\s*[0-9一二三四五六七八九十]+(?:[.\-－—:：]|\s)/i.test(text.trim())
}

function detectHeadingLevel(row, bodySize) {
  if (bodySize > 0) {
    const ratio = row.fontSize / bodySize
    if (ratio >= 1.25 - 0.001) return sizeHeadingLevel(ratio)
  }
  return patternHeadingLevel(row.text)
}

function canMergeRows(previous, next) {
  if (!previous || !next) return false
  if (Math.abs(previous.fontSize - next.fontSize) > 0.6) return false
  if (SENTENCE_END.test(previous.text)) return false

  const gap = previous.y - next.y
  if (gap <= 0 || gap > 2.8 * Math.max(1, next.fontSize)) return false

  const indentDelta = next.x0 - previous.x0
  if (Math.abs(indentDelta) > Math.max(2, next.fontSize)) return false

  return true
}

function textItem(item) {
  const transform = item.transform
  if (!Array.isArray(transform) || transform.length < 6) return null
  const text = typeof item.str === 'string' ? item.str : ''
  if (!text.trim()) return null

  const x = Number(transform[4])
  const y = Number(transform[5])
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null

  const height = Number(item.height)
  const fontSize = round1(
    Number.isFinite(height) && height > 0 ? height : Math.hypot(Number(transform[2]) || 0, Number(transform[3]) || 0) || 12
  )
  const width = Number(item.width)
  const fontName = typeof item.fontName === 'string' ? item.fontName : ''

  return {
    text,
    x,
    y,
    width: Number.isFinite(width) ? Math.max(0, width) : 0,
    fontSize,
    bold: /bold|black|heavy|semibold|demi/i.test(fontName),
  }
}

function metadataTitle(info) {
  if (!info || typeof info.Title !== 'string') return ''
  const title = cleanText(info.Title)
  if (!title) return ''
  if (/^(?:untitled|无标题|幻灯片\s*\d+|slide\s*\d+|powerpoint presentation)$/i.test(title)) return ''
  return title
}

/**
 * Parse a PDF buffer into pages/blocks.
 * @param {Buffer|Uint8Array|ArrayBuffer} input
 * @param {{filename?: string}} [options]
 */
export async function parsePdf(input, options = {}) {
  let bytes
  if (input instanceof ArrayBuffer) bytes = new Uint8Array(input)
  else if (ArrayBuffer.isView(input)) bytes = new Uint8Array(input)
  else throw new TypeError('parsePdf expects a Buffer or Uint8Array')
  if (bytes.byteLength === 0) throw new Error('PDF buffer is empty')

  const warnings = []
  const params = {
    data: bytes,
    isEvalSupported: false,
    disableFontFace: true,
    useSystemFonts: false,
    cMapPacked: true,
    verbosity: 0,
  }
  if (CMAP_URL) params.cMapUrl = CMAP_URL
  if (STANDARD_FONT_URL && existsSync(STANDARD_FONT_URL)) params.standardFontDataUrl = STANDARD_FONT_URL

  let doc
  try {
    doc = await getDocument(params).promise
  } catch (error) {
    const message = error && error.message ? error.message : String(error)
    throw new Error('Unable to read PDF: ' + message)
  }

  const pageCount = doc.numPages
  const pagesItems = []
  let info = null

  try {
    try {
      const metadata = await doc.getMetadata()
      info = metadata && metadata.info ? metadata.info : null
    } catch {
      info = null
    }

    for (let pageNo = 1; pageNo <= pageCount; pageNo += 1) {
      let page
      try {
        page = await doc.getPage(pageNo)
        const content = await page.getTextContent()
        const items = []
        for (const rawItem of content.items) {
          const item = textItem(rawItem)
          if (item) items.push(item)
        }
        pagesItems.push({ pageNo, items })
      } catch (error) {
        const message = error && error.message ? error.message : String(error)
        if (warnings.length < 20) warnings.push('Page ' + pageNo + ': ' + message)
        pagesItems.push({ pageNo, items: [] })
      } finally {
        if (page && typeof page.cleanup === 'function') {
          try {
            page.cleanup()
          } catch {
            /* ignore cleanup errors */
          }
        }
      }
    }
  } finally {
    try {
      await doc.destroy()
    } catch {
      /* ignore destroy errors */
    }
  }

  const threshold = pageThreshold(pageCount)
  const itemPages = new Map()
  let textLayerChars = 0

  for (const page of pagesItems) {
    for (const item of page.items) {
      textLayerChars += cleanText(item.text).length
      if (item.text.length < REPEAT_MIN_CHARS || item.text.length >= REPEAT_MAX_CHARS) continue
      const key = itemSignature(item)
      let pages = itemPages.get(key)
      if (!pages) {
        pages = new Set()
        itemPages.set(key, pages)
      }
      pages.add(page.pageNo)
    }
  }

  const watermarkKeys = new Set()
  for (const [key, pages] of itemPages) {
    if (pages.size >= threshold) watermarkKeys.add(key)
  }

  let removedNoiseChars = 0
  const rowsByPage = []
  for (const page of pagesItems) {
    const kept = []
    for (const item of page.items) {
      if (watermarkKeys.has(itemSignature(item))) removedNoiseChars += cleanText(item.text).length
      else kept.push(item)
    }
    rowsByPage.push({ pageNo: page.pageNo, rows: buildPageRows(kept, page.pageNo) })
  }

  const repeatedTexts = repeatedRowTexts(rowsByPage, pageCount)

  const sizeWeights = new Map()
  for (const page of rowsByPage) {
    const keptRows = []
    for (const row of page.rows) {
      if (repeatedTexts.has(row.text)) {
        removedNoiseChars += row.text.length
        continue
      }
      keptRows.push(row)
      sizeWeights.set(row.fontSize, (sizeWeights.get(row.fontSize) || 0) + row.text.length)
    }
    page.rows = keptRows
  }
  const bodySize = modeByWeight(sizeWeights) || 12

  const pages = []
  const allBlocks = []
  let order = 0

  const addBlock = (pageNo, kind, text, extra = {}) => {
    const value = cleanText(text)
    if (!value) return null
    order += 1
    const block = { id: 'b' + order, kind, text: value, pageNo, order }
    if (extra.level) block.level = extra.level
    if (extra.style && Number.isFinite(extra.style.fontSize)) {
      block.style = { fontSize: round1(extra.style.fontSize) }
      if (extra.style.bold) block.style.bold = true
    }
    allBlocks.push(block)
    return block
  }

  for (const page of rowsByPage) {
    const pageBlocks = []
    let current = null

    const flush = () => {
      if (!current) return
      const block = addBlock(page.pageNo, 'paragraph', current.text, {
        style: { fontSize: current.firstRow.fontSize, bold: current.firstRow.bold },
      })
      if (block) pageBlocks.push(block)
      current = null
    }

    for (const row of page.rows) {
      const headingLevel = detectHeadingLevel(row, bodySize)
      if (headingLevel > 0) {
        flush()
        const block = addBlock(page.pageNo, 'heading', row.text, {
          level: Math.max(1, Math.min(6, headingLevel)),
          style: { fontSize: row.fontSize, bold: row.bold },
        })
        if (block) pageBlocks.push(block)
        continue
      }

      if (isListRow(row.text)) {
        flush()
        const block = addBlock(page.pageNo, 'list', row.text, {
          style: { fontSize: row.fontSize, bold: row.bold },
        })
        if (block) pageBlocks.push(block)
        continue
      }

      if (isCaptionRow(row.text)) {
        flush()
        const block = addBlock(page.pageNo, 'caption', row.text, {
          style: { fontSize: row.fontSize, bold: row.bold },
        })
        if (block) pageBlocks.push(block)
        continue
      }

      if (current && canMergeRows(current.lastRow, row)) {
        current.text = joinParts(current.text, row.text)
        current.lastRow = row
      } else {
        flush()
        current = {
          text: row.text,
          firstRow: row,
          lastRow: row,
        }
      }
    }
    flush()
    pages.push({ pageNo: page.pageNo, blocks: pageBlocks })
  }

  const contentChars = allBlocks.reduce((sum, block) => sum + block.text.length, 0)
  if (removedNoiseChars > 0) {
    warnings.push(
      'Removed ' +
        removedNoiseChars +
        ' characters of repeated header/footer/watermark text (' +
        pageCount +
        ' pages; ' +
        textLayerChars +
        ' text-layer chars, ' +
        contentChars +
        ' content chars remain)'
    )
  }
  if (allBlocks.length === 0) warnings.push('PDF contains no extractable text')

  const title = metadataTitle(info) || deriveTitle(allBlocks, options.filename)

  return {
    parser: 'pdf',
    title: title || null,
    pages,
    // Text-layer count (before repeated header/footer suppression). The blocks
    // themselves contain only the deduplicated content.
    charCount: textLayerChars,
    contentCharCount: contentChars,
    rawCharCount: textLayerChars,
    removedCharCount: removedNoiseChars,
    warnings,
  }
}

/**
 * Find visual lines that repeat on at least half of the pages.
 * Exported so the header/footer rule can be tested without a real PDF.
 * @param {Array<{pageNo:number, rows:Array<{text:string}>}>} rowsByPage
 * @param {number} pageCount
 * @returns {Set<string>}
 */
export function repeatedRowTexts(rowsByPage, pageCount) {
  const threshold = pageThreshold(pageCount)
  const occurrences = new Map()
  for (const page of rowsByPage) {
    for (const row of page.rows || []) {
      if (!row.text || row.text.length < REPEAT_MIN_CHARS || row.text.length >= REPEAT_MAX_CHARS) continue
      let pages = occurrences.get(row.text)
      if (!pages) {
        pages = new Set()
        occurrences.set(row.text, pages)
      }
      pages.add(page.pageNo)
    }
  }

  const repeated = new Set()
  for (const [text, pages] of occurrences) {
    if (pages.size >= threshold) repeated.add(text)
  }
  return repeated
}

// Exported for tests and reuse.
export const pdfInternals = {
  buildPageRows,
  canMergeRows,
  detectHeadingLevel,
  patternHeadingLevel,
  pageThreshold,
}
