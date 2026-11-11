/**
 * EduGraph AI · 学习计划生成。
 *
 * 按章节推进：一章内的讲解、练习、复习和小测成组，不按每天可用分钟切日期。
 * 重新生成时按「类型 + 概念集合 + 轮次」继承已完成任务的状态。
 */
import { clip, newId, todayKey } from './util.js'

/** 任务类型与默认时长（分钟）。 */
export const TASK_TYPES = {
  lesson: { label: '讲解', minutes: 12 },
  practice: { label: '练习', minutes: 8 },
  quiz: { label: '阶段测验', minutes: 10 },
  review: { label: '复习', minutes: 6 },
  recap: { label: '总结', minutes: 15 },
}

/** 概念在课程内的自然顺序：章节序 + 首次出现页。 */
export function orderConcepts(concepts, chapters) {
  const chapterOrder = new Map(chapters.map((c) => [c.id, c.order]))
  return [...concepts].sort((a, b) => {
    const ao = chapterOrder.get(a.chapterId) ?? 999
    const bo = chapterOrder.get(b.chapterId) ?? 999
    if (ao !== bo) return ao - bo
    const ap = a.sourceRefs?.[0]?.pageNo ?? 9999
    const bp = b.sourceRefs?.[0]?.pageNo ?? 9999
    if (ap !== bp) return ap - bp
    return String(a.name).localeCompare(String(b.name))
  })
}

/** 任务稳定键：用于重新生成时继承进度。 */
function taskKey(type, conceptIds, round) {
  return `${type}:${round ?? ''}:${[...conceptIds].sort().join(',')}`
}

/** 把概念切成教学单元（每单元 1-3 个概念）。 */
export function buildUnits(concepts, chapters) {
  const ordered = orderConcepts(concepts, chapters)
  const units = []
  let index = 0
  while (index < ordered.length) {
    const first = ordered[index]
    const size = (first.definition?.length ?? 0) > 120 ? 1 : (first.definition?.length ?? 0) > 60 ? 2 : 3
    const group = ordered.slice(index, index + size).filter((c) => c.chapterId === first.chapterId)
    const picked = group.length ? group : [first]
    units.push({ chapterId: first.chapterId, concepts: picked })
    index += picked.length
  }
  return units
}

/**
 * 生成按章节推进的学习计划。
 * @param {object} params
 * @param {object} params.meta 课程元数据（读 concepts / chapters / profile / plan）
 * @param {object} [params.profile] 覆盖课程档案（目标 / 考试日期）
 * @param {Date} [params.now]
 * @returns {object} 新的 plan 对象
 */
