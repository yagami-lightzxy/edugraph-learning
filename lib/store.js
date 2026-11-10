/**
 * EduGraph AI · 本地存储层。
 *
 * 课程知识（资料 / 章节 / 概念 / 关系）与个人学习状态（档案 / 计划 / 答题 / 复习）
 * 分开存放：知识在 courses/<id>/blocks.json（写一次不再改），学习状态在
 * courses/<id>/meta.json（频繁更新）。所有写入都是原子替换，并用键锁串行化，
 * 保证页面刷新、插件重启后不出现半截数据。
 */
import os from 'node:os'
import path from 'node:path'
import { mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import {
  KeyedLock, listDir, newId, readJson, removePath, todayKey, writeJsonAtomic,
} from './util.js'

/** 领域错误：带 HTTP 状态码，路由层直接映射。 */
export class DomainError extends Error {
  constructor(message, status = 400, code = 'bad-request') {
    super(message)
    this.name = 'DomainError'
    this.status = status
    this.code = code
  }
}

/** 存储根目录：优先显式配置，其次 DSH_HOME，最后 ~/.dsh。 */
export function resolveBaseDir(configDir = '') {
  if (configDir && configDir.trim()) return path.resolve(configDir.trim())
  const home = process.env.DSH_HOME?.trim() || path.join(os.homedir(), '.dsh')
  return path.join(home, 'storages', 'edugraph-learning')
}

/** 一门课程的空元数据骨架。 */
export function emptyMeta(course) {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    course,
    profile: {
      level: 'unknown',
      goal: course.goal || '',
      examDate: '',
      dailyMinutes: 45,
      preferences: {},
      notes: '',
      updatedAt: new Date().toISOString(),
    },
    documents: [],
    chapters: [],
    concepts: [],
    relations: [],
    plan: null,
    questions: [],
    attempts: [],
    events: [],
    reviews: [],
    stats: { attempts: 0, correct: 0, minutes: 0, lastStudiedAt: null, studyDays: [] },
  }
}

/** 课程索引条目：课程库列表只读这一份，避免加载整门课。 */
function indexEntry(meta) {
  const concepts = meta.concepts.length
  const mastered = meta.reviews.filter((r) => (r.stability ?? 0) >= 21 && (r.state === 'review' || r.state === 'relearning')).length
  const tasks = meta.plan?.tasks ?? []
  const done = tasks.filter((t) => t.status === 'done').length
  return {
    id: meta.course.id,
    name: meta.course.name,
    subject: meta.course.subject,
    goal: meta.course.goal,
    status: meta.course.status,
    createdAt: meta.course.createdAt,
    updatedAt: meta.updatedAt,
    documentCount: meta.documents.length,
    conceptCount: concepts,
    masteredCount: mastered,
    taskCount: tasks.length,
    doneCount: done,
    progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    lastStudiedAt: meta.stats.lastStudiedAt,
    examDate: meta.profile.examDate || '',
  }
}

export class LearningStore {
  constructor({ baseDir = resolveBaseDir(), configDir = '' } = {}) {
    this.baseDir = baseDir || resolveBaseDir(configDir)
    this.lock = new KeyedLock()
    this.metaCache = new Map()
    this.indexCache = null
    this.stateCache = null
    this.profileCache = null
    this.ready = false
  }

  get indexPath() { return path.join(this.baseDir, 'index.json') }
  get statePath() { return path.join(this.baseDir, 'state.json') }
  get profilePath() { return path.join(this.baseDir, 'profile.json') }
  courseDir(id) { return path.join(this.baseDir, 'courses', id) }
  metaPath(id) { return path.join(this.courseDir(id), 'meta.json') }
  blocksPath(id) { return path.join(this.courseDir(id), 'blocks.json') }
  documentsDir(id) { return path.join(this.courseDir(id), 'documents') }
  figuresDir(id) { return path.join(this.courseDir(id), 'figures') }

  async init() {
    if (this.ready) return this
    await mkdir(path.join(this.baseDir, 'courses'), { recursive: true })
    await this.#readIndex()
    this.ready = true
    return this
  }

  // ---------------------------------------------------------------- 索引

