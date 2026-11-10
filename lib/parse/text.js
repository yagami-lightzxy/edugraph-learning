/**
 * Text cleanup + Markdown / plain-text document parsing.
 * Shared by every parser in this directory.
 */

const CJK_CHAR = /[\u2E80-\u303F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/
const CJK_CLOSE_PUNCT = /[，。！？；：、）》」』】〉〕］｝]/u
const CJK_OPEN_PUNCT = /[（《「『【〈〔［｛]/u
const LATIN_TOKEN_END = /[A-Za-z0-9@#$%&*+=<>/\\^_~|]$/
const LATIN_TOKEN_START = /^[A-Za-z0-9@#$%&*+=<>/\\^_~|]/

export function isCjkChar(ch) {
  return typeof ch === 'string' && ch.length > 0 && CJK_CHAR.test(ch)
}

/**
 * Join two text fragments without inventing spaces between CJK characters.
 * A space is only inserted when both sides are Latin/digit tokens.
 */
export function joinParts(left, right) {
  const a = left == null ? '' : String(left)
  const b = right == null ? '' : String(right)
  if (!a) return b
  if (!b) return a
  if (/\s$/.test(a) || /^\s/.test(b)) return a + b
  const last = a.slice(-1)
  const first = b.slice(0, 1)
  if (CJK_CHAR.test(last) || CJK_CHAR.test(first)) return a + b
  if (CJK_OPEN_PUNCT.test(last) || CJK_CLOSE_PUNCT.test(first)) return a + b
  if (LATIN_TOKEN_END.test(last) && LATIN_TOKEN_START.test(first)) return a + ' ' + b
  return a + b
}

/**
 * Normalize whitespace and strip dangerous control characters.
 * CJK punctuation is preserved; NUL/NBSP/zero-width and C1 controls are removed.
 */
export function cleanText(value) {
  if (value == null) return ''
  let text = String(value)
  text = text
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/[\u00A0\u3000]/g, ' ')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Do not leave whitespace glued to Chinese punctuation.
  text = text
    .replace(/\s+([，。！？；：、）》」』】〉〕］｝])/gu, '$1')
    .replace(/([，。！？；：、）》」』】〉〕］｝])\s+/gu, '$1')
    .replace(/([（《「『【〈〔［｛])\s+/gu, '$1')

  return text.trim()
}

/** Code-preserving cleanup: keep newlines, indentation and tabs. */
export function cleanCodeText(value) {
  if (value == null) return ''
  const text = String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')

  const lines = text.split('\n').map((line) => line.replace(/[ \t]+$/g, ''))
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function countReplacementChars(text) {
  let count = 0
  for (const ch of text) if (ch === '\uFFFD') count += 1
  return count
}

/**
 * Decode a text buffer. UTF-8 is the default; UTF-16 BOMs and a GBK fallback
 * keep Windows-authored Chinese notes readable.
 */
export function decodeText(input) {
  let buf
  if (Buffer.isBuffer(input)) buf = input
  else if (input instanceof ArrayBuffer) buf = Buffer.from(input)
  else if (ArrayBuffer.isView(input)) buf = Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  else if (typeof input === 'string') return input
  else return ''

  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString('utf8')
  }
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.subarray(2).toString('utf16le')
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    const swapped = Buffer.from(buf.subarray(2))
    swapped.swap16()
    return swapped.toString('utf16le')
  }

  let text = buf.toString('utf8')
  const bad = countReplacementChars(text)
  if (bad > 0) {
    try {
      const gbk = new TextDecoder('gbk', { fatal: false }).decode(buf)
      if (countReplacementChars(gbk) < bad) text = gbk
    } catch {
      /* ICU without GBK: keep UTF-8 output. */
    }
  }
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function stripInlineMarkdown(value) {
  let text = String(value == null ? '' : value)
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  text = text.replace(/\x60+([^\x60]+)\x60+/g, '$1')
  text = text.replace(/\*\*(.+?)\*\*/g, '$1')
  text = text.replace(/__(.+?)__/g, '$1')
  text = text.replace(/\*(.+?)\*/g, '$1')
  text = text.replace(/(?<![\p{L}\p{N}])_([^_]+?)_(?![\p{L}\p{N}])/gu, '$1')
  text = text.replace(/~~(.+?)~~/g, '$1')
  return text
}

function filenameStem(filename) {
  if (!filename) return null
  const base = String(filename).split(/[\\/]/).pop() || ''
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.slice(0, dot) : base
  return stem.trim() || null
}

export function deriveTitle(blocks, filename) {
  const heading = blocks.find((b) => b.kind === 'heading' && b.text)
  if (heading) return heading.text.slice(0, 300)
  const first = blocks.find((b) => b.text && b.kind !== 'table')
  if (first) return first.text.slice(0, 300)
  return filenameStem(filename)
}

/**
 * Pack blocks into virtual pages without ever splitting a block.
 * @param {Array<object>} blocks
 * @param {number} maxChars
 * @returns {Array<{pageNo:number, blocks:Array<object>}>}
 */
export function splitVirtualPages(blocks, maxChars = 1800) {
  const pages = []
  let current = []
  let currentChars = 0

  for (const block of blocks) {
    const length = block.text.length
    if (current.length > 0 && currentChars + length > maxChars) {
      pages.push(current)
      current = []
      currentChars = 0
    }
    current.push(block)
    currentChars += length
  }
  if (current.length > 0) pages.push(current)

  return pages.map((items, index) => {
    const pageNo = index + 1
    return {
      pageNo,
      blocks: items.map((block) => ({ ...block, pageNo })),
    }
  })
}

function isTableSeparator(line) {
  const trimmed = String(line).trim()
  if (!trimmed.includes('|')) return false
  const body = trimmed.replace(/^\|/, '').replace(/\|$/, '').trim()
  if (!body) return false
  const cells = body.split('|').map((cell) => cell.trim())
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function parseTableRow(line) {
  let body = String(line).trim()
  if (body.startsWith('|')) body = body.slice(1)
  if (body.endsWith('|')) body = body.slice(0, -1)
  const cells = body
    .split(/(?<!\\)\|/)
    .map((cell) => cleanText(stripInlineMarkdown(cell.replace(/\\\|/g, '|'))))
  while (cells.length > 0 && cells[cells.length - 1] === '') cells.pop()
  return cells
}

function isHorizontalRule(line) {
  return /^\s{0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(line)
}

/**
 * Markdown parser: headings, fenced code, lists, tables, blockquotes, paragraphs.
 * @param {string} source
 * @param {{filename?: string}} [options]
 */
export function parseMarkdown(source, options = {}) {
  const text = String(source == null ? '' : source).replace(/\r\n?/g, '\n')
  const lines = text.split('\n')
  const blocks = []
  const warnings = []
  let order = 0

  const push = (kind, raw, extra = {}) => {
    const value = kind === 'code' ? cleanCodeText(raw) : cleanText(raw)
    if (!value) return
    order += 1
    blocks.push({ id: 'b' + order, kind, text: value, pageNo: 1, order, ...extra })
  }

  let paragraph = []
  const flushParagraph = () => {
    if (paragraph.length === 0) return
    let merged = ''
    for (const line of paragraph) merged = joinParts(merged, line.trim())
    paragraph = []
    push('paragraph', stripInlineMarkdown(merged))
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    // Fenced code block.
    const fence = line.match(/^\s{0,3}(\x60{3,}|~{3,})\s*([\w+#.-]*)\s*$/)
    if (fence) {
      flushParagraph()
      const marker = fence[1][0]
      const minLength = fence[1].length
      const body = []
      let closed = false
      for (i += 1; i < lines.length; i += 1) {
        const candidate = lines[i]
        const closing = candidate.match(/^\s{0,3}(\x60+|~+)\s*$/)
        if (closing && closing[1][0] === marker && closing[1].length >= minLength) {
          closed = true
          break
        }
        body.push(candidate)
      }
      if (!closed) warnings.push('Unclosed code fence near line ' + (i + 1))
      push('code', body.join('\n'))
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      continue
    }

    // ATX heading.
    const heading = line.match(/^\s{0,3}(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/)
    if (heading) {
      flushParagraph()
      push('heading', stripInlineMarkdown(heading[2]), { level: heading[1].length })
      continue
    }

    // Setext heading (underline style).
    if (i + 1 < lines.length && /^\s{0,3}(=+|-+)\s*$/.test(lines[i + 1]) && !isTableSeparator(lines[i + 1])) {
      flushParagraph()
      const level = lines[i + 1].trim()[0] === '=' ? 1 : 2
      push('heading', stripInlineMarkdown(line), { level })
      i += 1
      continue
    }

    // GitHub-style table. A separator row is optional when every line is
    // wrapped in pipes (the "| a | b |" form from the contract).
    const trimmedLine = line.trim()
    const nextIsSeparator = i + 1 < lines.length && isTableSeparator(lines[i + 1])
    const pipeWrapped = trimmedLine.startsWith('|') && trimmedLine.endsWith('|') && trimmedLine.split('|').length >= 3
    if (line.includes('|') && (nextIsSeparator || pipeWrapped)) {
      flushParagraph()
      const headerCells = parseTableRow(line)
      if (headerCells.some(Boolean)) push('table', headerCells.join(' | '))
      let cursor = i + 1
      if (cursor < lines.length && isTableSeparator(lines[cursor])) cursor += 1
      for (; cursor < lines.length; cursor += 1) {
        const rowLine = lines[cursor]
        if (!rowLine.trim()) break
        if (isTableSeparator(rowLine)) continue
        const trimmedRow = rowLine.trim()
        if (!trimmedRow.includes('|')) break
        if (!nextIsSeparator && !(trimmedRow.startsWith('|') && trimmedRow.endsWith('|'))) break
        const cells = parseTableRow(rowLine)
        if (cells.some(Boolean)) push('table', cells.join(' | '))
      }
      i = cursor - 1
      continue
    }

    if (isHorizontalRule(line)) {
      flushParagraph()
      continue
    }

    const list = line.match(/^\s{0,3}(?:[-*+]|\d{1,3}[.)])[ \t]+(.+)$/)
    if (list) {
      flushParagraph()
      push('list', stripInlineMarkdown(list[1]))
      continue
    }

    const quote = line.match(/^\s{0,3}>\s?(.*)$/)
    if (quote) {
      paragraph.push(quote[1])
      continue
    }

    paragraph.push(line)
  }
  flushParagraph()

  return {
    parser: 'markdown',
    title: deriveTitle(blocks, options.filename),
    pages: splitVirtualPages(blocks),
    charCount: blocks.reduce((sum, block) => sum + block.text.length, 0),
    warnings,
  }
}

/**
 * Plain-text parser: blank-line separated paragraphs, ~1800-char virtual pages.
 * @param {string} source
 * @param {{filename?: string}} [options]
 */
export function parseText(source, options = {}) {
  const text = String(source == null ? '' : source).replace(/\r\n?/g, '\n')
  const paragraphs = text.split(/\n[ \t]*\n+/)
  const blocks = []
  let order = 0

  for (const rawParagraph of paragraphs) {
    if (!rawParagraph.trim()) continue
    let merged = ''
    for (const line of rawParagraph.split('\n')) merged = joinParts(merged, line.trim())
    const value = cleanText(merged)
    if (!value) continue
    order += 1
    blocks.push({ id: 'b' + order, kind: 'paragraph', text: value, pageNo: 1, order })
  }

  const title = blocks.length > 0 ? blocks[0].text.slice(0, 300) : filenameStem(options.filename)
  return {
    parser: 'text',
    title,
    pages: splitVirtualPages(blocks),
    charCount: blocks.reduce((sum, block) => sum + block.text.length, 0),
    warnings: [],
  }
}
