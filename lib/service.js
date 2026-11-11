/**
 * EduGraph AI · 领域服务层。
 *
 * HTTP 接口与 Agent 工具都调用这里，保证「界面上看到的」和「Agent 读到的」是同一套
 * 计算。所有写操作都有版本号与时间戳，便于界面刷新与冲突判断。
 */
import path from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { analyzeCourse, contentFingerprint, termKey } from './analyze.js'
import { ensurePageFigure, imageMime, listDocumentsMedia, readOfficeMedia } from './media.js'
import { DomainError, emptyMeta } from './store.js'
import { gradeAnswer, scoreToRating } from './grade.js'
import { buildGraph, buildLesson, buildMistakes, buildOverview, buildReviews, buildConceptStates, recentEvents } from './progress.js'
import { generatePlan, nextTasks, planProgress } from './plan.js'
import { generateQuestions, prioritizeConcepts } from './quiz.js'
import { buildIndex, search as searchIndex } from './search.js'
import { buildPackPrompt, exportCoursePack, mergePack, normalizePack, packStats, previewPack as previewPackData } from './pack.js'
import { ensureProject, safeFileName } from './project.js'
import { createCard, reviewCard } from './fsrs.js'
import { clip, collapseRepeats, newId, oneLine, stableHash } from './util.js'

/** 服务：所有能力都以课程为作用域。 */
export class LearningService {
  constructor({ store, parser, config = {} }) {
    this.store = store
    this.parser = parser
    this.config = config
    this.indexCache = new Map()
    this.running = new Map()
  }

  // ------------------------------------------------------------ 课程

  async listCourses() {
    const courses = await this.store.listCourses()
    const index = await this.store.getIndex()
    return { courses, lastCourseId: index.lastCourseId ?? null }
  }

  async createCourse(input) {
    const meta = await this.store.createCourse(input)
    return this.bundle(meta)
  }

  async getCourse(courseId) {
    return this.store.getCourse(courseId)
  }

  /** 在当前 DSH 工作区生成/更新课程项目，资料复制到项目 materials/。 */
  async ensureProject(courseId, basePath) {
    return ensureProject(this.store, courseId, basePath)
  }

  /** 课程完整视图（课程 + 文档 + 章节 + 概念 + 计划 + 统计）。 */
  async bundle(metaOrId) {
    const meta = typeof metaOrId === 'string' ? await this.store.getCourse(metaOrId) : metaOrId
    return {
      course: meta.course,
      profile: meta.profile,
      documents: meta.documents ?? [],
      chapters: meta.chapters ?? [],
      concepts: meta.concepts ?? [],
      relations: meta.relations ?? [],
      plan: meta.plan ?? null,
      stats: meta.stats ?? {},
      updatedAt: meta.updatedAt,
      version: meta.version ?? 1,
    }
  }

  async updateCourse(courseId, patch = {}) {
    const { meta } = await this.store.mutateCourse(courseId, (draft) => {
      for (const field of ['name', 'subject', 'goal', 'status']) {
        if (patch[field] !== undefined) draft.course[field] = String(patch[field]).slice(0, 2000)
      }
      if (patch.examDate !== undefined || patch.dailyMinutes !== undefined || patch.level !== undefined) {
        if (patch.examDate !== undefined) draft.profile.examDate = String(patch.examDate).slice(0, 10)
        if (patch.dailyMinutes !== undefined) draft.profile.dailyMinutes = Math.max(10, Math.min(480, Number(patch.dailyMinutes) || 45))
        if (patch.level !== undefined) draft.profile.level = String(patch.level).slice(0, 20)
        draft.profile.updatedAt = new Date().toISOString()
      }
      return draft.course.id
    })
    return this.bundle(meta)
  }

  async deleteCourse(courseId) {
    await this.store.deleteCourse(courseId)
    this.indexCache.delete(courseId)
    return { deleted: true, courseId }
  }

  // ------------------------------------------------------------ 资料

