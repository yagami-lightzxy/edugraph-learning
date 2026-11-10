/**
 * EduGraph AI · 掌握状态与概览聚合。
 *
 * 掌握度只从两条证据计算：答题记录（指数加权）与复习稳定性（FSRS）。
 * 概览、图谱、错题、复习四个页面共用这里的聚合结果，避免各自口径不同。
 */
import { computeMastery } from './grade.js'
import { nextTasks, planProgress } from './plan.js'
import { todayKey } from './util.js'

/** 单概念状态表：conceptId -> 掌握 / 到期 / 证据。 */
export function buildConceptStates(meta) {
  const attemptsByConcept = new Map()
  for (const attempt of meta.attempts ?? []) {
    if (!attempt?.conceptId) continue
    const list = attemptsByConcept.get(attempt.conceptId) ?? []
    list.push(attempt)
    attemptsByConcept.set(attempt.conceptId, list)
  }
  const reviewByConcept = new Map((meta.reviews ?? []).map((review) => [review.conceptId, review]))
  const states = new Map()
  for (const concept of meta.concepts ?? []) {
    const attempts = attemptsByConcept.get(concept.id) ?? []
    const review = reviewByConcept.get(concept.id) ?? null
    const mastery = computeMastery(attempts, review)
    states.set(concept.id, {
      conceptId: concept.id,
      name: concept.name,
      chapterId: concept.chapterId ?? null,
      mastery: mastery.mastery,
      level: mastery.level,
      attempts: mastery.attempts,
      avgScore: mastery.avgScore,
      lastScore: mastery.lastScore,
      stability: review?.stability ?? 0,
      due: review?.due ?? null,
      state: review?.state ?? 'new',
      lastReview: review?.lastReview ?? null,
    })
  }
  return states
}

/** 课程概览：给界面首屏与 Agent 用的一份完整快照。 */
export function buildOverview(meta) {
  const states = buildConceptStates(meta)
  const values = [...states.values()]
  const now = Date.now()
  const due = values.filter((state) => state.due && state.due <= now)
  const weak = values.filter((state) => state.mastery < 0.6).sort((a, b) => a.mastery - b.mastery)
  const chapters = (meta.chapters ?? []).map((chapter) => {
    const chapterStates = (chapter.conceptIds ?? []).map((id) => states.get(id)).filter(Boolean)
    const avg = chapterStates.length ? chapterStates.reduce((n, s) => n + s.mastery, 0) / chapterStates.length : 0
    const done = chapterStates.filter((s) => s.mastery >= 0.6).length
    return {
      id: chapter.id,
      title: chapter.title,
      level: chapter.level,
      order: chapter.order,
      pageFrom: chapter.pageFrom,
      pageTo: chapter.pageTo,
      summary: chapter.summary ?? '',
      conceptCount: chapterStates.length,
      masteredCount: done,
      mastery: Math.round(avg * 100) / 100,
    }
  })
  const progress = planProgress(meta.plan)
  const attemptsToday = (meta.attempts ?? []).filter((a) => String(a.createdAt).slice(0, 10) === todayKey())
  const scoreToday = attemptsToday.length
    ? Math.round((attemptsToday.reduce((n, a) => n + (a.score ?? 0), 0) / attemptsToday.length) * 100) / 100
    : null
  return {
    course: meta.course,
    profile: meta.profile,
    stats: {
      documents: (meta.documents ?? []).length,
      pages: (meta.documents ?? []).reduce((n, d) => n + (d.pages ?? 0), 0),
      chapters: chapters.length,
      concepts: values.length,
      mastered: values.filter((s) => s.mastery >= 0.85).length,
      familiar: values.filter((s) => s.mastery >= 0.6 && s.mastery < 0.85).length,
      weak: weak.filter((s) => s.mastery > 0).length,
      untouched: values.filter((s) => s.attempts === 0).length,
      attempts: (meta.attempts ?? []).length,
      accuracy: (meta.attempts ?? []).length
        ? Math.round(((meta.attempts ?? []).filter((a) => a.correct).length / (meta.attempts ?? []).length) * 100) / 100
        : null,
      dueToday: due.length,
      minutesDone: progress.minutesDone,
      minutesTotal: progress.minutesTotal,
    },
    chapters,
    weakConcepts: weak.slice(0, 12).map((state) => ({ id: state.conceptId, name: state.name, mastery: state.mastery, level: state.level })),
    dueReviews: due.slice(0, 20).map((state) => ({ conceptId: state.conceptId, name: state.name, due: state.due, mastery: state.mastery })),
    planProgress: progress,
    nextTasks: nextTasks(meta.plan, 3).map((task) => ({
      id: task.id, title: task.title, type: task.type, dueDate: task.dueDate,
      estimatedMinutes: task.estimatedMinutes, conceptIds: task.conceptIds, order: task.order,
    })),
    today: { attempts: attemptsToday.length, avgScore: scoreToday },
    updatedAt: meta.updatedAt,
  }
}

