/**
 * 端到端（服务端）测试：资料入库 → 结构分析 → 计划 → 出题 → 判分 → 复习 → 检索 → 概览。
 * 用临时目录做存储，不碰用户数据。解析器优先用真实 lib/parse，缺失时用内置的 Markdown 桩。
 */
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { LearningStore } from '../lib/store.js'
import { LearningService } from '../lib/service.js'
import { createToolDefinitions } from '../lib/tools.js'
import { createApiHandler } from '../lib/api.js'
import { analyzeCourse } from '../lib/analyze.js'
import { generatePlan, planProgress } from '../lib/plan.js'
import { generateQuestions } from '../lib/quiz.js'
import { gradeAnswer, scoreToRating, keyPoints, coverage } from '../lib/grade.js'

const FENCE = String.fromCharCode(96, 96, 96)
const MARKDOWN = ['# 模拟电子技术',

  '', '## 第一章 半导体基础', '',
  '半导体是指导电能力介于导体和绝缘体之间的材料。本征半导体是纯净的半导体晶体。', '',
  '- 硅和锗是最常用的半导体材料', '- 温度升高时，本征载流子浓度增大', '',
  '## 第二章 二极管', '',
  'PN 结是 P 型半导体与 N 型半导体接触形成的结。二极管由一个 PN 结加上引线和封装构成。', '',
  '二极管的正向导通电压约为 0.7V。当阳极电压高于阴极电压时，二极管导通。', '',
  FENCE + 'text', 'VD = 0.7V', FENCE, '',
  '## 第三章 三极管', '',
  '三极管是指具有三个电极的半导体器件，分为 NPN 与 PNP 两种类型。', '',
  '三极管的电流放大系数是指集电极电流与基极电流之比。', '',
  '| 类型 | 符号 |', '| --- | --- |', '| NPN | T1 |',
].join('\n')

/** 解析桩：把 Markdown 切成 heading/paragraph/list/code/table 块。 */
const stubParser = {
  async parseDocument({ buffer, filename }) {
    const text = buffer.toString('utf8')
    const blocks = []
    const lines = text.split(/\r?\n/)
    let page = 1
    let order = 0
    let inCode = false
    let code = []
    for (const line of lines) {
      if (line.startsWith(FENCE)) {
        if (inCode) { blocks.push({ id: `b${order}`, kind: 'code', text: code.join('\n'), pageNo: page, order: order }); order += 1; code = [] }
        inCode = !inCode
        continue
      }
      if (inCode) { code.push(line); continue }
      if (!line.trim()) continue
      const heading = /^(#{1,6})\s+(.*)$/.exec(line)
      if (heading) {
        blocks.push({ id: `b${order}`, kind: 'heading', level: heading[1].length, text: heading[2].trim(), pageNo: page, order: order, style: { fontSize: 24 - heading[1].length * 2, bold: true } })
        order += 1
        continue
      }
      const kind = /^[-*]\s+/.test(line) ? 'list' : /^\|/.test(line) ? 'table' : 'paragraph'
      blocks.push({ id: `b${order}`, kind, text: line.replace(/^[-*]\s+/, '').trim(), pageNo: page, order: order })
      order += 1
      if (order % 12 === 0) page += 1
    }
    return { parser: 'markdown', status: 'parsed', title: filename, pages: [{ pageNo: 1, blocks }], charCount: text.length, warnings: [] }
  },
}

let tmpDir
let store
let service

async function waitFor(condition, timeoutMs = 8000, stepMs = 80) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const value = await condition()
    if (value) return value
    await new Promise((resolve) => setTimeout(resolve, stepMs))
  }
  throw new Error('等待超时')
}

before(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'edugraph-test-'))
  store = new LearningStore({ baseDir: tmpDir })
  await store.init()
  service = new LearningService({ store, parser: stubParser, config: {} })
})

after(async () => {
  if (tmpDir) await rm(tmpDir, { recursive: true, force: true })
})

