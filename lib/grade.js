/**
 * EduGraph AI · 判分与掌握度。
 *
 * 判分不依赖模型：客观题严格比对；填空按归一化文本比对；简答题按「关键点覆盖率」
 * 给分，并给出缺失的关键点，作为错题标签与界面解释。判定结果同时决定 FSRS 评分。
 */
import { oneLine } from './util.js'

const PUNCT = /[\s\u3000.,，。;；:：!！?？'"“”‘’()（）\[\]{}<>《》、·\-—_/\\|+*=~]/g

/** 归一化答案文本：去掉标点、空白、大小写差异。 */
export function normalizeAnswer(text) {
  return String(text ?? '').toLowerCase().replace(PUNCT, '')
}

/** 从参考答案里提取关键点（中文 2-6 字术语 + 英文词），去重后取前 N 个。 */
export function keyPoints(reference, limit = 6) {
  const text = String(reference ?? '')
  const points = []
  const seen = new Set()
  // 先按标点切分短句，短句本身也算关键点（更接近"要点"）
  const clauses = text.split(/[。；;，,、]/).map((s) => oneLine(s)).filter((s) => s.length >= 4 && s.length <= 30)
  for (const clause of clauses) if (!seen.has(clause)) { seen.add(clause); points.push(clause); if (points.length >= limit) break }
  if (points.length >= 3) return points.slice(0, limit)
  // 不足时补术语
  const terms = text.match(/[\u4e00-\u9fff]{2,8}/g) ?? []
  for (const term of terms) {
    if (points.includes(term)) continue
    if (/^(的是|是指|就是|这个|那个|我们|可以|因此|所以|如果|因为|以及|并且)/.test(term)) continue
    points.push(term)
    if (points.length >= limit) break
  }
  return points.slice(0, limit)
}

/** 覆盖率：关键点在用户答案中出现了多少（按归一化包含判断）。 */
export function coverage(answer, points) {
  const normalized = normalizeAnswer(answer)
  if (!normalized) return { matched: [], missing: points, ratio: 0 }
  const matched = []
  const missing = []
  for (const point of points) {
    const key = normalizeAnswer(point)
    if (!key) continue
    if (normalized.includes(key)) matched.push(point)
    else missing.push(point)
  }
  return { matched, missing, ratio: points.length ? matched.length / points.length : 0 }
}

/** 字符级相似度（Dice 系数），用于填空的近似匹配。 */
export function similarity(a, b) {
  const x = normalizeAnswer(a)
  const y = normalizeAnswer(b)
  if (!x || !y) return 0
  if (x === y) return 1
  const bigrams = (s) => {
    const out = new Map()
    for (let i = 0; i < s.length - 1; i += 1) {
      const gram = s.slice(i, i + 2)
      out.set(gram, (out.get(gram) ?? 0) + 1)
    }
    return out
  }
  const left = bigrams(x)
  const right = bigrams(y)
  let overlap = 0
  let total = 0
  for (const [gram, count] of left) { overlap += Math.min(count, right.get(gram) ?? 0) }
  for (const [, count] of left) total += count
  for (const [, count] of right) total += count
  return total === 0 ? 0 : (2 * overlap) / total
}

/**
 * 判分。
 * @param {object} question 题目（含 type / answer / explanation / conceptName / reference）
 * @param {string|number} rawAnswer 用户答案（选择题传选项下标或文本）
 * @returns {{ score: number, correct: boolean, errorTags: string[], explanation: string, expected: string }}
 */
export function gradeAnswer(question, rawAnswer) {
  const type = question?.type ?? 'short'
  const answer = typeof rawAnswer === 'number' ? rawAnswer : String(rawAnswer ?? '').trim()
  const expected = String(question?.answer ?? '')
  const explanation = question?.explanation ?? ''
  const errorTags = []
  let score = 0
  let correct = false

  if (type === 'choice' || type === 'judge') {
    const normalized = typeof answer === 'number' ? String(answer) : normalizeAnswer(answer)
    correct = normalized === normalizeAnswer(expected) || String(answer) === expected
    score = correct ? 1 : 0
    if (!correct) errorTags.push('wrong-option')
  } else if (type === 'cloze') {
    const sim = similarity(String(answer), expected)
    const contained = normalizeAnswer(answer).includes(normalizeAnswer(expected)) || normalizeAnswer(expected).includes(normalizeAnswer(answer))
    score = contained ? 1 : Math.min(0.95, sim)
    correct = score >= 0.8
    if (!correct) errorTags.push(sim > 0.45 ? 'close-but-wrong' : 'missing-term')
  } else {
    // 简答：关键点覆盖 + 术语命中
    const reference = question?.reference || expected || question?.conceptName || ''
    const points = keyPoints(reference)
    const result = coverage(answer, points)
    const conceptHit = question?.conceptName ? normalizeAnswer(answer).includes(normalizeAnswer(question.conceptName)) : false
    score = Math.min(1, result.ratio * 0.72 + (conceptHit ? 0.18 : 0) + (String(answer).length >= 20 ? 0.1 : 0))
    correct = score >= 0.62
    for (const miss of result.missing.slice(0, 4)) errorTags.push(`missing:${miss}`)
    if (String(answer).length < 8) errorTags.push('too-short')
  }

  return {
    score: Math.round(Math.min(1, Math.max(0, score)) * 100) / 100,
    correct,
    errorTags,
    explanation: explanation || (expected ? `参考要点：${expected}` : ''),
    expected,
  }
}

/** 分数 -> FSRS 评分（1 忘记 / 2 困难 / 3 良好 / 4 简单）。 */
export function scoreToRating(score) {
  if (score >= 0.85) return 4
  if (score >= 0.62) return 3
  if (score >= 0.35) return 2
  return 1
}

/** 掌握度：最近答题成绩的指数加权 + 复习稳定性。 */
export function computeMastery(attempts, review) {
  const sorted = [...attempts].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
  let ewma = 0
  let weightSum = 0
  sorted.forEach((attempt, index) => {
    const weight = Math.pow(0.75, sorted.length - 1 - index)
    ewma += (attempt.score ?? 0) * weight
    weightSum += weight
  })
  const attemptScore = weightSum ? ewma / weightSum : 0
  const stability = review?.stability ?? 0
  const reviewScore = stability > 0 ? Math.min(1, Math.log2(1 + stability) / Math.log2(1 + 60)) : 0
  const mastery = Math.min(1, attemptScore * 0.75 + reviewScore * 0.25)
  return {
    mastery: Math.round(mastery * 100) / 100,
    attempts: attempts.length,
    avgScore: sorted.length ? Math.round((sorted.reduce((n, a) => n + (a.score ?? 0), 0) / sorted.length) * 100) / 100 : 0,
    lastScore: sorted.length ? sorted[sorted.length - 1].score : null,
    stability,
    level: mastery >= 0.85 ? 'mastered' : mastery >= 0.6 ? 'familiar' : mastery >= 0.3 ? 'learning' : 'weak',
  }
}
