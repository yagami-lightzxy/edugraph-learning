import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { deflateRawSync } from 'node:zlib'
import { parseDocument } from '../lib/parse/index.js'
import { readZip, readZipText } from '../lib/parse/zip.js'
import { repeatedRowTexts } from '../lib/parse/pdf.js'
import { cleanText } from '../lib/parse/text.js'

// 真实 PDF 是可选验收：用环境变量指向本机文件；公开仓库不提交个人路径。
const PDF_PATH = process.env.EDUGRAPH_REAL_PDF || ''
const HAS_PDF = Boolean(PDF_PATH) && existsSync(PDF_PATH)
const BACKTICKS = String.fromCharCode(96).repeat(3)

let crcTable = null
function crc32(buffer) {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n += 1) {
      let c = n
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * Build a minimal but spec-compliant ZIP buffer (stored or deflate).
 * This exercises our hand-written central-directory reader in both modes.
 */
function makeZip(files, options = {}) {
  const compress = options.compress === true
  const entries = []
  const localParts = []
  let offset = 0

  for (const [name, content] of Object.entries(files)) {
    const nameBuffer = Buffer.from(name, 'utf8')
    const raw = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8')
    const method = compress ? 8 : 0
    const data = compress ? deflateRawSync(raw) : raw
    const checksum = crc32(raw)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0x21, 12)
    local.writeUInt32LE(checksum, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(raw.length, 22)
    local.writeUInt16LE(nameBuffer.length, 26)
    local.writeUInt16LE(0, 28)

    localParts.push(local, nameBuffer, data)
    entries.push({
      nameBuffer,
      method,
      checksum,
      compressedSize: data.length,
      rawSize: raw.length,
      offset,
    })
    offset += local.length + nameBuffer.length + data.length
  }

  const centralParts = []
  for (const entry of entries) {
    const header = Buffer.alloc(46)
    header.writeUInt32LE(0x02014b50, 0)
    header.writeUInt16LE(20, 4)
    header.writeUInt16LE(20, 6)
    header.writeUInt16LE(0, 8)
    header.writeUInt16LE(entry.method, 10)
    header.writeUInt16LE(0, 12)
    header.writeUInt16LE(0x21, 14)
    header.writeUInt32LE(entry.checksum, 16)
    header.writeUInt32LE(entry.compressedSize, 20)
    header.writeUInt32LE(entry.rawSize, 24)
    header.writeUInt16LE(entry.nameBuffer.length, 28)
    header.writeUInt16LE(0, 30)
    header.writeUInt16LE(0, 32)
    header.writeUInt16LE(0, 34)
    header.writeUInt16LE(0, 36)
    header.writeUInt32LE(0, 38)
    header.writeUInt32LE(entry.offset, 42)
    centralParts.push(header, entry.nameBuffer)
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(entries.length, 8)
  eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralSize, 12)
  eocd.writeUInt32LE(offset, 16)

  return Buffer.concat([...localParts, ...centralParts, eocd])
}

function makeDocx() {
  const documentXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>',
    '<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>Course Notes</w:t></w:r></w:p>',
    '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Chapter One</w:t></w:r></w:p>',
    '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>Section A</w:t></w:r></w:p>',
    '<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Bold lead</w:t></w:r><w:r><w:t xml:space="preserve"> and normal tail</w:t></w:r></w:p>',
    '<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>List item</w:t></w:r></w:p>',
    '<w:tbl>',
    '<w:tr><w:tc><w:p><w:r><w:t>A1</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>B1</w:t></w:r></w:p></w:tc></w:tr>',
    '<w:tr><w:tc><w:p><w:r><w:t>A2</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>B2</w:t></w:r></w:p></w:tc></w:tr>',
    '</w:tbl>',
    '</w:body></w:document>',
  ].join('\n')
  return makeZip({ 'word/document.xml': documentXml }, { compress: true })
}