describe('纯函数：分析 / 计划 / 题目 / 判分', () => {
  it('从块结构里抽出章节、概念与关系', () => {
    const documents = [{
      documentId: 'doc1',
      filename: 'note.md',
      parser: 'markdown',
      pages: [{ pageNo: 1, blocks: [
        { id: 'b0', kind: 'heading', level: 1, text: '模拟电子技术', pageNo: 1 },
        { id: 'b1', kind: 'heading', level: 2, text: '第一章 半导体基础', pageNo: 1 },
        { id: 'b2', kind: 'paragraph', text: '半导体是指导电能力介于导体和绝缘体之间的材料。', pageNo: 1 },
        { id: 'b3', kind: 'heading', level: 2, text: '第二章 二极管', pageNo: 1 },
        { id: 'b4', kind: 'paragraph', text: '二极管的正向导通电压约为 0.7V。PN 结是二极管的核心结构。', pageNo: 1 },
      ] }],
    }]
    const analysis = analyzeCourse({ courseId: 'c1', documents })
    assert.ok(analysis.chapters.length >= 3, '至少识别出 3 个章节')
    assert.ok(analysis.concepts.length >= 3, '至少抽出 3 个概念')
    const diode = analysis.concepts.find((c) => c.name.includes('二极管'))
    assert.ok(diode, '应包含「二极管」概念')
    assert.ok(diode.definition.length > 0, '二极管应有定义或出处句')
    assert.ok(diode.sourceRefs.length > 0, '概念应带来源引用')
  })

  it('习题覆盖四种题型且答案可判', () => {
    const meta = {
      concepts: [
        { id: 'k1', name: '二极管', definition: '二极管由一个 PN 结构成，正向导通电压约 0.7V。', chapterId: 'ch1', confidence: 0.8, sourceRefs: [] },
        { id: 'k2', name: '三极管', definition: '三极管是三个电极的半导体器件，分 NPN 与 PNP。', chapterId: 'ch1', confidence: 0.8, sourceRefs: [] },
        { id: 'k3', name: 'PN 结', definition: 'PN 结是 P 型与 N 型半导体接触形成的结。', chapterId: 'ch1', confidence: 0.8, sourceRefs: [] },
      ],
      questions: [],
    }
    const created = generateQuestions({ meta, conceptIds: ['k1', 'k2', 'k3'], count: 12, blocks: [] })
    assert.ok(created.length >= 6, `应生成至少 6 道题，实际 ${created.length}`)
    const types = new Set(created.map((q) => q.type))
    assert.ok(types.size >= 3, '题型应有多样性')
    const choice = created.find((q) => q.type === 'choice')
    assert.ok(choice.options.length >= 2)
    const graded = gradeAnswer(choice, choice.answer)
    assert.equal(graded.correct, true)
    const wrong = gradeAnswer(choice, (Number(choice.answer) + 1) % choice.options.length)
    assert.equal(wrong.correct, false)
    const reverse = created.find((q) => q.type === 'choice-reverse')
    assert.ok(reverse, '应生成反向选择题')
    assert.equal(gradeAnswer(reverse, reverse.answer).correct, true, '反向选择题选正确项应判对')
    assert.equal(gradeAnswer(reverse, (Number(reverse.answer) + 1) % reverse.options.length).correct, false)
    const judge = created.find((q) => q.type === 'judge')
    assert.ok(judge, '应生成判断题')
    assert.equal(gradeAnswer(judge, judge.answer).correct, true)
    assert.equal(gradeAnswer(judge, 1 - Number(judge.answer)).correct, false)
  })

  it('简答题按关键点覆盖给分', () => {
    const points = keyPoints('二极管由一个 PN 结构成，正向导通电压约为 0.7V。')
    assert.ok(points.length >= 1)
    const full = coverage('二极管由 PN 结构成，导通电压 0.7V', points)
    assert.ok(full.ratio > 0)
    const rating = scoreToRating(0.9)
    assert.equal(rating, 4)
    assert.equal(scoreToRating(0.1), 1)
  })

  it('计划按天排布并保留已完成任务', () => {
    const meta = {
      course: { id: 'c1', name: '测试课', goal: '' },
      profile: { dailyMinutes: 45, examDate: '' },
      chapters: [
        { id: 'ch1', title: '第一章', level: 1, order: 0 },
        { id: 'ch2', title: '第二章', level: 1, order: 1 },
      ],
      concepts: Array.from({ length: 8 }, (_, i) => ({
        id: `k${i}`, name: `概念${i}`, definition: '这是一个用于测试的定义文本，长度足够参与题目生成。', chapterId: i < 4 ? 'ch1' : 'ch2', confidence: 0.7, sourceRefs: [],
      })),
      plan: null,
    }
    const plan = generatePlan({ meta, now: new Date('2026-11-10T08:00:00') })
    assert.ok(plan.tasks.length > 0)
    assert.ok(plan.tasks.some((t) => t.type === 'lesson'))
    assert.ok(plan.tasks.some((t) => t.type === 'review'))
    const progress = planProgress(plan)
    assert.equal(progress.done, 0)
    // 重新生成时继承完成状态
    plan.tasks[0].status = 'done'
    const regenerated = generatePlan({ meta: { ...meta, plan }, now: new Date('2026-11-10T08:00:00') })
    assert.equal(regenerated.tasks[0].key, plan.tasks[0].key)
    assert.equal(regenerated.tasks[0].status, 'done')
  })
})