  async #readIndex() {
    const data = await readJson(this.indexPath, null)
    this.indexCache = data && Array.isArray(data.courses) ? data : { version: 1, courses: [], lastCourseId: null, updatedAt: null }
    return this.indexCache
  }

  async #writeIndex(next) {
    this.indexCache = { ...next, version: 1, updatedAt: new Date().toISOString() }
    await writeJsonAtomic(this.indexPath, this.indexCache)
    return this.indexCache
  }

  async listCourses() {
    await this.init()
    const index = await this.#readIndex()
    return [...index.courses].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }

  async getIndex() {
    await this.init()
    return this.#readIndex()
  }

  /** 重新扫描课程目录，修正索引（手工删除课程目录后自愈）。 */
  async rebuildIndex() {
    await this.init()
    const files = await listDir(path.join(this.baseDir, 'courses'), (name) => name.endsWith('.meta.json') || false)
    const dirs = existsSync(path.join(this.baseDir, 'courses')) ? await listDir(path.join(this.baseDir, 'courses')) : []
    const entries = []
    const seen = new Set()
    for (const id of [...new Set([...dirs.map((f) => path.basename(f)), ...files.map((f) => path.basename(f).replace(/\.meta\.json$/, ''))])]) {
      if (seen.has(id)) continue
      const meta = await readJson(this.metaPath(id), null)
      if (!meta?.course) continue
      seen.add(id)
      entries.push(indexEntry(meta))
    }
    const index = await this.#readIndex()
    return this.#writeIndex({ ...index, courses: entries })
  }

  // ---------------------------------------------------------------- 课程

  async createCourse({ name, subject = '', goal = '', tags = [] } = {}) {
    await this.init()
    const title = String(name ?? '').trim()
    if (!title) throw new DomainError('课程名称不能为空', 400, 'invalid-name')
    const id = newId('c')
    const now = new Date().toISOString()
    const course = {
      id, name: title, subject: String(subject ?? '').trim(), goal: String(goal ?? '').trim(),
      status: 'created', tags: Array.isArray(tags) ? tags.map(String) : [], createdAt: now, updatedAt: now,
    }
    const meta = emptyMeta(course)
    await mkdir(this.courseDir(id), { recursive: true })
    await writeJsonAtomic(this.metaPath(id), meta)
    await writeJsonAtomic(this.blocksPath(id), { version: 1, courseId: id, documents: [], updatedAt: now })
    this.metaCache.set(id, meta)
    const index = await this.#readIndex()
    await this.#writeIndex({ ...index, lastCourseId: id, courses: [indexEntry(meta), ...index.courses.filter((c) => c.id !== id)] })
    return meta
  }

  async getCourse(id) {
    await this.init()
    if (!id) throw new DomainError('缺少课程 id', 400, 'missing-course')
    const cached = this.metaCache.get(id)
    if (cached) return cached
    const meta = await readJson(this.metaPath(id), null)
    if (!meta?.course) throw new DomainError(`课程不存在：${id}`, 404, 'course-not-found')
    this.metaCache.set(id, meta)
    return meta
  }

  async saveCourse(id, meta) {
    const next = { ...meta, updatedAt: new Date().toISOString(), course: { ...meta.course, updatedAt: new Date().toISOString() } }
    await writeJsonAtomic(this.metaPath(id), next)
    this.metaCache.set(id, next)
    await this.#touchIndex(next)
    return next
  }

  /** 读-改-写：在课程锁内把 meta 交给 mutator，返回值即 mutator 的返回值。 */
  async mutateCourse(id, mutator) {
    return this.lock.run(`course:${id}`, async () => {
      const meta = await this.getCourse(id)
      const draft = JSON.parse(JSON.stringify(meta))
      const result = await mutator(draft)
      const saved = await this.saveCourse(id, draft)
      return { meta: saved, result }
    })
  }

  async #touchIndex(meta) {
    const index = await this.#readIndex()
    const entry = indexEntry(meta)
    const courses = [entry, ...index.courses.filter((c) => c.id !== entry.id)]
    await this.#writeIndex({ ...index, courses, lastCourseId: index.lastCourseId ?? entry.id })
  }

  async deleteCourse(id) {
    return this.lock.run(`course:${id}`, async () => {
      await removePath(this.courseDir(id))
      this.metaCache.delete(id)
      const index = await this.#readIndex()
      await this.#writeIndex({
        ...index,
        courses: index.courses.filter((c) => c.id !== id),
        lastCourseId: index.lastCourseId === id ? null : index.lastCourseId,
      })
      return { id, deleted: true }
    })
  }

  async setLastCourse(id) {
    const index = await this.#readIndex()
    if (index.lastCourseId === id) return
    await this.#writeIndex({ ...index, lastCourseId: id })
  }

  // ---------------------------------------------------------------- 资料原文

  async getBlocks(id) {
    await this.init()
    const data = await readJson(this.blocksPath(id), null)
    if (!data) return { version: 1, courseId: id, documents: [], updatedAt: null }
    return data
  }

  async saveBlocks(id, data) {
    const next = { ...data, version: 1, courseId: id, updatedAt: new Date().toISOString() }
    await writeJsonAtomic(this.blocksPath(id), next)
    return next
  }

  /** 追加一份已解析文档的 blocks（同 id 覆盖）。 */
  async putDocumentBlocks(courseId, documentId, payload) {
    return this.lock.run(`blocks:${courseId}`, async () => {
      const data = await this.getBlocks(courseId)
      data.documents = (data.documents ?? []).filter((doc) => doc.documentId !== documentId)
      data.documents.push({ documentId, ...payload })
      return this.saveBlocks(courseId, data)
    })
  }

  async removeDocumentBlocks(courseId, documentId) {
    return this.lock.run(`blocks:${courseId}`, async () => {
      const data = await this.getBlocks(courseId)
      data.documents = (data.documents ?? []).filter((doc) => doc.documentId !== documentId)
      return this.saveBlocks(courseId, data)
    })
  }

  // ---------------------------------------------------------------- 个人档案 / UI 状态

  async getProfile() {
    await this.init()
    if (this.profileCache) return this.profileCache
    const data = await readJson(this.profilePath, null)
    this.profileCache = data ?? { version: 1, goal: '', level: 'unknown', dailyMinutes: 45, subjects: [], preferences: {}, updatedAt: null }
    return this.profileCache
  }

  async saveProfile(patch = {}) {
    await this.init()
    const current = await this.getProfile()
    const next = { ...current, ...patch, version: 1, updatedAt: new Date().toISOString() }
    await writeJsonAtomic(this.profilePath, next)
    this.profileCache = next
    return next
  }

  async getState() {
    await this.init()
    if (this.stateCache) return this.stateCache
    const data = await readJson(this.statePath, null)
    this.stateCache = data ?? {
      version: 1, enabled: false, activeCourseId: null, activeView: 'library',
      activeTaskId: null, pendingQuestionId: null, updatedAt: null,
    }
    return this.stateCache
  }

  async saveState(patch = {}) {
    await this.init()
    const current = await this.getState()
    const next = { ...current, ...patch, version: 1, updatedAt: new Date().toISOString() }
    await writeJsonAtomic(this.statePath, next)
    this.stateCache = next
    return next
  }

  // ---------------------------------------------------------------- 诊断

  async describe() {
    await this.init()
    const index = await this.#readIndex()
    const courses = index.courses.length
    let blocks = 0
    for (const entry of index.courses) {
      try {
        const data = await readJson(this.blocksPath(entry.id), null)
        blocks += (data?.documents ?? []).reduce((sum, doc) => sum + (doc.pages ?? []).reduce((n, page) => n + (page.blocks?.length ?? 0), 0), 0)
      } catch { /* 单个课程损坏不影响诊断 */ }
    }
    return { baseDir: this.baseDir, courses, blocks, indexUpdatedAt: index.updatedAt }
  }
}

/** 当前是否是首次使用（没有课程）。 */
export async function isFreshInstall(store) {
  const courses = await store.listCourses()
  return courses.length === 0
}

/** 统计一门课程今天的活动量，供概览页展示。 */
export function todayActivity(meta) {
  const key = todayKey()
  const attempts = meta.attempts.filter((a) => String(a.createdAt).slice(0, 10) === key)
  const events = meta.events.filter((e) => String(e.createdAt).slice(0, 10) === key)
  return { attempts: attempts.length, events: events.length, key }
}

/** 校验课程目录是否已落盘（测试与诊断用）。 */
export async function courseDirExists(store, id) {
  try {
    const info = await stat(store.courseDir(id))
    return info.isDirectory()
  } catch {
    return false
  }
}
