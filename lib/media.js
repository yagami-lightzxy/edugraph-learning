/**
 * EduGraph AI · 图片与图示。
 *
 * 电路图有两种存在形式：
 *  1. 位图（扫描件、PPT 里贴的图片）—— 直接从文件里抽出来；
 *  2. 矢量绘制（PDF 里用线条画的三极管、波形）—— 必须把页面**渲染成图片**才看得见。
 *
 * 因此这里对 PDF 采取「按页渲染」：用 pdfjs 解析 + node-canvas 绘制，平时不渲染，
 * 只有用户点「看图示」或 Agent 调工具时才生成并缓存。node-canvas 是可选依赖，
 * 缺失时优雅降级为「无法生成插图」而不是让插件崩溃。
 */
import path from 'node:path'
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const FIGURE_SCALE = 1.6
const MAX_FIGURE_BYTES = 12 * 1024 * 1024

/** 读取 zip 里的媒体清单（DOCX/PPTX 复用解析器的解压实现）。 */
async function listOfficeMedia(filePath, prefixes) {
  const { readZip } = await import('./parse/zip.js')
  const buffer = await readFile(filePath)
  const entries = readZip(buffer)
  const media = []
  for (const [name, data] of entries) {
    if (!prefixes.some((prefix) => name.startsWith(prefix))) continue
    const ext = path.extname(name).toLowerCase()
    if (!['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.emf', '.wmf', '.svg'].includes(ext)) continue
    media.push({ name, ext, bytes: data })
  }
  return media
}

/** 惰性加载 canvas：缺依赖时返回 null，调用方给用户可读的解释。 */
let canvasModule
async function loadCanvas() {
  if (canvasModule !== undefined) return canvasModule
  try {
    canvasModule = await import('canvas')
  } catch {
    canvasModule = null
  }
  return canvasModule
}

/** PDF 单页渲染成 PNG。 */
export async function renderPdfPage(pdfPath, pageNo, { scale = FIGURE_SCALE } = {}) {
  const canvas = await loadCanvas()
  if (!canvas) {
    const error = new Error('缺少 canvas 依赖，无法把 PDF 页面渲染成图片。请在插件目录执行 npm install canvas 后重启 DSH。')
    error.code = 'canvas-missing'
    throw error
  }
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const data = new Uint8Array(await readFile(pdfPath))
  const doc = await getDocument({
    data, isEvalSupported: false, disableFontFace: true, useSystemFonts: false,
  }).promise
  try {
    const total = doc.numPages
    const target = Math.max(1, Math.min(total, Number(pageNo) || 1))
    const page = await doc.getPage(target)
    const viewport = page.getViewport({ scale })
    const surface = canvas.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const context = surface.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, surface.width, surface.height)
    await page.render({ canvasContext: context, viewport }).promise
    const png = surface.toBuffer('image/png')
    return { png, pageNo: target, total, width: surface.width, height: surface.height }
  } finally {
    await doc.destroy().catch(() => undefined)
  }
}

/** DOCX / PPTX 内嵌图片清单（不写盘，只给元信息）。 */
export async function listDocumentsMedia(filePath, ext) {
  const prefixes = ext === '.pptx' ? ['ppt/media/'] : ext === '.docx' ? ['word/media/'] : []
  if (!prefixes.length) return []
  const media = await listOfficeMedia(filePath, prefixes)
  return media.map((item, index) => ({
    index,
    name: path.basename(item.name),
    ext: item.ext,
    bytes: item.bytes.length,
  }))
}

/** 取某一张内嵌图片。 */
export async function readOfficeMedia(filePath, ext, index) {
  const prefixes = ext === '.pptx' ? ['ppt/media/'] : ext === '.docx' ? ['word/media/'] : []
  if (!prefixes.length) return null
  const media = await listOfficeMedia(filePath, prefixes)
  const item = media[Number(index)]
  if (!item) return null
  return { name: path.basename(item.name), ext: item.ext, bytes: item.bytes }
}

/** 图片扩展名 → MIME。 */
export function imageMime(ext) {
  switch (String(ext).toLowerCase()) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.gif': return 'image/gif'
    case '.webp': return 'image/webp'
    case '.bmp': return 'image/bmp'
    case '.svg': return 'image/svg+xml'
    default: return 'application/octet-stream'
  }
}

/**
 * 图示缓存：同一个文档同一页只渲染一次，落到 courses/<id>/figures/ 下。
 * @returns {Promise<{ file: string, mime: string }>}
 */
export async function ensurePageFigure({ courseId, documentId, sourcePath, sourceExt, pageNo, figureDir }) {
  await mkdir(figureDir, { recursive: true })
  const key = `${documentId}-p${Number(pageNo) || 1}`
  const cached = path.join(figureDir, key + '.png')
  if (existsSync(cached)) {
    const info = await stat(cached)
    if (info.size > 0) return { file: cached, mime: 'image/png', cached: true }
  }
  let buffer
  if (sourceExt === '.pdf') {
    const result = await renderPdfPage(sourcePath, pageNo)
    buffer = result.png
  } else if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'].includes(sourceExt)) {
    buffer = await readFile(sourcePath)
  } else {
    const media = await readOfficeMedia(sourcePath, sourceExt, Math.max(0, (Number(pageNo) || 1) - 1))
    if (!media) {
      const error = new Error('这份文档没有可显示的图片。')
      error.code = 'no-figure'
      throw error
    }
    buffer = media.bytes
    const target = path.join(figureDir, key + media.ext)
    await writeFile(target, buffer)
    return { file: target, mime: imageMime(media.ext), cached: false }
  }
  if (buffer.length > MAX_FIGURE_BYTES) {
    const error = new Error('这张图片太大，已跳过。')
    error.code = 'figure-too-large'
    throw error
  }
  await writeFile(cached, buffer)
  return { file: cached, mime: 'image/png', cached: false }
}
