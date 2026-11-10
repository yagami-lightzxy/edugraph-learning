/**
 * 真实课程验收脚本：用一份真实 PDF 走完整闭环。
 * 用法：node scripts/e2e-real.mjs "<pdf 路径>" [课程名]
 * 输出：解析规模、章节/概念/关系、计划规模、出题与判分结果。
 */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { LearningStore } from '../lib/store.js'
import { LearningService } from '../lib/service.js'
import { parseDocument } from '../lib/parse/index.js'

const file = process.argv[2]
const title = process.argv[3] ?? path.basename(file ?? 'course').replace(/\.[^.]+$/, '')
if (!file) {
  console.error('用法：node scripts/e2e-real.mjs "<pdf 路径>"')
  process.exit(1)
}

const tmp = await mkdtemp(path.join(os.tmpdir(), 'edugraph-e2e-'))
const started = Date.now()
try {
  const store = new LearningStore({ baseDir: tmp })
  await store.init()
  const service = new LearningService({ store, parser: { parseDocument }, config: {} })
  const { course } = await service.createCourse({ name: title, subject: '自动验收' })
  const buffer = await readFile(file)
  console.log(`课程 ${course.id}｜文件 ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)

  const t0 = Date.now()
  const { document } = await service.ingestDocument({ courseId: course.id, filename: path.basename(file), buffer })
  let meta = null
  for (let i = 0; i < 300; i += 1) {
    meta = await store.getCourse(course.id)
    const doc = meta.documents.find((item) => item.id === document.id)
    if (doc?.status === 'ready' || doc?.status === 'failed') break
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  const doc = meta.documents[0]
  console.log(`解析：${doc.status}｜${doc.parser}｜${doc.pages} 页｜${doc.charCount} 字｜耗时 ${Date.now() - t0}ms`)
  if (doc.status === 'failed') { console.error('解析失败：', doc.error); process.exit(2) }

  console.log(`章节 ${meta.chapters.length}｜概念 ${meta.concepts.length}｜关系 ${meta.relations.length}｜分析统计 ${JSON.stringify(meta.analysis?.stats ?? {})}`)
  console.log('前 8 个章节：')
  for (const chapter of meta.chapters.slice(0, 8)) console.log(`  L${chapter.level} 第${chapter.pageFrom}-${chapter.pageTo}页 ${chapter.title}（${(chapter.conceptIds ?? []).length} 个概念）`)
  console.log('前 12 个概念：')
  for (const concept of meta.concepts.slice(0, 12)) console.log(`  · ${concept.name}｜置信 ${concept.confidence.toFixed(2)}｜定义 ${(concept.definition || '').slice(0, 40)}`)
  console.log('前 6 条关系：')
  for (const relation of meta.relations.slice(0, 6)) {
    const from = meta.concepts.find((c) => c.id === relation.sourceId)?.name
    const to = meta.concepts.find((c) => c.id === relation.targetId)?.name
    console.log(`  ${from} -[${relation.type}]-> ${to}`)
  }

  const plan = await service.generatePlan(course.id, { dailyMinutes: 45 })
  console.log(`计划：${plan.plan.tasks.length} 个任务｜覆盖 ${plan.plan.horizonDays} 天｜总计 ${plan.plan.totalMinutes} 分钟｜首个任务「${plan.plan.tasks[0]?.title}」`)

  const quiz = await service.createQuiz(course.id, { count: 6, mode: 'practice' })
  console.log(`出题：${quiz.questions.length} 道｜题型 ${[...new Set(quiz.questions.map((q) => q.type))].join('/')}`)
  console.log(`  示例：${quiz.questions[0].stem.slice(0, 90).replace(/\n/g, ' ')}`)
  const stored = (await store.getCourse(course.id)).questions.find((q) => q.id === quiz.questions[0].id)
  const graded = await service.answerQuestion(course.id, { questionId: stored.id, answer: stored.answer, mode: 'practice' })
  console.log(`判分：正确=${graded.grade.correct} 分数=${graded.grade.score} 掌握度=${graded.state.mastery} 下次复习=${new Date(graded.review.due).toISOString().slice(0, 10)}`)

  const search = await service.search(course.id, '二极管 导通')
  console.log(`检索「二极管 导通」命中 ${search.results.length} 条；首条：${search.results[0]?.snippet?.slice(0, 80) ?? '（无）'}`)

  const overview = await service.overview(course.id)
  console.log(`概览：概念 ${overview.stats.concepts}｜已掌握 ${overview.stats.mastered}｜待复习 ${overview.stats.dueToday}｜正确率 ${overview.stats.accuracy}`)

  const snapshot = path.join(tmp, 'snapshot.json')
  await writeFile(snapshot, JSON.stringify({ chapters: meta.chapters.length, concepts: meta.concepts.length, relations: meta.relations.length, tasks: plan.plan.tasks.length }, null, 2))
  console.log(`总耗时 ${Date.now() - started}ms。验收快照：${snapshot}`)
  console.log('REAL-COURSE-OK')
} catch (error) {
  console.error('验收失败：', error)
  process.exitCode = 1
} finally {
  await rm(tmp, { recursive: true, force: true })
}