  /** 接收上传：立即登记文档并返回，解析在后台进行（大文件不阻塞界面）。 */
  async ingestDocument({ courseId, filename, buffer, mimeType = '' }) {
    await this.store.getCourse(courseId)
    const safeName = path.basename(String(filename || 'document')).slice(0, 200)
    const documentId = newId('d')
    const ext = (path.extname(safeName) || '').toLowerCase()
    // 原始文件留一份：PDF 页面渲染、Office 图片抽取都要回头读它。
    const documentsDir = this.store.documentsDir(courseId)
    await mkdir(documentsDir, { recursive: true })
    // 文件名用原始可读名，项目 materials/ 链接过去时用户看到的就是原文件名。
    const safe = safeFileName(safeName)
    const safeExt = path.extname(safe)
    const stem = safeExt ? safe.slice(0, -safeExt.length) : safe
    let storedName = safe
    let index = 2
    while (existsSync(path.join(documentsDir, storedName))) {
      storedName = `${stem} (${index})${safeExt}`
      index += 1
    }
    await writeFile(path.join(documentsDir, storedName), buffer)
    const entry = {
      id: documentId,
      filename: safeName,
      mimeType,
      storedName,
      ext,
      size: buffer.length,
      parser: '',
      status: 'parsing',
      pages: 0,
      charCount: 0,
      error: null,
      uploadedAt: new Date().toISOString(),
      parsedAt: null,
    }
    await this.store.mutateCourse(courseId, (draft) => {
      draft.documents.push(entry)
      draft.course.status = 'parsing'
    })
    this.#runParse({ courseId, documentId, filename: safeName, buffer, mimeType }).catch(() => undefined)
    return { document: entry }
  }

