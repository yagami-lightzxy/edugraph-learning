/**
 * EduGraph AI · 通用工具：ID、稳定哈希、文本规整、原子 JSON 读写、异步锁。
 * 不依赖任何第三方包，便于在 DSH 宿主进程内直接运行。
 */
import { mkdir, readFile, rename, writeFile, rm, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

/** 生成短 ID：前缀 + 8 位随机十六进制。 */
export function newId(prefix = 'x') {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`
}

/** 稳定哈希（十六进制前 16 位），用于去重键与内容指纹。 */
export function stableHash(input) {
  return crypto.createHash('sha1').update(String(input)).digest('hex').slice(0, 16)
}

/** 中英文混排的规整：保留标点，压缩空白。 */
export function normalizeText(text) {
  return String(text ?? '')
    .replace(/\u0000/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * 折叠整段重复：PDF 里常见同一行文字被绘制两遍（伪粗体、阴影），
 * 得到「二极管导通二极管导通」这类文本。只在整段恰好是两段相同时折叠。
 */
export function collapseRepeats(text) {
  let value = String(text ?? '')
  for (let guard = 0; guard < 3; guard += 1) {
    const len = value.length
    if (len < 4 || len % 2 !== 0) break
    const half = len / 2
    if (value.slice(0, half) !== value.slice(half)) break
    value = value.slice(0, half)
  }
  return value
}

/** 单行规整：折叠所有空白。 */
export function oneLine(text) {
  return normalizeText(text).replace(/\s+/g, ' ').trim()
}

/** 中文（含全角标点）检测。 */
export function hasCJK(text) {
  return /[\u4e00-\u9fff]/.test(String(text ?? ''))
}

/** 截断文本，尽量在标点处收尾。 */
export function clip(text, max = 160) {
  const value = oneLine(text)
  if (value.length <= max) return value
  const cut = value.slice(0, max)
  const idx = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'), cut.lastIndexOf('.'), cut.lastIndexOf('，'))
  return idx > max * 0.5 ? cut.slice(0, idx + 1) : cut + '…'
}

/** 句子切分（中英文），返回去掉空白的句子数组。 */
export function splitSentences(text) {
  const value = normalizeText(text).replace(/\n+/g, ' ')
  if (!value) return []
  const parts = value.split(/(?<=[。！？!?；;])\s*/)
  return parts.map((s) => s.trim()).filter((s) => s.length > 0)
}

/** 依据中文标点/长度切分段落为若干块。 */
export function chunkParagraphs(blocks, { maxChars = 900 } = {}) {
  const out = []
  let current = null
  for (const block of blocks) {
    if (!block || !block.text) continue
    const isHeading = block.kind === 'heading'
    if (isHeading) {
      if (current) out.push(current)
      current = null
      out.push({ blocks: [block], text: block.text, heading: true })
      continue
    }
    if (!current) current = { blocks: [], text: '', heading: false }
    current.blocks.push(block)
    current.text = current.text ? `${current.text}\n${block.text}` : block.text
    if (current.text.length >= maxChars) {
      out.push(current)
      current = null
    }
  }
  if (current) out.push(current)
  return out
}

/** 简单并发限制映射。 */
export async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0
  const workers = new Array(Math.max(1, Math.min(limit, items.length))).fill(0).map(async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await mapper(items[index], index)
    }
  })
  await Promise.all(workers)
  return results
}

/** 线程内互斥：同一个键的异步任务串行执行。 */
export class KeyedLock {
  #tails = new Map()

  /** 在锁内执行 fn，返回其结果。 */
  run(key, fn) {
    const previous = this.#tails.get(key) ?? Promise.resolve()
    const next = previous.then(() => fn())
    // 无论成功失败都推进队尾，但避免未处理的 rejection。
    this.#tails.set(key, next.then(() => undefined, () => undefined))
    return next
  }
}

/** 原子写 JSON：先写临时文件再 rename，避免半截文件。 */
export async function writeJsonAtomic(file, value) {
  await mkdir(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  const body = JSON.stringify(value, null, 2)
  await writeFile(tmp, body, 'utf8')
  try {
    await rename(tmp, file)
  } catch (error) {
    await rm(tmp, { force: true })
    throw error
  }
}

/** 读 JSON，缺失时返回 fallback；损坏时抛错并改名保留现场。 */
export async function readJson(file, fallback = null) {
  if (!existsSync(file)) return fallback
  const raw = await readFile(file, 'utf8')
  if (!raw.trim()) return fallback
  try {
    return JSON.parse(raw)
  } catch (error) {
    const broken = `${file}.corrupt-${Date.now()}`
    await rename(file, broken).catch(() => undefined)
    const wrapped = new Error(`无法解析 ${path.basename(file)}：${error.message}（已备份为 ${path.basename(broken)}）`)
    wrapped.cause = error
    throw wrapped
  }
}

/** 安全删除目录或文件。 */
export async function removePath(target) {
  await rm(target, { recursive: true, force: true })
}

/** 列出目录下的文件（缺失返回空数组）。 */
export async function listDir(dir, filter = () => true) {
  if (!existsSync(dir)) return []
  const entries = await readdir(dir, { withFileTypes: true })
  return entries.filter((entry) => entry.isFile() && filter(entry.name)).map((entry) => path.join(dir, entry.name))
}

/** 今天的日期串（本地时区）YYYY-MM-DD。 */
export function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 在 YYYY-MM-DD 上加减天数。 */
export function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setDate(date.getDate() + days)
  return todayKey(date)
}

/** 两个日期键之间的天数差（b - a）。 */
export function daysBetween(aKey, bKey) {
  const a = new Date(`${aKey}T00:00:00`).getTime()
  const b = new Date(`${bKey}T00:00:00`).getTime()
  return Math.round((b - a) / 86400000)
}

/** 四舍五入到指定小数位。 */
export function round(value, digits = 2) {
  const factor = 10 ** digits
  return Math.round(Number(value) * factor) / factor
}

/** 限定范围。 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