/** 知识图谱：章节为分组、概念为节点、关系为边，节点带掌握度。 */
export function buildGraph(meta) {
  const states = buildConceptStates(meta)
  const nodes = (meta.concepts ?? []).map((concept) => {
    const state = states.get(concept.id)
    return {
      id: concept.id,
      name: concept.name,
      chapterId: concept.chapterId ?? null,
      definition: concept.definition ?? '',
      confidence: concept.confidence ?? 0.5,
      mastery: state?.mastery ?? 0,
      level: state?.level ?? 'weak',
      attempts: state?.attempts ?? 0,
      sourceCount: (concept.sourceRefs ?? []).length,
    }
  })
  const edges = (meta.relations ?? []).map((relation) => ({
    id: relation.id ?? `${relation.sourceId}-${relation.targetId}`,
    source: relation.sourceId,
    target: relation.targetId,
    type: relation.type,
    weight: relation.weight ?? 0.5,
  }))
  const chapters = (meta.chapters ?? []).map((chapter) => ({
    id: chapter.id, title: chapter.title, level: chapter.level, order: chapter.order,
    conceptCount: (chapter.conceptIds ?? []).length,
  }))
  return { nodes, edges, chapters }
}

/** 到期复习：按到期时间排序。 */
export function buildReviews(meta, now = Date.now()) {
  const states = buildConceptStates(meta)
  const due = []
  const upcoming = []
  for (const state of states.values()) {
    if (!state.due) continue
    const item = {
      conceptId: state.conceptId,
      name: state.name,
      due: state.due,
      mastery: state.mastery,
      stability: state.stability,
      state: state.state,
      overdueDays: Math.max(0, Math.round((now - state.due) / 86400000)),
    }
    if (state.due <= now) due.push(item)
    else upcoming.push(item)
  }
  due.sort((a, b) => a.due - b.due)
  upcoming.sort((a, b) => a.due - b.due)
  return { due, upcoming: upcoming.slice(0, 30), counts: { due: due.length, upcoming: upcoming.length } }
}

/** 错题本：按概念分组，附最近错误与错误标签统计。 */
export function buildMistakes(meta) {
  const wrong = (meta.attempts ?? []).filter((attempt) => !attempt.correct)
  const byConcept = new Map()
  for (const attempt of wrong) {
    const list = byConcept.get(attempt.conceptId) ?? []
    list.push(attempt)
    byConcept.set(attempt.conceptId, list)
  }
  const conceptById = new Map((meta.concepts ?? []).map((c) => [c.id, c]))
  const groups = [...byConcept.entries()].map(([conceptId, attempts]) => {
    const concept = conceptById.get(conceptId)
    const tags = new Map()
    for (const attempt of attempts) {
      for (const tag of attempt.errorTags ?? []) tags.set(tag, (tags.get(tag) ?? 0) + 1)
    }
    return {
      conceptId,
      conceptName: concept?.name ?? '未知概念',
      definition: concept?.definition ?? '',
      chapterId: concept?.chapterId ?? null,
      wrongCount: attempts.length,
      lastAt: attempts[attempts.length - 1]?.createdAt ?? null,
      lastAnswer: attempts[attempts.length - 1]?.answer ?? '',
      errorTags: [...tags.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count })),
      attempts: attempts.slice(-5).map((attempt) => ({
        id: attempt.id, questionId: attempt.questionId, answer: attempt.answer,
        score: attempt.score, createdAt: attempt.createdAt, errorTags: attempt.errorTags ?? [],
      })),
    }
  })
  groups.sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)))
  return { groups, total: wrong.length, conceptCount: groups.length }
}

/** 学习事件流（最近 N 条），用于概览时间线。 */
export function recentEvents(meta, limit = 20) {
  return [...(meta.events ?? [])]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit)
    .map((event) => ({
      id: event.id,
      type: event.type,
      conceptId: event.conceptId ?? null,
      conceptName: (meta.concepts ?? []).find((c) => c.id === event.conceptId)?.name ?? '',
      createdAt: event.createdAt,
      evidence: event.evidence ?? '',
    }))
}

/** 一节课的内容包：任务 + 概念卡片（含原文引用）+ 主动回忆提示。 */
export function buildLesson(meta, taskId) {
  const task = (meta.plan?.tasks ?? []).find((item) => item.id === taskId) ?? null
  const conceptIds = task?.conceptIds ?? []
  const conceptById = new Map((meta.concepts ?? []).map((c) => [c.id, c]))
  const chapterById = new Map((meta.chapters ?? []).map((c) => [c.id, c]))
  const states = buildConceptStates(meta)
  const cards = conceptIds.map((id) => {
    const concept = conceptById.get(id)
    if (!concept) return null
    const state = states.get(id)
    return {
      id: concept.id,
      name: concept.name,
      definition: concept.definition ?? '',
      chapterTitle: chapterById.get(concept.chapterId)?.title ?? '',
      confidence: concept.confidence ?? 0.5,
      mastery: state?.mastery ?? 0,
      level: state?.level ?? 'weak',
      attempts: state?.attempts ?? 0,
      sourceRefs: (concept.sourceRefs ?? []).slice(0, 3).map((ref) => ({
        documentId: ref.documentId, pageNo: ref.pageNo, quote: ref.quote ?? '',
      })),
      related: (meta.relations ?? [])
        .filter((r) => r.sourceId === id || r.targetId === id)
        .slice(0, 5)
        .map((r) => {
          const otherId = r.sourceId === id ? r.targetId : r.sourceId
          return { conceptId: otherId, name: conceptById.get(otherId)?.name ?? '', type: r.type }
        }),
    }
  }).filter(Boolean)
  return {
    task,
    cards,
    chapterTitle: chapterById.get(task?.chapterId)?.title ?? '',
    recallPrompt: cards.length
      ? `合上资料，用一句话说明「${cards.map((c) => c.name).slice(0, 3).join('」「')}」分别是什么，以及它们之间的关系。`
      : '',
    dueCount: buildReviews(meta).counts.due,
  }
}