export function generatePlan({ meta, profile = null, now = new Date() } = {}) {
  const concepts = meta.concepts ?? []
  const chapters = meta.chapters ?? []
  const effective = { ...(meta.profile ?? {}), ...(profile ?? {}) }
  const today = todayKey(now)
  const examDate = /^\d{4}-\d{2}-\d{2}$/.test(effective.examDate ?? '') ? effective.examDate : ''
  const units = buildUnits(concepts, chapters)
  const previous = meta.plan?.tasks ?? []
  const carry = new Map()
  for (const task of previous) {
    const key = task.key ?? taskKey(task.type, task.conceptIds ?? [], task.round)
    carry.set(key, { status: task.status, completedAt: task.completedAt, startedAt: task.startedAt, note: task.note })
  }

  const tasks = []
  const chapterById = new Map(chapters.map((c) => [c.id, c]))
  const chapterTitleOf = (chapterId) => chapterById.get(chapterId)?.title ?? '未分章'
  const push = (task) => {
    const key = taskKey(task.type, task.conceptIds ?? [], task.round)
    const inherited = carry.get(key)
    tasks.push({
      id: newId('t'),
      order: tasks.length,
      key,
      status: inherited?.status === 'done' ? 'done' : (inherited?.status ?? 'todo'),
      completedAt: inherited?.completedAt ?? null,
      startedAt: inherited?.startedAt ?? null,
      note: inherited?.note ?? '',
      ...task,
    })
  }

  // 每章按单元推进：讲解 → 练习 → 三轮复习；不写日期，学完一章再进下一章。
  for (const unit of units) {
    if (!unit.concepts.length) continue
    const chapterTitle = chapterTitleOf(unit.chapterId)
    const names = unit.concepts.map((c) => c.name)
    const conceptIds = unit.concepts.map((c) => c.id)
    const label = clip(names.join(' / '), 40)
    push({
      type: 'lesson',
      title: label === chapterTitle || label.startsWith(chapterTitle) ? label : `${chapterTitle} · ${label}`,
      conceptIds,
      chapterId: unit.chapterId ?? null,
      chapterTitle,
      estimatedMinutes: TASK_TYPES.lesson.minutes,
    })
    push({
      type: 'practice',
      title: `练习 · ${clip(names[0], 24)}`,
      conceptIds,
      chapterId: unit.chapterId ?? null,
      chapterTitle,
      estimatedMinutes: TASK_TYPES.practice.minutes,
    })
    for (let round = 1; round <= 3; round += 1) {
      push({
        type: 'review',
        title: `第 ${round} 轮复习 · ${clip(names.join(' / '), 32)}`,
        conceptIds,
        chapterId: unit.chapterId ?? null,
        chapterTitle,
        estimatedMinutes: TASK_TYPES.review.minutes,
        round,
      })
    }
  }

  // 阶段测验：每章一次（章内单元 ≥ 2 时）
  const byChapter = new Map()
  for (const task of tasks) {
    if (task.type !== 'lesson' || !task.chapterId) continue
    byChapter.set(task.chapterId, [...(byChapter.get(task.chapterId) ?? []), ...task.conceptIds])
  }
  for (const [chapterId, conceptIds] of byChapter) {
    if (conceptIds.length < 2) continue
    const chapterTitle = chapterTitleOf(chapterId)
    push({
      type: 'quiz',
      title: `阶段测验 · ${chapterTitle}`,
      conceptIds: [...new Set(conceptIds)].slice(0, 12),
      chapterId,
      chapterTitle,
      estimatedMinutes: TASK_TYPES.quiz.minutes,
    })
  }

  // 收尾总结
  if (concepts.length > 0) {
    push({
      type: 'recap',
      title: '总复习 · 错题与到期知识',
      conceptIds: concepts.slice(0, 10).map((c) => c.id),
      chapterId: null,
      chapterTitle: '总复习',
      estimatedMinutes: TASK_TYPES.recap.minutes,
    })
  }

  // 任务过多时合并最低优先级的复习任务。
  let finalTasks = tasks
  if (tasks.length > 160) {
    const keep = tasks.filter((t) => t.type !== 'review' || t.round === 1).slice(0, 140)
    finalTasks = keep.map((t, index) => ({ ...t, order: index }))
  }

  return {
    id: meta.plan?.id ?? newId('plan'),
    version: (meta.plan?.version ?? 0) + 1,
    goal: effective.goal || meta.course?.goal || '',
    status: 'ready',
    createdAt: meta.plan?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startDate: today,
    targetDate: examDate,
    totalMinutes: finalTasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0),
    tasks: finalTasks.map((task, index) => ({ ...task, order: index })),
  }
}

/** 计算计划进度。 */
export function planProgress(plan) {
  const tasks = plan?.tasks ?? []
  const done = tasks.filter((t) => t.status === 'done').length
  return {
    total: tasks.length,
    done,
    remaining: tasks.length - done,
    dueToday: 0,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    minutesDone: tasks.filter((t) => t.status === 'done').reduce((n, t) => n + (t.estimatedMinutes ?? 0), 0),
    minutesTotal: tasks.reduce((n, t) => n + (t.estimatedMinutes ?? 0), 0),
  }
}

/** 取下一批可执行任务（按章节顺序，不看日期）。 */
export function nextTasks(plan, limit = 3) {
  const tasks = plan?.tasks ?? []
  const pending = tasks
    .filter((t) => t.status !== 'done' && t.status !== 'skipped')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return pending.slice(0, limit)
}