function makePptx() {
  const slide1 = [
    '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>',
    '<p:sp><p:nvSpPr><p:cNvPr id="1" name="Title 1"/><p:cNvSpPr/><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>Slide One</a:t></a:r></a:p></p:txBody></p:sp>',
    '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Body 1"/><p:cNvSpPr/><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>First bullet</a:t></a:r></a:p><a:p><a:r><a:t>Second paragraph</a:t></a:r></a:p></p:txBody></p:sp>',
    '</p:spTree></p:cSld></p:sld>',
  ].join('\n')
  const slide2 = [
    '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>',
    '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Title 2"/><p:cNvSpPr/><p:nvPr><p:ph type="ctrTitle"/></p:nvPr></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>Slide Two</a:t></a:r></a:p></p:txBody></p:sp>',
    '<p:sp><p:nvSpPr><p:cNvPr id="4" name="Body 2"/><p:cNvSpPr/><p:nvPr><p:ph type="body"/></p:nvPr></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>Body of slide two</a:t></a:r></a:p></p:txBody></p:sp>',
    '</p:spTree></p:cSld></p:sld>',
  ].join('\n')
  const notes1 = [
    '<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>',
    '<p:sp><p:nvSpPr><p:cNvPr id="5" name="Notes"/><p:cNvSpPr/><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>Speaker note</a:t></a:r></a:p></p:txBody></p:sp>',
    '<p:sp><p:nvSpPr><p:cNvPr id="6" name="Number"/><p:cNvSpPr/><p:nvPr><p:ph type="sldNum"/></p:nvPr></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>1</a:t></a:r></a:p></p:txBody></p:sp>',
    '</p:spTree></p:cSld></p:notes>',
  ].join('\n')
  return makeZip(
    {
      'ppt/slides/slide1.xml': slide1,
      'ppt/slides/slide2.xml': slide2,
      'ppt/notesSlides/notesSlide1.xml': notes1,
    },
    { compress: true }
  )
}

function makeXlsx() {
  const workbook = [
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
    '<sheets><sheet name="Grades" sheetId="1" r:id="rId1"/></sheets></workbook>',
  ].join('\n')
  const shared = [
    '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    '<si><t>Name</t></si><si><t>Score</t></si><si><t>Alice</t></si></sst>',
  ].join('\n')
  const sheet = [
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>',
    '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>',
    '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="C2"><v>95</v></c></row>',
    '<row r="4"><c r="A4" t="inlineStr"><is><t>Inline</t></is></c></row>',
    '</sheetData></worksheet>',
  ].join('\n')
  return makeZip(
    {
      'xl/workbook.xml': workbook,
      'xl/sharedStrings.xml': shared,
      'xl/worksheets/sheet1.xml': sheet,
    },
    { compress: true }
  )
}

test('zip reader handles stored and deflated entries', () => {
  for (const compress of [false, true]) {
    const zip = makeZip(
      {
        'hello.txt': 'Hello 世界',
        'nested/note.txt': 'A'.repeat(500),
      },
      { compress }
    )
    const files = readZip(zip)
    assert.equal(files.get('hello.txt').toString('utf8'), 'Hello 世界')
    assert.equal(files.get('nested/note.txt').toString('utf8'), 'A'.repeat(500))

    const texts = readZipText(zip)
    assert.equal(texts.get('hello.txt'), 'Hello 世界')
    assert.equal(texts.size, 2)
  }
})

