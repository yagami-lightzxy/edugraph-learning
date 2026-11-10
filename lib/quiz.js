/**
 * EduGraph AI · 题目生成。
 *
 * 题目全部由课程资料推导：定义句变选择题、填空题与判断题，来源句作为解释。
 * 同一概念同一题型只生成一次，重复请求直接复用，保证错题与掌握度的记录稳定。
 */
import { clip, newId, oneLine, splitSentences, stableHash } from './util.js'

/** 由字符串派生的确定性随机数（同一题目每次选项顺序一致）。 */
export function seededRandom(seedText) {
  let seed = parseInt(stableHash(seedText).slice(0, 8), 16) || 1
  return function next() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(list, random) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** 概念可用的「定义文本」：优先 definition，其次来源引文里的定义句。 */
export function conceptReference(concept) {
  if (concept.definition && concept.definition.length >= 10) return concept.definition
  const quote = concept.sourceRefs?.[0]?.quote ?? ''
  if (quote.length >= 10) return quote
  return ''
}

/** 从哪里找到包含该概念的句子（用于填空）。 */
function findSourceSentence(concept, blocks) {
  const quote = concept.sourceRefs?.[0]?.quote ?? ''
  if (quote) {
    const sentence = splitSentences(quote).find((s) => s.includes(concept.name))
    if (sentence) return sentence
    return quote
  }
  for (const block of blocks ?? []) {
    if (!block.text.includes(concept.name)) continue
    const sentence = splitSentences(block.text).find((s) => s.includes(concept.name))
    if (sentence) return sentence
  }
  return ''
}

/** 生成干扰项：同章优先，其次全课程，长度接近的优先。 */
function pickDistractors(concept, pool, count, random) {
  const own = conceptReference(concept)
  const candidates = pool
    .filter((c) => c.id !== concept.id && c.name !== concept.name)
    .map((c) => ({ concept: c, text: conceptReference(c) }))
    .filter((item) => item.text && item.text.length >= 10 && item.text !== own)
  if (!candidates.length) return []
  const sameChapter = candidates.filter((item) => item.concept.chapterId === concept.chapterId)
  const ordered = [...sameChapter, ...candidates.filter((item) => item.concept.chapterId !== concept.chapterId)]
  // 优先长度相近，再确定性打乱
  ordered.sort((a, b) => Math.abs(a.text.length - own.length) - Math.abs(b.text.length - own.length))
  const near = ordered.slice(0, Math.max(count * 3, count))
  return shuffle(near, random).slice(0, count)
}

/**
 * 为一批概念生成题目。
 * @param {object} params
 * @param {object} params.meta 课程元数据（读写 questions / concepts）
 * @param {string[]} [params.conceptIds] 指定概念；缺省按掌握度从低到高
 * @param {Array} [params.blocks] 扁平化资料块（填空兜底用）
 * @param {number} [params.count] 题目数量
 * @param {string[]} [params.types] 限定题型
 */
export function generateQuestions({ meta, conceptIds = null, blocks = [], count = 8, types = null } = {}) {
  const concepts = meta.concepts ?? []
  const byId = new Map(concepts.map((c) => [c.id, c]))
  let pool = conceptIds?.length ? conceptIds.map((id) => byId.get(id)).filter(Boolean) : concepts
  if (!pool.length) return []

  const existing = meta.questions ?? []
  const existingKey = new Map(existing.map((q) => [`${q.conceptId}:${q.type}`, q]))
  const allowed = (type) => !types || !types.length || types.includes(type)
  const created = []

  const nextTypes = (concept) => {
    const hasDefinition = conceptReference(concept).length >= 12
    const list = []
    if (hasDefinition) list.push('choice', 'cloze', 'judge', 'choice-reverse', 'short')
    else list.push('cloze')
    return list.filter((t) => allowed(t) && !existingKey.has(`${concept.id}:${t}`))
  }

  // 按概念轮转分配题型，保证一批题里题型多样
  const queue = pool.filter((concept) => nextTypes(concept).length > 0)
  let guard = 0
  while (created.length < count && queue.length && guard < count * 12) {
    guard += 1
    const concept = queue.shift()
    const types4 = nextTypes(concept)
    if (!types4.length) continue
    const type = types4[0]
    const question = buildQuestion({ concept, type, pool: concepts, blocks, random: seededRandom(`${concept.id}:${type}`) })
    if (!question) { queue.push(concept); continue }
    question.id = newId('q')
    question.createdAt = new Date().toISOString()
    existing.push(question)
    existingKey.set(`${concept.id}:${type}`, question)
    created.push(question)
    // 同概念还有别的题型时放回队尾，让题目更分散
    if (nextTypes(concept).length) queue.push(concept)
  }
  meta.questions = existing
  return created
}

/** 构造单道题。 */
export function buildQuestion({ concept, type, pool, blocks, random }) {
  const reference = conceptReference(concept)
  const sourceRef = concept.sourceRefs?.[0] ?? null
  const base = {
    conceptId: concept.id,
    conceptName: concept.name,
    chapterId: concept.chapterId ?? null,
    sourceRef,
    reference,
    type,
  }

  if (type === 'choice') {
    if (!reference) return null
    const distractors = pickDistractors(concept, pool, 3, random)
    if (distractors.length < 2) return null
    const options = shuffle([{ text: reference, correct: true }, ...distractors.map((d) => ({ text: d.text, correct: false }))], random)
    return {
      ...base,
      stem: `下列哪一项最符合「${concept.name}」的含义？`,
      options: options.map((o) => clip(o.text, 150)),
      answer: String(options.findIndex((o) => o.correct)),
      explanation: `「${concept.name}」：${clip(reference, 220)}`,
    }
  }

  if (type === 'choice-reverse') {
    if (!reference) return null
    const distractors = pickDistractors(concept, pool, 3, random)
    if (distractors.length < 2) return null
    const entries = shuffle([{ name: concept.name, correct: true }, ...distractors.map((d) => ({ name: d.concept.name, correct: false }))], random)
    return {
      ...base,
      stem: `「${clip(reference, 120)}」描述的是以下哪个概念？`,
      options: entries.map((e) => e.name),
      answer: String(entries.findIndex((e) => e.correct)),
      explanation: `正确答案：${concept.name}。${clip(reference, 200)}`,
    }
  }

  if (type === 'cloze') {
    const sentence = findSourceSentence(concept, blocks) || reference
    if (!sentence) return null
    const term = concept.name
    const stem = sentence.includes(term)
      ? sentence.replace(term, '____')
      : `${clip(sentence, 120)}（请补充这里讨论的核心概念：____）`
    if (stem === sentence) return null
    return {
      ...base,
      stem: `填空：${clip(stem, 200)}`,
      options: [],
      answer: term,
      explanation: `出处：${clip(sentence, 200)}`,
    }
  }

  if (type === 'judge') {
    const distractors = pickDistractors(concept, pool, 1, random)
    const useFalse = distractors.length > 0 && random() < 0.5
    const statement = useFalse ? distractors[0].text : reference
    if (!statement) return null
    const shownConcept = useFalse ? concept.name : concept.name
    return {
      ...base,
      stem: `判断：下面这段话描述的是「${shownConcept}」——
${clip(statement, 160)}`,
      options: ['正确', '错误'],
      answer: String(useFalse ? 1 : 0),
      explanation: useFalse
        ? `这段话实际描述的是「${distractors[0].concept.name}」。${clip(reference, 180)}`
        : clip(reference, 200),
    }
  }

  // short
  return {
    ...base,
    stem: `请用自己的话解释「${concept.name}」，并说明它的关键条件或用途。`,
    options: [],
    answer: reference || concept.name,
    explanation: reference ? `参考要点：${clip(reference, 240)}` : '请回看资料原文后重新作答。',
  }
}

/** 掌握度低的概念优先（复习/练习的选题策略）。 */
export function prioritizeConcepts({ concepts, reviews, attempts, limit = 10 }) {
  const reviewByConcept = new Map((reviews ?? []).map((r) => [r.conceptId, r]))
  const scoreByConcept = new Map()
  for (const attempt of attempts ?? []) {
    const list = scoreByConcept.get(attempt.conceptId) ?? []
    list.push(attempt.score ?? 0)
    scoreByConcept.set(attempt.conceptId, list)
  }
  const now = Date.now()
  const scored = concepts.map((concept) => {
    const scores = scoreByConcept.get(concept.id) ?? []
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
    const review = reviewByConcept.get(concept.id)
    const overdue = review ? Math.max(0, (now - (review.due ?? now)) / 86400000) : 0
    // 未学过 > 学得差 > 到期 > 其他
    let priority = 0
    if (avg === null) priority += 30
    else priority += (1 - avg) * 60
    priority += Math.min(30, overdue * 3)
    if (review && review.due && review.due <= now) priority += 15
    priority += concept.confidence ?? 0
    return { concept, priority }
  })
  return scored.sort((a, b) => b.priority - a.priority).slice(0, limit).map((item) => item.concept)
}