  async #runParse({ courseId, documentId, filename, buffer, mimeType }) {
    this.running.set(documentId, true)
    try {
      const parsed = await this.parser.parseDocument({ buffer, filename, mimeType })
      if (parsed.status === 'failed') {
        await this.store.mutateCourse(courseId, (draft) => {
          const doc = draft.documents.find((d) => d.id === documentId)
          if (doc) { doc.status = 'failed'; doc.error = parsed.error ?? '解析失败'; doc.parsedAt = new Date().toISOString() }
          draft.course.status = 'analyzing'
        })
        return
      }
      const pages = cleanPages(parsed.pages)
      const contentChars = pages.reduce((sum, page) => sum + page.blocks.reduce((n, block) => n + block.text.length, 0), 0)
      await this.store.putDocumentBlocks(courseId, documentId, {
        filename,
        parser: parsed.parser,
        pages,
        charCount: contentChars,
        declaredCharCount: parsed.charCount ?? 0,
        warnings: parsed.warnings ?? [],
      })
      await this.store.mutateCourse(courseId, (draft) => {
        const doc = draft.documents.find((d) => d.id === documentId)
        if (doc) {
          doc.status = 'analyzing'
          doc.parser = parsed.parser
          doc.pages = parsed.pages.length
          doc.charCount = contentChars
          doc.parsedAt = new Date().toISOString()
          doc.warnings = parsed.warnings ?? []
        }
      })
      await this.reanalyze(courseId, { reason: 'document-added' })
      await this.store.mutateCourse(courseId, (draft) => {
        const doc = draft.documents.find((d) => d.id === documentId)
        if (doc) doc.status = 'ready'
        draft.course.status = 'ready'
      })
    } catch (error) {
      await this.store.mutateCourse(courseId, (draft) => {
        const doc = draft.documents.find((d) => d.id === documentId)
        if (doc) { doc.status = 'failed'; doc.error = String(error?.message ?? error) }
      }).catch(() => undefined)
    } finally {
      this.running.delete(documentId)
    }
  }

  /** 重新分析：资料变了、或用户手动点「重新分析」。 */
  async reanalyze(courseId, { reason = 'manual' } = {}) {
    const blocksData = await this.store.getBlocks(courseId)
    const documents = (blocksData.documents ?? []).map((doc) => ({
      documentId: doc.documentId,
      filename: doc.filename,
      parser: doc.parser,
      pages: doc.pages ?? [],
    }))
    const { meta } = await this.store.mutateCourse(courseId, (draft) => {
      if (!documents.length) {
        draft.chapters = []
        draft.concepts = []
        draft.relations = []
        return { empty: true }
      }
      const analysis = analyzeCourse({ courseId, documents })
      const oldChapterByTitle = new Map((draft.chapters ?? []).map((c) => [oneLine(c.title).toLowerCase(), c]))
      const oldConceptByKey = new Map((draft.concepts ?? []).map((c) => [c.key ?? termKey(c.name), c]))
      const chapterIdMap = new Map()
      for (const chapter of analysis.chapters) {
        const old = oldChapterByTitle.get(oneLine(chapter.title).toLowerCase())
        if (old && (old.level ?? 1) === chapter.level) {
          chapterIdMap.set(chapter.id, old.id)
          chapter.id = old.id
        }
      }
      for (const chapter of analysis.chapters) {
        if (!chapter.id) continue
        if (!chapter.conceptIds) chapter.conceptIds = []
        chapter.conceptIds = chapter.conceptIds.map((id) => id)
      }
      const mergedConcepts = []
      for (const concept of analysis.concepts) {
        const old = oldConceptByKey.get(concept.key)
        if (old) {
          concept.id = old.id
          concept.createdAt = old.createdAt ?? concept.createdAt
          concept.definition = concept.definition?.length >= (old.definition?.length ?? 0) ? concept.definition : old.definition
          const refs = [...(old.sourceRefs ?? []), ...(concept.sourceRefs ?? [])]
          const seen = new Set()
          concept.sourceRefs = refs.filter((ref) => {
            const key = `${ref.documentId}:${ref.blockId}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          }).slice(0, 6)
          concept.confidence = Math.max(concept.confidence ?? 0, old.confidence ?? 0)
          if (old.manual) concept.manual = true
        }
        concept.chapterId = chapterIdMap.get(concept.chapterId) ?? concept.chapterId
        mergedConcepts.push(concept)
      }
      // 章节概念列表按合并后的 id 重建
      const conceptIdsByChapter = new Map()
      for (const concept of mergedConcepts) {
        if (!concept.chapterId) continue
        const list = conceptIdsByChapter.get(concept.chapterId) ?? []
        list.push(concept.id)
        conceptIdsByChapter.set(concept.chapterId, list)
      }
      for (const chapter of analysis.chapters) {
        chapter.conceptIds = conceptIdsByChapter.get(chapter.id) ?? []
      }
      // 人工补充的概念（Agent upsert）不会被自动分析覆盖掉
      const autoKeys = new Set(mergedConcepts.map((c) => c.key ?? termKey(c.name)))
      for (const old of draft.concepts ?? []) {
        if (!old.manual) continue
        if (autoKeys.has(old.key ?? termKey(old.name))) continue
        mergedConcepts.push(old)
      }
      draft.chapters = analysis.chapters
      draft.concepts = mergedConcepts
      draft.relations = analysis.relations
      draft.analysis = {
        stats: analysis.stats,
        fingerprint: contentFingerprint(documents),
        reason,
        at: new Date().toISOString(),
      }
      return { analysis }
    })
    this.indexCache.delete(courseId)
    return { ...(meta.analysis ?? {}), chapters: meta.chapters.length, concepts: meta.concepts.length, relations: meta.relations.length }
  }

  /** 单页渲染成图片（PDF 矢量电路图也能看到）。返回磁盘路径，接口层再读字节。 */
  async pageImage(courseId, documentId, pageNo) {
    const meta = await this.store.getCourse(courseId)
    const doc = (meta.documents ?? []).find((item) => item.id === documentId)
    if (!doc) throw new DomainError('文档不存在', 404, 'document-not-found')
    if (!doc.storedName) throw new DomainError('这份文档没有保留原文件，无法生成图片。请重新上传。', 409, 'no-source')
    const sourcePath = path.join(this.store.documentsDir(courseId), doc.storedName)
    const page = Math.max(1, Math.min(Number(doc.pages) || 1, Number(pageNo) || 1))
    const figure = await ensurePageFigure({
      courseId, documentId, sourcePath, sourceExt: doc.ext ?? '.pdf', pageNo: page,
      figureDir: this.store.figuresDir(courseId),
    })
    return { ...figure, pageNo: page, documentId }
  }

  /** 文档内嵌图片清单（DOCX/PPTX 才有）。 */
  async documentMedia(courseId, documentId) {
    const meta = await this.store.getCourse(courseId)
    const doc = (meta.documents ?? []).find((item) => item.id === documentId)
    if (!doc) throw new DomainError('文档不存在', 404, 'document-not-found')
    if (!doc.storedName) return { media: [] }
    const sourcePath = path.join(this.store.documentsDir(courseId), doc.storedName)
    const media = await listDocumentsMedia(sourcePath, doc.ext ?? '')
    return { documentId, media, count: media.length }
  }

  /** 取一张内嵌图片的字节。 */
  async mediaItem(courseId, documentId, index) {
    const meta = await this.store.getCourse(courseId)
    const doc = (meta.documents ?? []).find((item) => item.id === documentId)
    if (!doc?.storedName) throw new DomainError('文档不存在', 404, 'document-not-found')
    const sourcePath = path.join(this.store.documentsDir(courseId), doc.storedName)
    const media = await readOfficeMedia(sourcePath, doc.ext ?? '', index)
    if (!media) throw new DomainError('没有这张图片', 404, 'media-not-found')
    return { ...media, mime: imageMime(media.ext) }
  }

  async deleteDocument(courseId, documentId) {
    const meta = await this.store.getCourse(courseId)
    const doc = (meta.documents ?? []).find((item) => item.id === documentId)
    if (doc?.storedName) {
      await rm(path.join(this.store.documentsDir(courseId), doc.storedName), { force: true }).catch(() => undefined)
    }
    await rm(this.store.figuresDir(courseId), { recursive: true, force: true }).catch(() => undefined)
    await this.store.removeDocumentBlocks(courseId, documentId)
    await this.store.mutateCourse(courseId, (draft) => {
      draft.documents = (draft.documents ?? []).filter((doc) => doc.id !== documentId)
    })
    await this.reanalyze(courseId, { reason: 'document-removed' })
    return { deleted: true, documentId }
  }

  async listDocuments(courseId) {
    const meta = await this.store.getCourse(courseId)
    return { documents: meta.documents ?? [] }
  }

  /** 文档分页正文（阅读原文用）。 */
  async readDocumentPage(courseId, documentId, { from = 1, count = 3 } = {}) {
    const blocksData = await this.store.getBlocks(courseId)
    const doc = (blocksData.documents ?? []).find((item) => item.documentId === documentId)
    if (!doc) throw new DomainError('文档不存在', 404, 'document-not-found')
    const start = Math.max(1, Number(from) || 1)
    const take = Math.max(1, Math.min(20, Number(count) || 3))
    const pages = (doc.pages ?? []).filter((page) => page.pageNo >= start && page.pageNo < start + take)
    return {
      documentId,
      filename: doc.filename,
      totalPages: (doc.pages ?? []).length,
      from: start,
      count: take,
      pages,
    }
  }

  // ------------------------------------------------------------ 概览 / 图谱 / 计划

  async overview(courseId) {
    const meta = await this.store.getCourse(courseId)
    return { ...buildOverview(meta), events: recentEvents(meta, 12) }
  }

  async graph(courseId) {
    const meta = await this.store.getCourse(courseId)
    return buildGraph(meta)
  }

  async plan(courseId) {
    const meta = await this.store.getCourse(courseId)
    return {
      plan: meta.plan ?? null,
      progress: planProgress(meta.plan),
      next: nextTasks(meta.plan, 3),
      profile: meta.profile,
    }
  }

  async generatePlan(courseId, options = {}) {
    const { meta } = await this.store.mutateCourse(courseId, (draft) => {
      if (!(draft.concepts ?? []).length) throw new DomainError('课程还没有可分析的概念，请先上传资料', 409, 'no-concepts')
      if (options.goal !== undefined) draft.profile.goal = String(options.goal).slice(0, 1000)
      if (options.examDate !== undefined) draft.profile.examDate = String(options.examDate).slice(0, 10)
      if (options.dailyMinutes !== undefined) draft.profile.dailyMinutes = Math.max(10, Math.min(480, Number(options.dailyMinutes) || 45))
      if (options.level !== undefined) draft.profile.level = String(options.level).slice(0, 20)
      draft.plan = generatePlan({ meta: draft, profile: draft.profile })
      draft.course.status = 'learning'
      return draft.plan
    })
    return { plan: meta.plan, progress: planProgress(meta.plan), next: nextTasks(meta.plan, 3) }
  }

  async updateTask(courseId, taskId, patch = {}) {
    const { meta } = await this.store.mutateCourse(courseId, (draft) => {
      const plan = draft.plan
      if (!plan) throw new DomainError('还没有学习计划', 409, 'no-plan')
      const task = (plan.tasks ?? []).find((item) => item.id === taskId)
      if (!task) throw new DomainError('任务不存在', 404, 'task-not-found')
      if (patch.status !== undefined) {
        const status = String(patch.status)
        if (!['todo', 'doing', 'done', 'skipped'].includes(status)) throw new DomainError('非法任务状态', 400, 'invalid-status')
        task.status = status
        if (status === 'done') {
          task.completedAt = new Date().toISOString()
          task.startedAt = task.startedAt ?? task.completedAt
          const dayKey = String(task.completedAt).slice(0, 10)
          if (!draft.stats.studyDays.includes(dayKey)) draft.stats.studyDays.push(dayKey)
          draft.stats.minutes += task.estimatedMinutes ?? 0
          draft.stats.lastStudiedAt = task.completedAt
        }
        if (status === 'doing') task.startedAt = new Date().toISOString()
      }
      if (patch.note !== undefined) task.note = String(patch.note).slice(0, 2000)
      if (patch.dueDate !== undefined) task.dueDate = String(patch.dueDate).slice(0, 10)
      plan.updatedAt = new Date().toISOString()
      return task
    })
    return { task: meta.plan.tasks.find((t) => t.id === taskId), progress: planProgress(meta.plan) }
  }

  // ------------------------------------------------------------ 教学 / 练习

  async lesson(courseId, taskId = '') {
    const meta = await this.store.getCourse(courseId)
    const target = taskId || nextTasks(meta.plan, 1)[0]?.id || ''
    return buildLesson(meta, target)
  }

  /** 生成一（小）批题目；返回给界面的题目不含答案。 */
  async createQuiz(courseId, { conceptIds = null, count = 8, types = null, taskId = null, mode = 'practice', strategy = 'auto' } = {}) {
    const meta = await this.store.getCourse(courseId)
    if (!(meta.concepts ?? []).length) throw new DomainError('还没有概念，无法出题', 409, 'no-concepts')
    let ids = conceptIds?.length ? conceptIds : null
    if (!ids && taskId) {
      const task = (meta.plan?.tasks ?? []).find((item) => item.id === taskId)
      if (task?.conceptIds?.length) ids = task.conceptIds
    }
    if (!ids) {
      if (strategy === 'weak' || mode === 'review') {
        ids = prioritizeConcepts({
          concepts: meta.concepts,
          reviews: meta.reviews,
          attempts: meta.attempts,
          limit: Math.max(1, Math.min(30, Number(count) || 8)),
        }).map((c) => c.id)
      } else {
        const ordered = (meta.chapters ?? []).flatMap((chapter) => (chapter.conceptIds ?? []).map((id) => meta.concepts.find((c) => c.id === id)).filter(Boolean))
        ids = (ordered.length ? ordered : meta.concepts).slice(0, Math.max(1, Math.min(30, Number(count) || 8))).map((c) => c.id)
      }
    }
    const limit = Math.max(1, Math.min(40, Number(count) || 8))
    const wantedTypes = types?.length ? new Set(types) : null
    // 外部 AI 导入的题目优先进入练习；不够再用规则题补齐。
    const imported = (meta.questions ?? []).filter((question) => question.origin === 'external-ai'
      && ids.includes(question.conceptId) && (!wantedTypes || wantedTypes.has(question.type))).slice(0, limit)
    const remaining = Math.max(0, limit - imported.length)
    const blocksData = await this.store.getBlocks(courseId)
    const blocks = (blocksData.documents ?? []).flatMap((doc) => (doc.pages ?? []).flatMap((page) => page.blocks ?? []))
    const { meta: saved, result: generated } = remaining > 0
      ? await this.store.mutateCourse(courseId, (draft) => {
        const created = generateQuestions({ meta: draft, conceptIds: ids, blocks, count: remaining, types })
        return created
      })
      : { meta, result: [] }
    const picked = [...imported, ...generated].slice(0, limit)
    const publicList = (picked.length ? picked : (saved.questions ?? []).filter((q) => ids.includes(q.conceptId)).slice(-limit))
      .map((question) => ({
        id: question.id,
        type: question.type,
        stem: question.stem,
        options: question.options ?? [],
        conceptId: question.conceptId,
        conceptName: question.conceptName,
        chapterId: question.chapterId ?? null,
        sourceRef: question.sourceRef ?? null,
        mode,
      }))
    return { questions: publicList, count: publicList.length, mode }
  }

  /** 提交答案：判分 + 记录证据 + 更新 FSRS。 */
  async answerQuestion(courseId, { questionId, answer, mode = 'practice', taskId = null, durationMs = null } = {}) {
    const meta = await this.store.getCourse(courseId)
    const question = (meta.questions ?? []).find((item) => item.id === questionId)
    if (!question) throw new DomainError('题目不存在', 404, 'question-not-found')
    const grade = gradeAnswer(question, answer)
    const now = Date.now()
    const { meta: saved, result: payload } = await this.store.mutateCourse(courseId, (draft) => {
      const concept = (draft.concepts ?? []).find((c) => c.id === question.conceptId)
      const attempt = {
        id: newId('a'),
        questionId,
        conceptId: question.conceptId,
        conceptName: question.conceptName ?? concept?.name ?? '',
        questionType: question.type,
        answer: typeof answer === 'string' ? answer.slice(0, 4000) : String(answer ?? ''),
        score: grade.score,
        correct: grade.correct,
        errorTags: grade.errorTags,
        mode,
        taskId,
        durationMs: Number.isFinite(durationMs) ? durationMs : null,
        createdAt: new Date().toISOString(),
      }
      draft.attempts.push(attempt)
      draft.stats.attempts += 1
      if (grade.correct) draft.stats.correct += 1
      draft.stats.lastStudiedAt = attempt.createdAt
      const dayKey = String(attempt.createdAt).slice(0, 10)
      if (!draft.stats.studyDays.includes(dayKey)) draft.stats.studyDays.push(dayKey)
      const rating = scoreToRating(grade.score)
      const existing = (draft.reviews ?? []).find((r) => r.conceptId === question.conceptId)
      const card = existing ? { ...existing } : createCard(now)
      const next = reviewCard(card, rating, now)
      if (existing) Object.assign(existing, next)
      else draft.reviews.push({ conceptId: question.conceptId, ...next })
      draft.events.push({
        id: newId('e'),
        type: 'answer',
        conceptId: question.conceptId,
        taskId,
        evidence: { questionId, score: grade.score, rating, errorTags: grade.errorTags },
        createdAt: new Date().toISOString(),
      })
      return { attempt, rating, review: next }
    })
    const states = buildConceptStates(saved)
    return {
      grade: {
        score: grade.score,
        correct: grade.correct,
        errorTags: grade.errorTags,
        explanation: grade.explanation,
        expected: question.answer,
        correctAnswer: question.answer,
        options: question.options ?? [],
      },
      attempt: payload.attempt,
      rating: payload.rating,
      review: payload.review,
      state: states.get(question.conceptId) ?? null,
      progress: planProgress(saved.plan),
      today: { attempts: saved.stats.attempts },
    }
  }

  /** 手工复习评分（用户直接点「记住了 / 忘了」）。 */
  async gradeReview(courseId, conceptId, rating = 3) {
    const now = Date.now()
    const { meta, result } = await this.store.mutateCourse(courseId, (draft) => {
      const value = Math.max(1, Math.min(4, Math.round(Number(rating) || 3)))
      const existing = (draft.reviews ?? []).find((r) => r.conceptId === conceptId)
      const card = existing ? { ...existing } : createCard(now)
      const next = reviewCard(card, value, now)
      if (existing) Object.assign(existing, next)
      else draft.reviews.push({ conceptId, ...next })
      draft.events.push({
        id: newId('e'), type: 'review', conceptId,
        evidence: { rating: value, due: next.due }, createdAt: new Date().toISOString(),
      })
      draft.stats.lastStudiedAt = new Date().toISOString()
      const dayKey = String(draft.stats.lastStudiedAt).slice(0, 10)
      if (!draft.stats.studyDays.includes(dayKey)) draft.stats.studyDays.push(dayKey)
      return next
    })
    return { review: result, reviews: buildReviews(meta) }
  }

  async mistakes(courseId) {
    const meta = await this.store.getCourse(courseId)
    return buildMistakes(meta)
  }

  async reviews(courseId) {
    const meta = await this.store.getCourse(courseId)
    return buildReviews(meta)
  }

  // ------------------------------------------------------------ 检索 / 事件

  /** 课程内全文检索：资料块 + 概念定义 + 题目，返回可回溯来源的命中。 */
  async search(courseId, query, { limit = 12 } = {}) {
    const term = oneLine(query)
    if (!term) return { query: '', results: [] }
    const meta = await this.store.getCourse(courseId)
    const cacheKey = `${courseId}:${meta.updatedAt}`
    let index = this.indexCache.get(cacheKey)
    if (!index) {
      const blocksData = await this.store.getBlocks(courseId)
      const documents = []
      for (const doc of blocksData.documents ?? []) {
        for (const page of doc.pages ?? []) {
          for (const block of page.blocks ?? []) {
            if (!block?.text || block.text.length < 8) continue
            documents.push({
              id: `${doc.documentId}:${block.id}`,
              text: block.text,
              meta: { kind: 'source', documentId: doc.documentId, filename: doc.filename, pageNo: page.pageNo, blockId: block.id },
            })
          }
        }
      }
      for (const concept of meta.concepts ?? []) {
        documents.push({
          id: `concept:${concept.id}`,
          text: `${concept.name} ${concept.definition ?? ''}`,
          meta: { kind: 'concept', conceptId: concept.id, name: concept.name },
        })
      }
      for (const question of meta.questions ?? []) {
        documents.push({
          id: `question:${question.id}`,
          text: `${question.stem} ${question.explanation ?? ''}`,
          meta: { kind: 'question', questionId: question.id, conceptId: question.conceptId },
        })
      }
      index = buildIndex(documents)
      this.indexCache.clear()
      this.indexCache.set(cacheKey, index)
    }
    const results = searchIndex(index, term, { limit: Math.max(1, Math.min(40, Number(limit) || 12)) })
    return { query: term, results }
  }

  async recordEvent(courseId, { conceptId = null, type = 'note', evidence = '', taskId = null } = {}) {
    const { result } = await this.store.mutateCourse(courseId, (draft) => {
      const event = {
        id: newId('e'), type: String(type).slice(0, 40), conceptId,
        taskId, evidence: typeof evidence === 'string' ? evidence.slice(0, 4000) : evidence,
        createdAt: new Date().toISOString(),
      }
      draft.events.push(event)
      draft.stats.lastStudiedAt = event.createdAt
      const dayKey = String(event.createdAt).slice(0, 10)
      if (!draft.stats.studyDays.includes(dayKey)) draft.stats.studyDays.push(dayKey)
      return event
    })
    return { event: result }
  }

  // ------------------------------------------------------------ Agent 手工维护

  /** Agent 补充/修正概念（人工概念不会被自动分析覆盖）。 */
  async upsertConcepts(courseId, concepts = []) {
    const { meta } = await this.store.mutateCourse(courseId, (draft) => {
      const byKey = new Map((draft.concepts ?? []).map((c) => [c.key ?? termKey(c.name), c]))
      const chapterById = new Map((draft.chapters ?? []).map((c) => [c.id, c]))
      for (const input of concepts.slice(0, 200)) {
        const name = oneLine(input?.name ?? '')
        if (!name) continue
        const key = termKey(name)
        if (!key) continue
        let concept = byKey.get(key)
        if (!concept) {
          concept = {
            id: newId('k'), name, key, definition: '', chapterId: null, confidence: 0.8,
            freq: 1, sourceRefs: [], tags: ['manual'], createdAt: new Date().toISOString(), manual: true,
          }
          draft.concepts.push(concept)
          byKey.set(key, concept)
        }
        concept.manual = true
        if (input.definition) concept.definition = String(input.definition).slice(0, 4000)
        if (input.chapterId && chapterById.has(input.chapterId)) concept.chapterId = input.chapterId
        if (!concept.chapterId && draft.chapters?.length) concept.chapterId = draft.chapters[0].id
        if (input.sourceRef) {
          const ref = {
            documentId: String(input.sourceRef.documentId ?? ''),
            pageNo: Number(input.sourceRef.pageNo) || null,
            blockId: input.sourceRef.blockId ? String(input.sourceRef.blockId) : '',
            quote: String(input.sourceRef.quote ?? '').slice(0, 300),
          }
          if (!concept.sourceRefs.some((r) => r.documentId === ref.documentId && r.blockId === ref.blockId)) concept.sourceRefs.push(ref)
        }
        concept.confidence = Math.max(concept.confidence ?? 0.5, Number(input.confidence) || 0.8)
        // 同步章节概念列表
        for (const chapter of draft.chapters ?? []) {
          const list = chapter.conceptIds ?? []
          const has = list.includes(concept.id)
          if (chapter.id === concept.chapterId && !has) chapter.conceptIds = [...list, concept.id]
          if (chapter.id !== concept.chapterId && has) chapter.conceptIds = list.filter((id) => id !== concept.id)
        }
      }
      draft.analysis = { ...(draft.analysis ?? {}), manualAt: new Date().toISOString() }
      return draft.concepts
    })
    this.indexCache.clear()
    return { concepts: meta.concepts, count: meta.concepts.length }
  }

  /** 导出课程包：只含课程结构与题目，不含作答/复习记录。 */
  async exportPack(courseId) {
    const meta = await this.store.getCourse(courseId)
    const pack = exportCoursePack(meta)
    return { pack, prompt: buildPackPrompt(pack), stats: packStats(pack) }
  }

  /** 校验并预览导入，不写盘。 */
  async previewPack(courseId, input, options = {}) {
    const meta = await this.store.getCourse(courseId)
    const pack = normalizePack(input)
    const result = previewPackData(meta, pack, options)
    return { ...result, preview: true, stats: packStats({ chapters: pack.chapters, questions: pack.questions, relations: pack.relations }) }
  }

  /** 把外部模型生成的课程包合并进本地课程。 */
  async importPack(courseId, input, options = {}) {
    const pack = normalizePack(input)
    const { meta, result } = await this.store.mutateCourse(courseId, (draft) => mergePack(draft, pack, options))
    this.indexCache.clear()
    return {
      ...result,
      course: meta.course,
      stats: packStats({ chapters: pack.chapters, questions: pack.questions, relations: pack.relations }),
    }
  }

  /** Agent 维护概念关系。 */
  async upsertRelations(courseId, relations = []) {
    const { meta } = await this.store.mutateCourse(courseId, (draft) => {
      const byName = new Map((draft.concepts ?? []).map((c) => [termKey(c.name), c]))
      const byId = new Map((draft.concepts ?? []).map((c) => [c.id, c]))
      for (const input of relations.slice(0, 400)) {
        const resolve = (value) => byId.get(value) ?? byName.get(termKey(value)) ?? null
        const source = resolve(input?.sourceId ?? input?.source ?? '')
        const target = resolve(input?.targetId ?? input?.target ?? '')
        if (!source || !target || source.id === target.id) continue
        const type = ['prerequisite', 'related', 'contains', 'applies'].includes(input.type) ? input.type : 'related'
        const existing = (draft.relations ?? []).find((r) => r.sourceId === source.id && r.targetId === target.id && r.type === type)
        const weight = Math.max(0, Math.min(1, Number(input.weight) || 0.5))
        if (existing) { existing.weight = weight; continue }
        draft.relations.push({ id: newId('r'), sourceId: source.id, targetId: target.id, type, weight })
      }
      return draft.relations
    })
    return { relations: meta.relations, count: meta.relations.length }
  }

  // ------------------------------------------------------------ 进度查询

  async learningState(courseId, { conceptIds = null } = {}) {
    const meta = await this.store.getCourse(courseId)
    const states = buildConceptStates(meta)
    let values = [...states.values()]
    if (conceptIds?.length) {
      const wanted = new Set(conceptIds)
      values = values.filter((state) => wanted.has(state.conceptId))
    }
    return {
      courseId,
      concepts: values.map((state) => ({
        conceptId: state.conceptId,
        name: state.name,
        mastery: state.mastery,
        level: state.level,
        attempts: state.attempts,
        avgScore: state.avgScore,
        stability: state.stability,
        due: state.due,
        state: state.state,
      })),
      summary: {
        total: values.length,
        mastered: values.filter((v) => v.level === 'mastered').length,
        weak: values.filter((v) => v.mastery < 0.3).length,
        due: values.filter((v) => v.due && v.due <= Date.now()).length,
      },
    }
  }

  async dueReviews(courseId) {
    const meta = await this.store.getCourse(courseId)
    const { due } = buildReviews(meta)
    return { due, count: due.length }
  }

  async outline(courseId) {
    const meta = await this.store.getCourse(courseId)
    const blocksData = await this.store.getBlocks(courseId)
    return {
      course: { id: meta.course.id, name: meta.course.name, subject: meta.course.subject, goal: meta.course.goal },
      documents: (blocksData.documents ?? []).map((doc) => ({
        documentId: doc.documentId, filename: doc.filename, parser: doc.parser,
        pages: (doc.pages ?? []).length, charCount: doc.charCount ?? 0,
      })),
      chapters: (meta.chapters ?? []).map((chapter) => ({
        id: chapter.id, title: chapter.title, level: chapter.level, order: chapter.order,
        pageFrom: chapter.pageFrom, pageTo: chapter.pageTo,
        conceptCount: (chapter.conceptIds ?? []).length, summary: chapter.summary ?? '',
      })),
      conceptCount: (meta.concepts ?? []).length,
      stats: meta.analysis?.stats ?? null,
    }
  }

  /** 按块 id 读取原文（工具 read_source 用）。 */
  async readSource(courseId, { documentId = '', blockId = '', pageNo = null, maxChars = 2000 } = {}) {
    const blocksData = await this.store.getBlocks(courseId)
    const docs = documentId
      ? (blocksData.documents ?? []).filter((doc) => doc.documentId === documentId)
      : (blocksData.documents ?? [])
    const results = []
    for (const doc of docs) {
      for (const page of doc.pages ?? []) {
        if (pageNo && Number(pageNo) !== Number(page.pageNo)) continue
        for (const block of page.blocks ?? []) {
          if (blockId && block.id !== blockId) continue
          if (!block?.text) continue
          results.push({
            documentId: doc.documentId, filename: doc.filename, pageNo: page.pageNo,
            blockId: block.id, kind: block.kind, text: clip(block.text, Number(maxChars) || 2000),
          })
          if (results.length >= 40) break
        }
        if (results.length >= 40) break
      }
      if (results.length >= 40) break
    }
    if (!results.length) throw new DomainError('没有找到匹配的原文块', 404, 'block-not-found')
    return { blocks: results }
  }
}

/** 落库前清洗解析结果：折叠整段重复文本、丢弃空块。 */
export function cleanPages(pages = []) {
  const output = []
  for (const page of pages) {
    const blocks = []
    for (const block of page.blocks ?? []) {
      const text = collapseRepeats(oneLine(block.text))
      if (!text) continue
      blocks.push({ ...block, text })
    }
    if (blocks.length) output.push({ ...page, blocks })
  }
  return output
}

/** 供工具层共用的空值判断。 */
export function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === ''
}

/** 课程指纹（诊断用）。 */
export function courseFingerprint(meta) {
  return stableHash(`${meta.course?.id}:${(meta.concepts ?? []).length}:${(meta.chapters ?? []).length}`)
}

export { emptyMeta }