describe('学习闭环（真实存储）', () => {
  let courseId
  let documentId

  it('创建课程 → 上传资料 → 自动解析与分析', async () => {
    const bundle = await service.createCourse({ name: '模拟电子技术', subject: '电子', goal: '两周掌握二极管' })
    courseId = bundle.course.id
    assert.ok(courseId)

    const { document } = await service.ingestDocument({
      courseId, filename: 'note.md', buffer: Buffer.from(MARKDOWN, 'utf8'), mimeType: 'text/markdown',
    })
    documentId = document.id
    const meta = await waitFor(async () => {
      const current = await store.getCourse(courseId)
      const doc = current.documents.find((item) => item.id === documentId)
      return doc?.status === 'ready' ? current : null
    })
    assert.equal(meta.documents[0].status, 'ready')
    assert.ok(meta.chapters.length >= 2, `章节数 ${meta.chapters.length}`)
    assert.ok(meta.concepts.length >= 3, `概念数 ${meta.concepts.length}`)
  })

  it('概览 / 图谱 / 检索都能读到来源', async () => {
    const overview = await service.overview(courseId)
    assert.ok(overview.stats.concepts >= 3)
    const graph = await service.graph(courseId)
    assert.equal(graph.nodes.length, overview.stats.concepts)

    const found = await service.search(courseId, '二极管 导通')
    assert.ok(found.results.length > 0, '中文检索应命中')
    assert.ok(found.results[0].meta.kind, '结果应带来源类型')
  })

  it('生成计划 → 出题 → 判分 → 掌握度与复习时间更新', async () => {
    const { plan } = await service.generatePlan(courseId, { dailyMinutes: 30 })
    assert.ok(plan.tasks.length > 0)

    const quiz = await service.createQuiz(courseId, { count: 5, mode: 'practice' })
    assert.ok(quiz.questions.length > 0)
    assert.equal(quiz.questions[0].answer, undefined, '返回给界面的题目不应包含答案')

    const question = quiz.questions[0]
    const meta = await store.getCourse(courseId)
    const stored = meta.questions.find((q) => q.id === question.id)
    const result = await service.answerQuestion(courseId, { questionId: question.id, answer: stored.answer, mode: 'practice' })
    assert.equal(result.grade.correct, true)
    assert.equal(result.attempt.score, 1)
    assert.ok(result.review.due > Date.now(), '答对后应安排下次复习')
    assert.ok(result.state.mastery > 0)

    const reviews = await service.reviews(courseId)
    assert.ok(reviews.counts.upcoming >= 1)

    const wrong = await service.answerQuestion(courseId, { questionId: question.id, answer: '完全错误的答案', mode: 'practice' })
    assert.equal(wrong.grade.correct, false)
    const mistakes = await service.mistakes(courseId)
    assert.ok(mistakes.total >= 1)
  })

  it('手工复习评分与掌握状态查询', async () => {
    const meta = await store.getCourse(courseId)
    const concept = meta.concepts[0]
    const graded = await service.gradeReview(courseId, concept.id, 2.6)
    assert.ok(graded.review.due > 0, '浮点评分应被四舍五入后接受')
    const state = await service.learningState(courseId, { conceptIds: [concept.id] })
    assert.equal(state.concepts.length, 1)
    const due = await service.dueReviews(courseId)
    assert.ok(Array.isArray(due.due))
  })

  it('UI 状态与档案可持久化', async () => {
    await store.saveState({ activeCourseId: courseId, activeView: 'plan', enabled: true })
    const state = await store.getState()
    assert.equal(state.activeCourseId, courseId)
    assert.equal(state.activeView, 'plan')
    await store.saveProfile({ goal: '通过考试', dailyMinutes: 60 })
    const profile = await store.getProfile()
    assert.equal(profile.dailyMinutes, 60)
  })

  it('HTTP 接口可完成一次完整往返', async () => {
    const handler = createApiHandler({ service, store, config: {}, version: 'test' })
    const run = (pathname, init) => new Promise(async (resolve) => {
      const response = {
        statusCode: 200, headers: {},
        setHeader(key, value) { this.headers[key] = value },
        end(body) { resolve({ status: this.statusCode, body: JSON.parse(body) }) },
      }
      const request = {
        method: init?.method ?? 'GET',
        url: `/plugins/edugraph-learning/api${pathname}`,
        headers: init?.headers ?? {},
        on(event, listener) {
          if (event === 'data' && init?.body) listener(Buffer.from(init.body))
          if (event === 'end') listener()
          return this
        },
      }
      await handler(request, response)
    })

    const health = await run('/health')
    assert.equal(health.body.ok, true)
    const list = await run('/courses')
    assert.ok(list.body.courses.length >= 1)
    const overview = await run(`/courses/${courseId}/overview`)
    assert.equal(overview.body.ok, true)
    const quiz = await run(`/courses/${courseId}/quiz`, { method: 'POST', body: JSON.stringify({ count: 2 }) })
    assert.equal(quiz.body.questions.length, 2)
    const answer = await run(`/courses/${courseId}/quiz/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId: quiz.body.questions[1].id, answer: '0' }),
    })
    assert.equal(answer.body.ok, true)
    const missing = await run('/courses/not-exist/overview')
    assert.equal(missing.status, 404)
  })

  it('删除资料后会重新分析', async () => {
    await service.deleteDocument(courseId, documentId)
    const meta = await store.getCourse(courseId)
    assert.equal(meta.documents.length, 0)
    assert.equal(meta.concepts.length, 0)
  })
})

describe('Agent 工具', () => {
  it('每个工具都有合法结构', () => {
    const definitions = createToolDefinitions({ service, store })
    const expected = [
      'list_courses', 'get_document_outline', 'read_source', 'search_materials',
      'upsert_concepts', 'upsert_relations', 'get_student_profile', 'save_student_profile',
      'create_study_plan', 'update_study_plan', 'create_quiz', 'grade_answer',
      'record_learning_event', 'get_learning_state', 'get_due_reviews', 'get_course_overview',
      'get_page_image', 'list_document_images',
    ]
    assert.deepEqual(definitions.map((tool) => tool.name).sort(), expected.sort())
    for (const definition of definitions) {
      assert.equal(typeof definition.description, 'string')
      assert.ok(definition.description.length > 10)
      assert.equal(definition.parameters.type, 'object')
      assert.equal(typeof definition.output.render, 'function')
      const rendered = definition.output.render({}, { ok: true })
      assert.ok(Array.isArray(rendered) && rendered[0].type === 'text')
    }
  })

  it('list_courses 与 get_course_overview 能返回真实数据', async () => {
    const definitions = createToolDefinitions({ service, store })
    const listTool = definitions.find((tool) => tool.name === 'list_courses')
    const list = await listTool.execute({})
    assert.ok(Array.isArray(list.courses))
    // 上一组用例已删资料，这里重新建一门课验证 overview 工具路径
    const created = await service.createCourse({ name: '工具课' })
    const overviewTool = definitions.find((tool) => tool.name === 'get_course_overview')
    const overview = await overviewTool.execute({ courseId: created.course.id })
    assert.equal(overview.courseId, created.course.id)
    assert.ok(overview.stats)
  })
})
