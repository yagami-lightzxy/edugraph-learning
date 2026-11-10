/**
 * EduGraph AI · 外部模型课程包。
 *
 * 让 ChatGPT / Claude / Gemini 这类外部模型按一份稳定的 JSON 结构生成
 * 章节、概念、题目和关系，再由本插件校验、合并进本地课程。
 * 外部模型不直接碰 meta.json：所有字段都经过长度、引用、答案合法性检查。
 */
import { DomainError } from './store.js'
import { newId, oneLine } from './util.js'
import { termKey } from './analyze.js'

export const PACK_FORMAT = 'edugraph-course-pack'
export const PACK_VERSION = 1

const LIMITS = { chapters: 100, concepts: 1000, questions: 1000, relations: 3000 }
const QUESTION_TYPES = new Set(['choice', 'choice-reverse', 'judge', 'cloze', 'short'])

function invalid(detail) {
  return new DomainError('AI 课程包校验失败：' + detail, 400, 'invalid-course-pack')
}

function text(value, max = 1000) {
  return String(value ?? '').replace(/\r\n/g, '\n').trim().slice(0, max)
}

function nameOf(value, max = 80) {
  return oneLine(value).slice(0, max)
}

function stemKey(value) {
  return oneLine(value).toLowerCase().replace(/[\s\u3000.,，。;；:：!！?？'"“”‘’()（）\[\]{}<>《》、·\-—_/\\|+*=~]/g, '')
}

function coercePack(input) {
  if (input && typeof input === 'object' && !Array.isArray(input)) return input
  if (typeof input !== 'string') return null
  let source = input.trim()
  source = source.replace(/^\uFEFF/, '').replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  try { return JSON.parse(source) } catch { return null }
}

function conceptOut(concept) {
  const quote = concept.sourceRefs?.[0]?.quote ?? ''
  return {
    name: concept.name,
    definition: concept.definition ?? '',
    ...(quote ? { sourceQuote: quote } : {}),
  }
}

/** 导出成可交给外部模型的课程包；不包含个人作答/复习记录。 */
export function exportCoursePack(meta) {
  const concepts = meta.concepts ?? []
  const byId = new Map(concepts.map((concept) => [concept.id, concept]))
  const used = new Set()
  const chapters = []
  for (const chapter of [...(meta.chapters ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
    const list = (chapter.conceptIds ?? []).map((id) => byId.get(id)).filter(Boolean)
    for (const concept of list) used.add(concept.id)
    chapters.push({
      title: chapter.title,
      summary: chapter.summary ?? '',
      concepts: list.map(conceptOut),
    })
  }
  const rest = concepts.filter((concept) => !used.has(concept.id))
  if (rest.length) chapters.push({ title: '未分章', summary: '', concepts: rest.map(conceptOut) })

  const questions = (meta.questions ?? []).map((question) => ({
    conceptName: question.conceptName ?? byId.get(question.conceptId)?.name ?? '',
    type: question.type,
    stem: question.stem,
    options: question.options ?? [],
    answer: question.answer,
    explanation: question.explanation ?? '',
  })).filter((question) => question.conceptName)

  const relations = (meta.relations ?? []).map((relation) => ({
    from: byId.get(relation.sourceId)?.name ?? '',
    to: byId.get(relation.targetId)?.name ?? '',
    type: relation.type,
    weight: relation.weight,
  })).filter((relation) => relation.from && relation.to)

  const plan = meta.plan ? {
    dailyMinutes: meta.profile?.dailyMinutes ?? meta.plan.dailyMinutes,
    targetDate: meta.plan.targetDate ?? '',
    tasks: (meta.plan.tasks ?? []).slice(0, 300).map((task) => ({
      title: task.title,
      type: task.type,
      conceptNames: (task.conceptIds ?? []).map((id) => byId.get(id)?.name).filter(Boolean),
      estimatedMinutes: task.estimatedMinutes,
      dueDate: task.dueDate,
      status: task.status,
    })),
  } : null

  return {
    format: PACK_FORMAT,
    version: PACK_VERSION,
    exportedAt: new Date().toISOString(),
    course: {
      id: meta.course?.id ?? '',
      name: meta.course?.name ?? '',
      subject: meta.course?.subject ?? '',
      goal: meta.course?.goal ?? '',
      examDate: meta.profile?.examDate ?? '',
      dailyMinutes: meta.profile?.dailyMinutes ?? 45,
      level: meta.profile?.level ?? 'unknown',
    },
    chapters,
    questions,
    relations,
    plan,
    note: 'plan 只作上下文，导入时不会修改学习计划；不要输出 attempts / events / reviews。',
  }
}

/** 包大小摘要，给界面和工具返回值用。 */
export function packStats(pack) {
  return {
    chapters: pack?.chapters?.length ?? 0,
    concepts: (pack?.chapters ?? []).reduce((sum, chapter) => sum + (chapter.concepts?.length ?? 0), 0),
    questions: pack?.questions?.length ?? 0,
    relations: pack?.relations?.length ?? 0,
    bytes: Buffer.byteLength(JSON.stringify(pack ?? {}), 'utf8'),
  }
}

/** 给外部模型一段可直接粘贴的提示词；任务行可以自己改。 */
export function buildPackPrompt(pack) {
  const lines = [
    '你是我的课程内容编辑。下面是一份 edugraph-course-pack v1 课程包。',
    '',
    '任务：请检查现有内容，补齐缺失的概念、解释和题目；也可以按我的额外要求修改。只输出 JSON，不要 Markdown，不要解释。',
    '',
    '规则：',
    '- 保持 format="edugraph-course-pack"、version=1；不要修改 course.id。',
    '- 新概念放进对应章节的 concepts；同名概念（忽略空格、大小写和标点）会合并。',
    '- 如果只补题目，chapters 可以保留原样，用 conceptName 引用现有概念。',
    '- 每道题的 conceptName 必须能在课程里找到；type 只用 choice / choice-reverse / judge / cloze / short。',
    '- choice / choice-reverse 的 answer 是正确选项下标，从 0 开始；judge 的 answer 用 0 表示正确、1 表示错误；cloze / short 的 answer 是参考答案文本。',
    '- 不要编造资料出处；没有依据的 sourceQuote 留空。',
    '- plan 字段只作上下文，导入时不会修改学习计划；不要输出 attempts / events / reviews。',
    '',
    '返回结构：{ format, version, course, chapters: [{ title, summary, concepts: [{ name, definition, sourceQuote }] }], questions: [{ conceptName, type, stem, options, answer, explanation }], relations: [{ from, to, type, weight }] }',
    '',
    '当前课程包：',
    JSON.stringify(pack, null, 2),
  ]
  return lines.join('\n')
}

function resolveChoiceAnswer(question, options) {
  let candidate = question.answer ?? question.correctAnswer ?? question.correctOption ?? question.answerIndex ?? question.correctIndex
  if (candidate === undefined || candidate === null || candidate === '') return null
  if (typeof candidate === 'number' && Number.isInteger(candidate)) {
    return candidate >= 0 && candidate < options.length ? String(candidate) : null
  }
  const value = String(candidate).trim()
  if (/^\d+$/.test(value)) {
    const index = Number(value)
    return index >= 0 && index < options.length ? String(index) : null
  }
  if (/^[A-Za-z]$/.test(value)) {
    const index = value.toUpperCase().charCodeAt(0) - 65
    return index >= 0 && index < options.length ? String(index) : null
  }
  const index = options.findIndex((option) => option === value)
  return index >= 0 ? String(index) : null
}

function resolveJudgeAnswer(question) {
  let candidate = question.answer ?? question.correctAnswer ?? question.correct
  if (typeof candidate === 'boolean') return candidate ? '0' : '1'
  if (typeof candidate === 'number') return candidate === 0 ? '0' : candidate === 1 ? '1' : null
  const value = String(candidate ?? '').trim().toLowerCase()
  if (['正确', '对', 'true', 'yes', '0'].includes(value)) return '0'
  if (['错误', '错', 'false', 'no', '1'].includes(value)) return '1'
  return null
}

function resolveWeight(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0.5
  return Math.max(0, Math.min(1, number))
}

/**
 * 校验并归一化外部课程包。返回统一结构；不合法时抛 DomainError，局部错误放进 warnings。
 */
export function normalizePack(input) {
  const raw = coercePack(input)
  if (!raw) throw invalid('不是合法 JSON 对象')
  if (raw.format !== PACK_FORMAT) throw invalid('format 必须是 ' + PACK_FORMAT)
  if (Number(raw.version) !== PACK_VERSION) throw invalid('version 必须是 ' + PACK_VERSION)

  const warnings = []
  let chapterInputs = Array.isArray(raw.chapters) ? raw.chapters : []
  const topConcepts = Array.isArray(raw.concepts) ? raw.concepts : []
  if (!chapterInputs.length && topConcepts.length) {
    chapterInputs = [{ title: 'AI 生成内容', summary: '', concepts: topConcepts }]
  }
  if (chapterInputs.length > LIMITS.chapters) throw invalid('章节超过 ' + LIMITS.chapters + ' 个')

  const chapters = []
  const concepts = []
  const byKey = new Map()
  for (const chapterInput of chapterInputs) {
    const title = nameOf(chapterInput?.title ?? '未分章', 120)
    if (!title) continue
    const cleanConcepts = []
    const inputs = Array.isArray(chapterInput?.concepts) ? chapterInput.concepts : []
    for (const conceptInput of inputs) {
      if (concepts.length >= LIMITS.concepts) throw invalid('概念超过 ' + LIMITS.concepts + ' 个')
      const conceptName = nameOf(conceptInput?.name, 80)
      if (!conceptName) {
        warnings.push('跳过一个没有 name 的概念')
        continue
      }
      const key = termKey(conceptName)
      if (!key) {
        warnings.push('跳过一个 name 无法识别的概念：' + conceptName)
        continue
      }
      const definition = text(conceptInput.definition, 4000)
      const sourceQuote = text(conceptInput.sourceQuote ?? conceptInput.source ?? '', 500)
      const existing = byKey.get(key)
      if (existing) {
        if (!existing.definition && definition) existing.definition = definition
        if (!existing.sourceQuote && sourceQuote) existing.sourceQuote = sourceQuote
        warnings.push('重复概念已合并：' + conceptName)
        continue
      }
      const concept = { name: conceptName, key, definition, sourceQuote, chapterTitle: title }
      byKey.set(key, concept)
      concepts.push(concept)
      cleanConcepts.push(concept)
    }
    chapters.push({
      title,
      summary: text(chapterInput?.summary, 500),
      concepts: cleanConcepts,
    })
  }

  const questions = []
  const seenQuestions = new Set()
  const questionInputs = Array.isArray(raw.questions) ? raw.questions : []
  if (questionInputs.length > LIMITS.questions) throw invalid('题目超过 ' + LIMITS.questions + ' 道')
  for (const questionInput of questionInputs) {
    const conceptName = nameOf(questionInput?.conceptName ?? questionInput?.concept, 80)
    if (!conceptName) {
      warnings.push('跳过一道没有 conceptName 的题目')
      continue
    }
    const type = String(questionInput?.type ?? 'short').trim()
    if (!QUESTION_TYPES.has(type)) {
      warnings.push('跳过一个未知题型：' + type)
      continue
    }
    const stem = text(questionInput?.stem ?? questionInput?.question, 1000)
    if (stem.length < 3) {
      warnings.push('跳过一个题干为空的题目')
      continue
    }
    let options = Array.isArray(questionInput?.options)
      ? questionInput.options.slice(0, 8).map((option) => text(option, 500)).filter(Boolean)
      : []
    let answer = ''
    if (type === 'choice' || type === 'choice-reverse') {
      if (options.length < 2) {
        warnings.push('跳过一个选项不足的选择题：' + stem.slice(0, 40))
        continue
      }
      const resolved = resolveChoiceAnswer(questionInput, options)
      if (resolved === null) {
        warnings.push('跳过一个答案不在选项里的选择题：' + stem.slice(0, 40))
        continue
      }
      answer = resolved
    } else if (type === 'judge') {
      options = ['正确', '错误']
      const resolved = resolveJudgeAnswer(questionInput)
      if (resolved === null) {
        warnings.push('跳过一个答案不是正确/错误的判断题：' + stem.slice(0, 40))
        continue
      }
      answer = resolved
    } else {
      options = []
      answer = text(questionInput?.answer, 4000)
      if (!answer) {
        warnings.push('跳过一个没有参考答案的题目：' + stem.slice(0, 40))
        continue
      }
    }
    const key = termKey(conceptName) + '|' + type + '|' + stemKey(stem)
    if (seenQuestions.has(key)) {
      warnings.push('重复题目已跳过：' + stem.slice(0, 40))
      continue
    }
    seenQuestions.add(key)
    questions.push({
      conceptKey: termKey(conceptName),
      conceptName,
      type,
      stem,
      options,
      answer,
      explanation: text(questionInput?.explanation, 2000),
    })
  }

  const relations = []
  const seenRelations = new Set()
  const relationInputs = Array.isArray(raw.relations) ? raw.relations : []
  if (relationInputs.length > LIMITS.relations) throw invalid('关系超过 ' + LIMITS.relations + ' 条')
  for (const relationInput of relationInputs) {
    const from = nameOf(relationInput?.from ?? relationInput?.source, 80)
    const to = nameOf(relationInput?.to ?? relationInput?.target, 80)
    if (!from || !to) continue
    const type = ['prerequisite', 'related', 'contains', 'applies'].includes(relationInput?.type)
      ? relationInput.type
      : 'related'
    const key = termKey(from) + '|' + termKey(to) + '|' + type
    if (seenRelations.has(key)) continue
    seenRelations.add(key)
    relations.push({ from, to, type, weight: resolveWeight(relationInput?.weight) })
  }

  if (!concepts.length && !questions.length && !relations.length) {
    throw invalid('没有可导入的概念、题目或关系')
  }
  if (raw.plan) warnings.push('plan 只作上下文，未改动学习计划')

  return {
    format: PACK_FORMAT,
    version: PACK_VERSION,
    chapters,
    concepts,
    questions,
    relations,
    warnings,
  }
}

/**
 * 把归一化后的包合并进课程 meta（draft 会被修改）。
 * 只追加/补空，不删除、不移动已有概念；重复题目跳过。
 */
export function mergePack(draft, pack, { overwriteDefinitions = false } = {}) {
  const now = new Date().toISOString()
  const concepts = draft.concepts ?? (draft.concepts = [])
  const chapters = draft.chapters ?? (draft.chapters = [])
  const questions = draft.questions ?? (draft.questions = [])
  const relations = draft.relations ?? (draft.relations = [])
  const byKey = new Map(concepts.map((concept) => [concept.key ?? termKey(concept.name), concept]))
  const chapterByKey = new Map(chapters.map((chapter) => [termKey(chapter.title), chapter]))
  const counts = {
    chaptersAdded: 0,
    conceptsAdded: 0,
    conceptsUpdated: 0,
    questionsAdded: 0,
    questionsSkipped: 0,
    relationsAdded: 0,
    relationsSkipped: 0,
  }

  for (const inputChapter of pack.chapters) {
    const chapterKey = termKey(inputChapter.title)
    let chapter = chapterByKey.get(chapterKey)
    if (!chapter) {
      const order = chapters.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1
      chapter = {
        id: newId('ch'),
        title: inputChapter.title,
        level: 1,
        order,
        pageFrom: 0,
        pageTo: 0,
        summary: inputChapter.summary || '',
        conceptIds: [],
      }
      chapters.push(chapter)
      chapterByKey.set(chapterKey, chapter)
      counts.chaptersAdded += 1
    } else if (!chapter.summary && inputChapter.summary) {
      chapter.summary = inputChapter.summary
    }
    chapter.conceptIds = chapter.conceptIds ?? []
    for (const inputConcept of inputChapter.concepts) {
      const conceptKey = inputConcept.key ?? termKey(inputConcept.name)
      let concept = byKey.get(conceptKey)
      if (!concept) {
        concept = {
          id: newId('k'),
          name: inputConcept.name,
          key: conceptKey,
          definition: inputConcept.definition || '',
          chapterId: chapter.id,
          confidence: 0.7,
          freq: 1,
          sourceRefs: [],
          tags: ['external-ai'],
          createdAt: now,
          manual: true,
        }
        concepts.push(concept)
        byKey.set(conceptKey, concept)
        chapter.conceptIds.push(concept.id)
        counts.conceptsAdded += 1
        continue
      }
      let changed = false
      if (inputConcept.definition && (overwriteDefinitions || !concept.definition)) {
        if (concept.definition !== inputConcept.definition) {
          concept.definition = inputConcept.definition
          changed = true
        }
      }
      if (changed) counts.conceptsUpdated += 1
    }
  }

  const byQuestionKey = new Set()
  for (const question of questions) {
    const concept = concepts.find((item) => item.id === question.conceptId)
    if (concept) byQuestionKey.add(concept.key + '|' + question.type + '|' + stemKey(question.stem))
  }
  for (const inputQuestion of pack.questions) {
    const concept = byKey.get(inputQuestion.conceptKey)
    if (!concept) {
      counts.questionsSkipped += 1
      continue
    }
    const key = concept.key + '|' + inputQuestion.type + '|' + stemKey(inputQuestion.stem)
    if (byQuestionKey.has(key)) {
      counts.questionsSkipped += 1
      continue
    }
    byQuestionKey.add(key)
    questions.push({
      id: newId('q'),
      conceptId: concept.id,
      conceptName: concept.name,
      chapterId: concept.chapterId ?? null,
      sourceRef: null,
      reference: concept.definition || '',
      type: inputQuestion.type,
      stem: inputQuestion.stem,
      options: inputQuestion.options,
      answer: inputQuestion.answer,
      explanation: inputQuestion.explanation,
      origin: 'external-ai',
      createdAt: now,
    })
    counts.questionsAdded += 1
  }

  const existingRelations = new Set(relations.map((relation) => {
    const source = concepts.find((concept) => concept.id === relation.sourceId)
    const target = concepts.find((concept) => concept.id === relation.targetId)
    return source && target ? termKey(source.name) + '|' + termKey(target.name) + '|' + relation.type : ''
  }).filter(Boolean))
  for (const inputRelation of pack.relations) {
    const source = byKey.get(termKey(inputRelation.from))
    const target = byKey.get(termKey(inputRelation.to))
    if (!source || !target || source.id === target.id) {
      counts.relationsSkipped += 1
      continue
    }
    const key = termKey(source.name) + '|' + termKey(target.name) + '|' + inputRelation.type
    if (existingRelations.has(key)) {
      counts.relationsSkipped += 1
      continue
    }
    existingRelations.add(key)
    relations.push({
      id: newId('r'),
      sourceId: source.id,
      targetId: target.id,
      type: inputRelation.type,
      weight: inputRelation.weight,
    })
    counts.relationsAdded += 1
  }

  draft.analysis = {
    ...(draft.analysis ?? {}),
    externalImportAt: now,
    externalImportVersion: pack.version,
  }
  return {
    counts,
    warnings: pack.warnings ?? [],
    totals: {
      chapters: chapters.length,
      concepts: concepts.length,
      questions: questions.length,
      relations: relations.length,
    },
  }
}

/** 不写盘的预览：合并到克隆体，返回计数。 */
export function previewPack(meta, pack, options = {}) {
  const draft = JSON.parse(JSON.stringify(meta))
  return mergePack(draft, pack, options)
}