test('docx parser maps heading levels, bold runs, lists and tables', async () => {
  const result = await parseDocument({
    buffer: makeDocx(),
    filename: 'notes.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  assert.equal(result.status, 'parsed')
  assert.equal(result.parser, 'docx')
  assert.equal(result.pages.length, 1)
  assert.equal(result.title, 'Course Notes')

  const blocks = result.pages[0].blocks
  const headings = blocks.filter((block) => block.kind === 'heading')
  assert.deepEqual(
    headings.map((block) => [block.text, block.level]),
    [
      ['Course Notes', 1],
      ['Chapter One', 1],
      ['Section A', 2],
    ]
  )

  const bold = blocks.find((block) => block.text.indexOf('Bold lead') === 0)
  assert.ok(bold)
  assert.equal(bold.kind, 'paragraph')
  assert.equal(bold.text, 'Bold lead and normal tail')
  assert.equal(bold.style.bold, true)

  assert.equal(blocks.find((block) => block.text === 'List item').kind, 'list')
  assert.deepEqual(
    blocks.filter((block) => block.kind === 'table').map((block) => block.text),
    ['A1 | B1', 'A2 | B2']
  )
  assert.equal(blocks.at(-1).kind, 'table')
})

test('pptx parser makes one page per slide with title heading and notes caption', async () => {
  const result = await parseDocument({
    buffer: makePptx(),
    filename: 'lesson.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  })
  assert.equal(result.status, 'parsed')
  assert.equal(result.parser, 'pptx')
  assert.equal(result.pages.length, 2)
  assert.equal(result.title, 'Slide One')

  const firstHeading = result.pages[0].blocks.find((block) => block.kind === 'heading')
  assert.equal(firstHeading.text, 'Slide One')
  assert.equal(firstHeading.level, 1)
  assert.ok(result.pages[0].blocks.some((block) => block.text === 'First bullet'))
  assert.ok(result.pages[0].blocks.some((block) => block.kind === 'caption' && block.text === 'Speaker note'))
  assert.equal(result.pages[1].blocks.find((block) => block.kind === 'heading').text, 'Slide Two')
  assert.ok(result.pages[1].blocks.some((block) => block.text === 'Body of slide two'))
})

test('markdown parser recognizes heading, fenced code, table and list', async () => {
  const markdown = [
    '# Lesson One',
    '',
    'Intro **bold** paragraph.',
    '',
    '## Code',
    '',
    BACKTICKS + 'js',
    'const x = 1',
    '  indented',
    BACKTICKS,
    '',
    '| Key | Value |',
    '| --- | --- |',
    '| a | 1 |',
    '',
    '- first item',
    '- second item',
  ].join('\n')

  const result = await parseDocument({
    buffer: Buffer.from(markdown, 'utf8'),
    filename: 'lesson.md',
    mimeType: 'text/markdown',
  })
  assert.equal(result.status, 'parsed')
  assert.equal(result.parser, 'markdown')
  assert.equal(result.title, 'Lesson One')

  const blocks = result.pages.flatMap((page) => page.blocks)
  assert.equal(blocks[0].kind, 'heading')
  assert.equal(blocks[0].level, 1)
  assert.equal(blocks[1].text, 'Intro bold paragraph.')

  const code = blocks.find((block) => block.kind === 'code')
  assert.ok(code)
  assert.equal(code.text, 'const x = 1\n  indented')

  assert.deepEqual(
    blocks.filter((block) => block.kind === 'table').map((block) => block.text),
    ['Key | Value', 'a | 1']
  )
  assert.deepEqual(
    blocks.filter((block) => block.kind === 'list').map((block) => block.text),
    ['first item', 'second item']
  )
  assert.equal(blocks.at(-1).pageNo, 1)
})

test('markdown virtual pages split near 1800 chars without splitting blocks', async () => {
  const paragraphs = []
  for (let i = 0; i < 12; i += 1) {
    paragraphs.push('Paragraph ' + i + ' ' + 'word '.repeat(60).trim())
  }
  const markdown = paragraphs.join('\n\n')
  const result = await parseDocument({
    buffer: Buffer.from(markdown, 'utf8'),
    filename: 'long.md',
    mimeType: 'text/markdown',
  })

  assert.equal(result.status, 'parsed')
  assert.ok(result.pages.length > 1)
  const seenIds = new Set()
  let expectedOrder = 1
  for (const page of result.pages) {
    const pageChars = page.blocks.reduce((sum, block) => sum + block.text.length, 0)
    assert.ok(pageChars <= 1800, 'page ' + page.pageNo + ' has ' + pageChars + ' chars')
    for (const block of page.blocks) {
      assert.equal(block.pageNo, page.pageNo)
      assert.equal(block.order, expectedOrder)
      assert.ok(!seenIds.has(block.id))
      seenIds.add(block.id)
      expectedOrder += 1
    }
  }
  assert.equal(result.pages.flatMap((page) => page.blocks).length, 12)
})

test('unknown and legacy types fail without throwing', async () => {
  const unknown = await parseDocument({ buffer: Buffer.from('nope'), filename: 'archive.rar' })
  assert.equal(unknown.status, 'failed')
  assert.equal(unknown.parser, 'unknown')
  assert.match(unknown.error, /Unsupported file type/)
  assert.deepEqual(unknown.pages, [])

  const legacy = await parseDocument({ buffer: Buffer.from('nope'), filename: 'old.doc' })
  assert.equal(legacy.status, 'failed')
  assert.equal(legacy.parser, 'unknown')
  assert.match(legacy.error, /Legacy Word/)
})

test('repeated header/footer rows are detected across pages', () => {
  const pages = []
  for (let i = 0; i < 6; i += 1) {
    pages.push({
      pageNo: i + 1,
      rows: [
        { text: 'ACME Corp - Confidential' },
        { text: 'Content line ' + i },
        { text: 'x'.repeat(45) },
      ],
    })
  }
  const repeated = repeatedRowTexts(pages, 6)
  assert.ok(repeated.has('ACME Corp - Confidential'))
  assert.ok(!repeated.has('Content line 0'))
  assert.ok(!repeated.has('x'.repeat(45)), 'lines of 40+ chars must not be dropped')
})

test('text cleaning removes NUL/NBSP and preserves Chinese punctuation', () => {
  const dirty = 'A' + String.fromCharCode(0) + 'B' + String.fromCharCode(0xa0) + '  C 中文 ， 测试。'
  assert.equal(cleanText(dirty), 'AB C 中文，测试。')
})

test('image files become a caption page with a warning', async () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const result = await parseDocument({ buffer: pngHeader, filename: 'diagram.png', mimeType: 'image/png' })
  assert.equal(result.status, 'parsed')
  assert.equal(result.parser, 'image')
  assert.equal(result.pages.length, 1)
  assert.equal(result.pages[0].blocks[0].kind, 'caption')
  assert.equal(result.pages[0].blocks[0].text, 'diagram.png')
  assert.ok(result.warnings.some((warning) => /vision/i.test(warning)))
})

test('xlsx parser resolves shared strings and keeps column gaps', async () => {
  const result = await parseDocument({
    buffer: makeXlsx(),
    filename: 'grades.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  assert.equal(result.status, 'parsed')
  assert.equal(result.parser, 'xlsx')
  assert.equal(result.pages.length, 1)
  assert.equal(result.title, 'Grades')
  assert.deepEqual(
    result.pages[0].blocks.map((block) => block.text),
    ['Name | Score', 'Alice | | 95', 'Inline']
  )
  assert.ok(result.pages[0].blocks.every((block) => block.kind === 'table'))
})

test('docx missing word/document.xml fails gracefully', async () => {
  const broken = makeZip({ 'word/styles.xml': '<styles/>' }, { compress: true })
  const result = await parseDocument({ buffer: broken, filename: 'broken.docx' })
  assert.equal(result.status, 'failed')
  assert.equal(result.parser, 'docx')
  assert.match(result.error, /missing word\/document\.xml/)
})

test('plain text parser keeps paragraphs and virtual pages', async () => {
  const result = await parseDocument({
    buffer: Buffer.from('First line\nsecond line\n\nSecond paragraph', 'utf8'),
    filename: 'notes.txt',
    mimeType: 'text/plain',
  })
  assert.equal(result.status, 'parsed')
  assert.equal(result.parser, 'text')
  assert.deepEqual(
    result.pages[0].blocks.map((block) => block.text),
    ['First line second line', 'Second paragraph']
  )
  assert.equal(result.title, 'First line second line')

  const long = [('word '.repeat(300)).trim(), ('term '.repeat(300)).trim()].join('\n\n')
  const longResult = await parseDocument({
    buffer: Buffer.from(long, 'utf8'),
    filename: 'long.txt',
    mimeType: 'text/plain',
  })
  assert.ok(longResult.pages.length > 1)
  assert.ok(longResult.pages.every((page) => page.blocks.length >= 1))
})

test('markdown pipe table works without a separator row', async () => {
  const result = await parseDocument({
    buffer: Buffer.from('| A | B |\n| 1 | 2 |\n', 'utf8'),
    filename: 'table.md',
    mimeType: 'text/markdown',
  })
  assert.deepEqual(
    result.pages.flatMap((page) => page.blocks).filter((block) => block.kind === 'table').map((block) => block.text),
    ['A | B', '1 | 2']
  )
})

test('corrupt PDF and missing buffer fail without throwing', async () => {
  const corrupt = await parseDocument({ buffer: Buffer.from('not a pdf'), filename: 'bad.pdf' })
  assert.equal(corrupt.status, 'failed')
  assert.equal(corrupt.parser, 'pdf')
  assert.ok(corrupt.error)

  const missing = await parseDocument({ filename: 'bad.pdf' })
  assert.equal(missing.status, 'failed')
  assert.equal(missing.parser, 'pdf')
  assert.ok(missing.error)
})

test('real PDF parses all pages with headings', { skip: HAS_PDF ? false : 'real PDF fixture not found' }, async () => {
  const buffer = await readFile(PDF_PATH)
  const started = Date.now()
  const result = await parseDocument({ buffer, filename: '模电笔记.pdf', mimeType: 'application/pdf' })
  const elapsed = Date.now() - started
  const blocks = result.pages.flatMap((page) => page.blocks)
  const headings = blocks.filter((block) => block.kind === 'heading')
  const contentChars = blocks.reduce((sum, block) => sum + block.text.length, 0)

  console.log(
    '[real PDF] pages=' + result.pages.length +
      ' headings=' + headings.length +
      ' charCount=' + result.charCount +
      ' blockChars=' + contentChars +
      ' blocks=' + blocks.length +
      ' ms=' + elapsed
  )

  assert.equal(result.status, 'parsed')
  assert.equal(result.parser, 'pdf')
  assert.equal(result.pages.length, 97)
  assert.ok(headings.length > 0)
  assert.ok(blocks.length > 1000)
  assert.ok(result.charCount > 80000)
  assert.ok(contentChars > 30000)
  assert.equal(result.pages[0].pageNo, 1)
  assert.equal(result.pages[96].pageNo, 97)
  assert.ok(headings.every((block) => block.level >= 1 && block.level <= 6))
  assert.ok(!blocks.some((block) => block.text.indexOf('中国大学MOOC') >= 0))
  assert.ok(result.warnings.some((warning) => /Removed .*watermark/.test(warning)))
  assert.ok(blocks.every((block) => block.id && block.text && block.pageNo >= 1 && block.order >= 1))
  const ids = new Set(blocks.map((block) => block.id))
  assert.equal(ids.size, blocks.length)
})
