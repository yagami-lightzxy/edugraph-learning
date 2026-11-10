/**
 * EduGraph AI · 学习计划生成。
 *
 * 计划是可修改的：每个任务都带概念、类型、预计时长与日期。重新生成时按
 * 「类型 + 概念集合」继承已完成任务的状态，避免改动目标后白学一遍。
 */
import { addDays, clip, daysBetween, newId, todayKey } from './util.js'

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
function taskKey(type, conceptIds) {
  return `${type}:${[...conceptIds].sort().join(',')}`
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
 * 生成学习计划。
 * @param {object} params
 * @param {object} params.meta 课程元数据（读 concepts / chapters / profile / plan）
 * @param {object} [params.profile] 覆盖课程档案（目标 / 每日时长 / 考试日期）
 * @param {Date} [params.now]
 * @param {object} [params.options] { maxDays, totalMinutes }
 * @returns {object} 新的 plan 对象
 */
export function generatePlan({ meta, profile = null, now = new Date(), options = {} } = {}) {
  const concepts = meta.concepts ?? []
  const chapters = meta.chapters ?? []
  const effective = { ...(meta.profile ?? {}), ...(profile ?? {}) }
  const dailyMinutes = clampNumber(effective.dailyMinutes, 10, 480, 45)
  const today = todayKey(now)
  const examDate = /^\d{4}-\d{2}-\d{2}$/.test(effective.examDate ?? '') ? effective.examDate : ''
  let horizonDays = examDate ? Math.max(1, daysBetween(today, examDate)) : clampNumber(options.maxDays, 3, 120, 14)
  // 总容量：天数 × 每日分钟；不足以覆盖全部单元时就压紧（允许一天多个单元）
  const units = buildUnits(concepts, chapters)
  const previous = meta.plan?.tasks ?? []
  const carry = new Map()
  for (const task of previous) {
    const key = task.key ?? taskKey(task.type, task.conceptIds ?? [])
    carry.set(key, { status: task.status, completedAt: task.completedAt, startedAt: task.startedAt, note: task.note })
  }

  const tasks = []
  const chapterById = new Map(chapters.map((c) => [c.id, c]))
  const push = (task) => {
    const key = taskKey(task.type, task.conceptIds ?? [])
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

  // 按天分配：第 1 天先做诊断/入门，随后按单元推进，复习任务插入到后续天。
  let day = 0
  let usedToday = 0
  const capacity = dailyMinutes
  const perDay = () => dailyMinutes
  let used = 0
  const advance = (minutes) => {
    if (used + minutes > capacity && used > 0) { day += 1; used = 0 }
    used += minutes
    if (day >= horizonDays - 1 && tasks.length > 24) {
      // 超出考试周期时压缩到后几天，但仍保留任务
      day = Math.min(day, horizonDays - 1)
    }
    return addDays(today, day)
  }

  const reviewQueue = []
  for (const unit of units) {
    const chapter = chapterById.get(unit.chapterId)
    const chapterTitle = chapter?.title ?? '未分章'
    const names = unit.concepts.map((c) => c.name)
    const conceptIds = unit.concepts.map((c) => c.id)
    if (!unit.concepts.length) continue
    const label = clip(names.join(' / '), 40)
    push({
      type: 'lesson',
      title: label === chapterTitle || label.startsWith(chapterTitle) ? label : `${chapterTitle} · ${label}`,
      conceptIds,
      chapterId: unit.chapterId ?? null,
      estimatedMinutes: TASK_TYPES.lesson.minutes,
      dueDate: advance(TASK_TYPES.lesson.minutes),
    })
    push({
      type: 'practice',
      title: `练习 · ${clip(names[0], 24)}`,
      conceptIds,
      chapterId: unit.chapterId ?? null,
      estimatedMinutes: TASK_TYPES.practice.minutes,
      dueDate: advance(TASK_TYPES.practice.minutes),
    })
    reviewQueue.push({ conceptIds, chapterId: unit.chapterId ?? null, baseDay: day, title: clip(names.join(' / '), 32) })
  }

  // 阶段测验：每章一次（章内单元 ≥ 2 时）
  const byChapter = new Map()
  for (const task of tasks) {
    if (task.type !== 'lesson' || !task.chapterId) continue
    byChapter.set(task.chapterId, [...(byChapter.get(task.chapterId) ?? []), ...task.conceptIds])
  }
  for (const [chapterId, conceptIds] of byChapter) {
    if (conceptIds.length < 2) continue
    const chapter = chapterById.get(chapterId)
    push({
      type: 'quiz',
      title: `阶段测验 · ${chapter?.title ?? '章节'}`,
      conceptIds: [...new Set(conceptIds)].slice(0, 12),
      chapterId,
      estimatedMinutes: TASK_TYPES.quiz.minutes,
      dueDate: advance(TASK_TYPES.quiz.minutes),
    })
  }

  // 间隔复习：+1 / +3 / +7 天各一轮，限制总量
  const offsets = [1, 3, 7]
  for (const item of reviewQueue) {
    offsets.forEach((offset, index) => {
      const dueDay = Math.min(horizonDays - 1, item.baseDay + offset)
      push({
        type: 'review',
        title: `复习 ${offset} 天后 · ${item.title}`,
        conceptIds: item.conceptIds,
        chapterId: item.chapterId,
        estimatedMinutes: TASK_TYPES.review.minutes,
        dueDate: addDays(today, dueDay),
        round: index + 1,
      })
    })
  }

  // 收尾总结
  if (concepts.length > 0) {
    push({
      type: 'recap',
      title: '总复习 · 错题与到期知识',
      conceptIds: concepts.slice(0, 10).map((c) => c.id),
      chapterId: null,
      estimatedMinutes: TASK_TYPES.recap.minutes,
      dueDate: addDays(today, Math.max(0, horizonDays - 1)),
    })
  }

  // 任务过多时合并最低优先级的复习任务
  let finalTasks = tasks
  if (tasks.length > 160) {
    const keep = tasks.filter((t) => t.type !== 'review' || t.round === 1).slice(0, 140)
    finalTasks = keep.map((t, index) => ({ ...t, order: index }))
  }

  const plan = {
    id: meta.plan?.id ?? newId('plan'),
    version: (meta.plan?.version ?? 0) + 1,
    goal: effective.goal || meta.course?.goal || '',
    status: 'ready',
    createdAt: meta.plan?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startDate: today,
    targetDate: examDate || addDays(today, horizonDays - 1),
    dailyMinutes,
    horizonDays,
    totalMinutes: finalTasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0),
    tasks: finalTasks.map((task, index) => ({ ...task, order: index })),
  }
  return plan
}

/** 计算计划进度。 */
export function planProgress(plan) {
  const tasks = plan?.tasks ?? []
  const done = tasks.filter((t) => t.status === 'done').length
  const today = todayKey()
  const due = tasks.filter((t) => t.status !== 'done' && String(t.dueDate) <= today).length
  return {
    total: tasks.length,
    done,
    remaining: tasks.length - done,
    dueToday: due,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    minutesDone: tasks.filter((t) => t.status === 'done').reduce((n, t) => n + (t.estimatedMinutes ?? 0), 0),
    minutesTotal: tasks.reduce((n, t) => n + (t.estimatedMinutes ?? 0), 0),
  }
}

/** 取下一批可执行任务（今天到期或最早未完成的）。 */
export function nextTasks(plan, limit = 3) {
  const tasks = plan?.tasks ?? []
  const pending = tasks.filter((t) => t.status !== 'done' && t.status !== 'skipped')
  const today = todayKey()
  const due = pending.filter((t) => String(t.dueDate) <= today)
  const sorted = [...due, ...pending.filter((t) => String(t.dueDate) > today).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))]
  return sorted.slice(0, limit)
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}
