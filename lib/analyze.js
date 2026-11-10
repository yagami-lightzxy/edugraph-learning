/**
 * EduGraph AI · 课程结构分析。
 *
 * 输入是解析好的文档块（pdf/docx/pptx/md 统一形态），输出章节树、概念与概念关系。
 * 全部是确定性规则，不调用模型：标题层级来自字号 / 样式 / 编号模式，概念来自
 * 标题、定义句式与术语频次，关系来自章节顺序、共现与定义依赖。每个概念都保留
 * 来源引用（文档 / 页码 / 块 / 原文摘录），接口与界面都据此回溯原文。
 */
import { clip, hasCJK, newId, normalizeText, oneLine, splitSentences, stableHash } from './util.js'

/** 不属于知识点的通用标题。 */
const GENERIC_TITLES = new Set([
  '前言', '序言', '目录', '目录页', '封面', '封底', '参考文献', '附录', '后记', '致谢',
  'contents', 'preface', 'appendix', 'reference', 'references', 'index', 'summary',
])

/** 通用词：在资料里出现很多次，但不是知识点。 */
const GENERIC_TERMS = new Set([
  '情况', '判断', '分析', '问题', '方法', '如图', '所示', '例题', '题目', '答案', '步骤', '注意',
  '结论', '说明', '下面', '以上', '所以', '因此', '但是', '可以', '需要', '我们', '他们', '这个',
  '那个', '一个', '什么', '怎么', '以及', '同时', '其中', '例如', '这里', '上述', '如下', '然后',
  '因为', '如果', '就是', '不是', '没有', '还有', '这些', '那些', '自己', '时候', '地方', '方面',
  '电路图', '示意图', '解：', '答：', '例1', '例2', '例3', '练习', '本节', '本章', '如下所示',
  '之间', '已知', '此时', '可得', '由于', '分别', '对应', '包含', '计算', '表示', '说明', '根据',
  '利用', '进行', '得到', '可知', '可见', '而且', '并且', '假设', '结论是', '问题是',
])

/** 明显不是知识点的命名（句段、图示说明、连接词）。 */
const JUNK_TERM = /(如图所示|图所示|所示|如下|可知|可见|可得|注意|例如|比如|试判断|试求)/

/** 中文虚词/代词开头，遇到时不算术语。 */
const BAD_TERM_PREFIX = /^(的|了|是|和|与|或|在|对|把|被|为|以|及|这|那|它|其|该|本|我|你|他|她|一个|一种|一些|如果|因为|所以|但是|而且|然后|并且|通过|根据|对于|关于|由于|可以|需要|必须|应该|已经|正在|进行|能够)/
/** 术语常见后缀（用于频次候选加权）。 */
const TERM_SUFFIX = /(定理|定律|公式|方程|函数|矩阵|向量|电路|电压|电流|电阻|电容|电感|功率|信号|系统|模型|算法|结构|机制|过程|性质|条件|方法|原理|效应|现象|规则|定义|概念|要素|特征|类型|分类|步骤|指标|参数|系数|比例|极限|导数|积分|概率|分布|样本|假设|证明|实验|反应|元素|化合物|细胞|组织|基因|蛋白|市场|成本|收益|风险|需求|供给|弹性)/
/** 定义句式（term 在句首）。 */
const DEF_CUES = ['是指', '指的是', '称为', '叫做', '定义为', '定义为：', '表示', '即', '意味着', '又称', '也称为', '简称']

/** 归一化术语键。 */
export function termKey(text) {
  return String(text ?? '').toLowerCase().replace(/[\s\u3000·•\-—_/\\()[\]{}<>《》"'`~!@#$%^&*+=|:;,.?，。；：、！？…—]/g, '')
}

/** 判断一组文本是否像"概念名"（不是句子、不是编号、不是泛称）。 */
export function looksLikeTerm(text, { maxLen = 26 } = {}) {
  const value = oneLine(text)
  if (!value) return false
  if (value.length > maxLen || value.length < 2) return false
  if (/^[\d\s.、,，;；:：()（）\-—]+$/.test(value)) return false
  if (/[。！？!?]$/.test(value)) return false
  if (GENERIC_TITLES.has(value.toLowerCase())) return false
  if (GENERIC_TERMS.has(value)) return false
  if (JUNK_TERM.test(value)) return false
  if (BAD_TERM_PREFIX.test(value)) return false
  // 超过 3 个逗号视为句子
  if ((value.match(/[，,]/g) ?? []).length >= 3) return false
  return true
}

/** 从标题文本推断标题层级（编号模式）。 */
export function headingLevelFromText(text) {
  const value = oneLine(text)
  if (/^第[一二三四五六七八九十百零〇\d]+[章篇部]/.test(value)) return 1
  if (/^第[一二三四五六七八九十百零〇\d]+[节讲]/.test(value)) return 2
  if (/^[一二三四五六七八九十]+[、.．]/.test(value)) return 2
  if (/^\d+\.\d+\.\d+/.test(value)) return 4
  if (/^\d+\.\d+/.test(value)) return 3
  if (/^\d+[、.．]/.test(value)) return 2
  if (/^(chapter|part|unit|section)\s+\d+/i.test(value)) return 1
  if (/^【.+】$/.test(value)) return 2
  return 0
}

/** 公式 / 数学符号行：这类行即使字号偏大也不是章节标题。 */
export function looksLikeFormula(text) {
  const value = oneLine(text)
  if (!value) return false
  // 等号、不等号、求和积分、数学斜体字母（U+1D400–U+1D7FF）
  if (/[=＝<>≤≥∑√∫∞≈≠±×÷→←↑↓]/.test(value)) return true
  if (/[\u{1D400}-\u{1D7FF}]/u.test(value)) return true
  const cjk = (value.match(/[\u4e00-\u9fff]/g) ?? []).length
  // 中文占比过低（<30%）的短行视为公式或噪声
  if (value.length > 0 && cjk / value.length < 0.3 && /[0-9A-Za-z]/.test(value)) return true
  return false
}

/** 是否为"看起来像标题"的独立短行（用于 PDF 无字号信号的兜底）。 */
export function looksLikeHeading(text, style = {}) {
  const value = oneLine(text)
  if (!value || value.length > 32) return false
  if (looksLikeFormula(value)) return false
  const byNumber = headingLevelFromText(value)
  if (byNumber > 0) return true
  if (style.bold && value.length <= 24 && !/[。；，]$/.test(value)) return true
  if (GENERIC_TITLES.has(value.toLowerCase())) return true
  return false
}

/** 取一行里最像正文的字号（按字符数加权）。 */
function bodyFontSize(blocks) {
  const weight = new Map()
  for (const block of blocks) {
    const size = block.style?.fontSize
    if (!size) continue
    const key = Math.round(size * 2) / 2
    weight.set(key, (weight.get(key) ?? 0) + Math.min(400, block.text.length))
  }
  let best = 0
  let bestWeight = -1
  for (const [size, w] of weight) {
    if (w > bestWeight) { best = size; bestWeight = w }
  }
  return best || 0
}

/** 把解析块整理成带全局序号的扁平列表。 */
export function flattenDocuments(documents) {
  const blocks = []
  for (const doc of documents) {
    const pages = doc.pages ?? []
    for (const page of pages) {
      for (const block of page.blocks ?? []) {
        if (!block?.text) continue
        blocks.push({
          blockId: block.id ?? `${doc.documentId}-${page.pageNo}-${blocks.length}`,
          documentId: doc.documentId,
          filename: doc.filename,
          pageNo: block.pageNo ?? page.pageNo ?? 1,
          kind: block.kind ?? 'paragraph',
          text: normalizeText(block.text),
          level: block.level,
          style: block.style ?? {},
          globalIndex: blocks.length,
        })
      }
    }
  }
  return blocks
}

/** 识别标题块（合并解析器给的 kind:'heading' 与字号/编号信号）。 */
export function detectHeadings(blocks) {
  const body = bodyFontSize(blocks)
  const headings = []
  for (const block of blocks) {
    // 数学公式与符号行不作为标题，避免把推导过程切成一章。
    if (looksLikeFormula(block.text)) continue
    const size = block.style?.fontSize ?? 0
    let level = 0
    if (block.kind === 'heading') level = block.level || headingLevelFromText(block.text) || 1
    if (!level && body && size >= body * 1.22) {
      const ratio = size / body
      level = ratio >= 1.8 ? 1 : ratio >= 1.45 ? 2 : 3
    }
    if (!level) {
      const byNumber = headingLevelFromText(block.text)
      if (byNumber && block.text.length <= 32) level = byNumber
    }
    if (!level && looksLikeHeading(block.text, block.style)) level = 2
    if (level) headings.push({ ...block, level: Math.min(6, Math.max(1, level)) })
  }
  return { headings, bodyFontSize: body }
}

/** 章节：标题块开启一节，直到下一个同级或更高级标题。 */
export function buildChapters(blocks, headings) {
  if (!headings.length) {
    // 无标题：按字符量切成若干"部分"，保证界面仍有结构。
    const chapters = []
    let current = null
    for (const block of blocks) {
      if (!current || current.charCount >= 7000) {
        current = {
          id: newId('ch'),
          title: `第 ${chapters.length + 1} 部分`,
          level: 1,
          order: chapters.length,
          documentId: block.documentId,
          pageFrom: block.pageNo,
          pageTo: block.pageNo,
          charCount: 0,
          blockIds: [],
          text: '',
        }
        chapters.push(current)
      }
      current.blockIds.push(block.blockId)
      current.text = `${current.text}\n${block.text}`
      current.charCount += block.text.length
      current.pageTo = block.pageNo
    }
    return chapters.map((c) => ({ ...c, text: clip(c.text, 400) }))
  }

  const headingIndex = new Map(headings.map((h) => [h.blockId, h]))
  const chapters = []
  let current = null
  for (const block of blocks) {
    const heading = headingIndex.get(block.blockId)
    if (heading) {
      current = {
        id: newId('ch'),
        title: oneLine(heading.text),
        level: heading.level,
        order: chapters.length,
        documentId: heading.documentId,
        pageFrom: heading.pageNo,
        pageTo: heading.pageNo,
        charCount: 0,
        blockIds: [],
        text: '',
      }
      chapters.push(current)
      continue
    }
    if (!current) {
      current = {
        id: newId('ch'),
        title: '导言',
        level: 1,
        order: chapters.length,
        documentId: block.documentId,
        pageFrom: block.pageNo,
        pageTo: block.pageNo,
        charCount: 0,
        blockIds: [],
        text: '',
      }
      chapters.push(current)
    }
    current.blockIds.push(block.blockId)
    current.text = `${current.text}\n${block.text}`
    current.charCount += block.text.length
    current.pageTo = block.pageNo
  }
  // 丢掉完全空白的章节（只有标题没有内容且下一节跟随）
  const filtered = chapters.filter((c) => c.charCount > 0 || headings.length <= 3)
  // 过短的相邻节合并到上一节，避免界面上出现只占一两行的章节。
  const merged = []
  for (const chapter of filtered) {
    const previous = merged[merged.length - 1]
    if (previous && previous.charCount > 0 && previous.charCount < 220 && chapter.level > previous.level) {
      previous.blockIds.push(...chapter.blockIds)
      previous.text = `${previous.text}\n${chapter.text}`
      previous.charCount += chapter.charCount
      previous.pageTo = chapter.pageTo
      previous.children = [...(previous.children ?? []), { id: chapter.id, title: chapter.title, level: chapter.level }]
      continue
    }
    merged.push({ ...chapter })
  }
  return merged.map((chapter, index) => ({
    ...chapter,
    order: index,
    text: clip(chapter.text, 600),
    summary: clip(chapter.text, 160),
  }))
}

/** 定义句式抽取：返回 { term, definition, sentence }。 */
export function extractDefinitions(sentences) {
  const found = []
  for (const sentence of sentences) {
    const value = oneLine(sentence)
    if (value.length < 6 || value.length > 300) continue
    for (const cue of DEF_CUES) {
      const at = value.indexOf(cue)
      if (at < 1 || at > 18) continue
      const term = value.slice(0, at).replace(/^(所谓|其中|因此|所以|那么|则|而|且|并|即)\s*/, '').trim()
      if (!looksLikeTerm(term, { maxLen: 20 })) continue
      if (!hasCJK(term) && term.length < 4) continue
      const definition = value.slice(at + cue.length).replace(/^[：:，,\s]+/, '').trim()
      if (definition.length < 6) continue
      found.push({ term, definition, sentence: value })
      break
    }
  }
  return found
}

/** 从任意文本里抽候选术语（中文 2-8 字 + 英文缩写/词组）。 */
export function extractTerms(text, { minFreq = 3 } = {}) {
  const counts = new Map()
  const value = String(text ?? '')
  // 中文候选：连续中文串切片，按 2-8 字窗口统计，长串优先。
  const cjkRuns = value.match(/[\u4e00-\u9fff]{2,}/g) ?? []
  for (const run of cjkRuns) {
    const maxLen = Math.min(8, run.length)
    for (let len = maxLen; len >= 2; len -= 1) {
      for (let i = 0; i + len <= run.length; i += 1) {
        const term = run.slice(i, i + len)
        if (BAD_TERM_PREFIX.test(term)) continue
        if (/(的|了|是|和|与|或|及|等|中|上|下|后|前|时|地|得|着|过|把|被|为|对)$/.test(term)) continue
        const key = termKey(term)
        if (key.length < 2) continue
        counts.set(term, (counts.get(term) ?? 0) + 1)
      }
    }
  }
  // 英文候选
  const latinRuns = value.match(/[A-Za-z][A-Za-z0-9\-]{1,24}/g) ?? []
  for (const word of latinRuns) {
    if (word.length < 3) continue
    if (/^(the|and|for|with|that|this|from|into|when|then|than|such|also)$/i.test(word)) continue
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }
  const ranked = []
  for (const [term, freq] of counts) {
    if (freq < minFreq) continue
    let score = Math.log2(1 + freq) * (1 + term.length / 12)
    if (TERM_SUFFIX.test(term)) score *= 1.45
    if (hasCJK(term)) score *= 1.15
    ranked.push({ term, freq, score })
  }
  ranked.sort((a, b) => b.score - a.score || b.freq - a.freq)
  // 极大性过滤：中文里「极管」这类碎片是「二极管」的子串，出现次数也不比它多，
  // 应让位给完整术语。只在前 600 个候选内比较，避免 O(n²) 拖慢分析。
  const top = ranked.slice(0, 600)
  const kept = top.filter(({ term, freq }) => {
    if (!hasCJK(term)) return true
    if (/[的了吧呢吗啊]/.test(term)) return false
    for (const other of top) {
      if (other.term === term || other.term.length <= term.length) continue
      if (!other.term.includes(term)) continue
      if (other.freq >= Math.max(2, freq * 0.5)) return false
    }
    return true
  })
  return kept
}

/** 提取英文技术词（首字母大写 / 全大写缩写）。 */
function extractAcronyms(text) {
  const set = new Map()
  for (const match of String(text ?? '').matchAll(/\b([A-Z][A-Za-z]{2,}|[A-Z]{2,6})\b/g)) {
    const word = match[1]
    if (word.length < 2) continue
    set.set(word, (set.get(word) ?? 0) + 1)
  }
  return [...set.entries()].filter(([, n]) => n >= 2).map(([term, freq]) => ({ term, freq }))
}

/** 在句子中找包含该术语的第一句。 */
export function findSentence(sentences, term) {
  const key = term.toLowerCase()
  return sentences.find((s) => s.toLowerCase().includes(key)) ?? ''
}

/**
 * 挑最像「定义」的那一句：优先「X是指/称为…」句式与句首出现，
 * 排除例题、求解、图示类的句子；长度过短或过长降权。
 */
export function bestDefinition(term, sentences) {
  let best = ''
  let bestScore = -Infinity
  const bare = oneLine(term).toLowerCase()
  for (const sentence of sentences) {
    if (!sentence.includes(term)) continue
    // 只有概念名本身的句子不是定义
    if (oneLine(sentence).toLowerCase() === bare) continue
    if (sentence.length < 10) continue
    let score = 0
    const cue = DEF_CUES.find((item) => sentence.includes(item))
    if (cue && sentence.indexOf(cue) <= term.length + 6) score += 3
    const at = sentence.indexOf(term)
    if (at === 0) score += 2
    else if (at <= 3) score += 1
    if (/例\s*\d|如图|求|解：|习题|题\d|试判断|下列/.test(sentence)) score -= 2.5
    // 公式句不适合当定义（模电/物理类资料的正文里公式极多）
    if (/[=＝∑√∫∞≈]|[\u{1D400}-\u{1D7FF}]/u.test(sentence)) score -= 2.5
    const cjk = (sentence.match(/[\u4e00-\u9fff]/g) ?? []).length
    if (cjk / Math.max(1, sentence.length) < 0.35) score -= 1.5
    if (sentence.length > 220) score -= 1
    if (sentence.length < 12) score -= 1.5
    if (sentence.split(term).length - 1 >= 2) score += 0.5
    if (statusCue(sentence)) score += 0.3
    if (score > bestScore) { bestScore = score; best = sentence }
  }
  return best
}

function statusCue(sentence) {
  return /(用于|属于|分为|包括|组成|由.+构成|主要|一般|通常|作用)/.test(sentence)
}

/** 主分析入口。 */
export function analyzeCourse({ courseId, documents, maxConcepts = 220 } = {}) {
  const blocks = flattenDocuments(documents)
  const { headings, bodyFontSize: body } = detectHeadings(blocks)
  const chapters = buildChapters(blocks, headings)
  const blockById = new Map(blocks.map((b) => [b.blockId, b]))
  const chapterByBlock = new Map()
  for (const chapter of chapters) {
    for (const blockId of chapter.blockIds) chapterByBlock.set(blockId, chapter.id)
    if (!blockById.has(chapter.blockIds[0]) && chapter.blockIds.length === 0) {
      // 章节标题块自身也映射到该章节
      const heading = headings.find((h) => h.text === chapter.title)
      if (heading) chapterByBlock.set(heading.blockId, chapter.id)
    }
  }

  const concepts = new Map() // key -> concept
  const upsert = (term, info) => {
    const name = oneLine(term).replace(/^[\s、,，。.]+|[\s、,，。.]+$/g, '')
    const key = termKey(name)
    if (!key || key.length < 2) return null
    if (name.length > 26) return null
    if (GENERIC_TITLES.has(name.toLowerCase())) return null
    const existing = concepts.get(key)
    if (existing) {
      existing.confidence = Math.min(1, Math.max(existing.confidence, info.confidence))
      if (info.definition && info.definition.length > (existing.definition?.length ?? 0)) existing.definition = info.definition
      if (info.sourceRef && !existing.sourceRefs.some((r) => r.blockId === info.sourceRef.blockId)) existing.sourceRefs.push(info.sourceRef)
      if (info.chapterId && !existing.chapterId) existing.chapterId = info.chapterId
      existing.freq += info.freq ?? 0
      return existing
    }
    const concept = {
      id: newId('k'),
      name,
      key,
      definition: info.definition ?? '',
      chapterId: info.chapterId ?? null,
      confidence: info.confidence ?? 0.5,
      freq: info.freq ?? 0,
      sourceRefs: info.sourceRef ? [info.sourceRef] : [],
      tags: info.tags ?? [],
      createdAt: new Date().toISOString(),
    }
    concepts.set(key, concept)
    return concept
  }

  // 1) 标题即概念（最强的信号）
  for (const chapter of chapters) {
    if (!looksLikeTerm(chapter.title, { maxLen: 28 })) continue
    const headingBlock = headings.find((h) => oneLine(h.text) === chapter.title)
    upsert(chapter.title, {
      confidence: 0.82,
      chapterId: chapter.id,
      freq: 3,
      definition: '',
      sourceRef: headingBlock
        ? { documentId: headingBlock.documentId, pageNo: headingBlock.pageNo, blockId: headingBlock.blockId, quote: clip(headingBlock.text, 120) }
        : undefined,
      tags: ['heading'],
    })
  }

  // 2) 定义句式
  const allSentences = []
  for (const block of blocks) {
    for (const sentence of splitSentences(block.text)) {
      allSentences.push({ sentence, block })
    }
  }
  for (const def of extractDefinitions(allSentences.map((s) => s.sentence))) {
    const owner = allSentences.find((s) => s.sentence === def.sentence)?.block
    upsert(def.term, {
      confidence: 0.74,
      definition: def.definition,
      chapterId: owner ? chapterByBlock.get(owner.blockId) ?? null : null,
      freq: 2,
      sourceRef: owner
        ? { documentId: owner.documentId, pageNo: owner.pageNo, blockId: owner.blockId, quote: clip(def.sentence, 160) }
        : undefined,
      tags: ['definition'],
    })
  }

  // 3) 术语频次
  const fullText = blocks.map((b) => b.text).join('\n')
  const sentences = allSentences.map((s) => s.sentence)
  const termStats = extractTerms(fullText, { minFreq: 3 }).slice(0, 600)
  for (const { term, freq, score } of termStats) {
    if (concepts.size >= maxConcepts && !concepts.has(termKey(term))) continue
    const key = termKey(term)
    if (concepts.has(key)) { concepts.get(key).freq += freq; continue }
    if (GENERIC_TERMS.has(term)) continue
    // 纯频次概念的门槛：两字词很容易是通用词，要求出现得足够多；
    // 三字以上术语正常门槛即可。
    const cjkChars = (term.match(/[\u4e00-\u9fff]/g) ?? []).length
    if (cjkChars === 2 && freq < 8) continue
    if (cjkChars >= 3 && freq < 4) continue
    const sentence = bestDefinition(term, sentences) || findSentence(sentences, term)
    const owner = sentence ? allSentences.find((s) => s.sentence === sentence)?.block : null
    upsert(term, {
      confidence: Math.min(0.62, 0.34 + score / 40),
      definition: sentence ? clip(sentence, 220) : '',
      chapterId: owner ? chapterByBlock.get(owner.blockId) ?? null : null,
      freq,
      sourceRef: owner
        ? { documentId: owner.documentId, pageNo: owner.pageNo, blockId: owner.blockId, quote: clip(sentence, 160) }
        : undefined,
      tags: ['frequency'],
    })
  }

  // 4) 英文缩写
  for (const { term, freq } of extractAcronyms(fullText)) {
    if (concepts.size >= maxConcepts && !concepts.has(termKey(term))) continue
    upsert(term, { confidence: 0.5, freq, tags: ['acronym'] })
  }

  // 收敛：按置信度 * 频次排序，限制数量
  let list = [...concepts.values()]
    .filter((c) => c.name.length >= 2)
    .sort((a, b) => b.confidence * Math.log2(2 + b.freq) - a.confidence * Math.log2(2 + a.freq))
  // 子串去重：「出电压」这类命名是更完整术语的截断，保留更完整、频次不低的那一个。
  list = list.filter((concept) => !list.some((other) => other !== concept
    && other.name.length > concept.name.length
    && other.name.includes(concept.name)
    && other.freq >= concept.freq
    && (other.confidence ?? 0) >= (concept.confidence ?? 0) - 0.05))
  // 章节标题与概念同名、且该章还有更具体的概念时，去掉这个重复项
  const chapterTitleById = new Map(chapters.map((c) => [c.id, oneLine(c.title).toLowerCase()]))
  const conceptCountByChapter = new Map()
  for (const concept of list) {
    conceptCountByChapter.set(concept.chapterId, (conceptCountByChapter.get(concept.chapterId) ?? 0) + 1)
  }
  list = list.filter((concept) => {
    const title = chapterTitleById.get(concept.chapterId)
    if (!title) return true
    if (oneLine(concept.name).toLowerCase() !== title) return true
    return (conceptCountByChapter.get(concept.chapterId) ?? 0) <= 1
  })
  if (list.length > maxConcepts) list = list.slice(0, maxConcepts)

  // 补齐定义：没有定义的用首次出现的句子
  for (const concept of list) {
    if (concept.definition) continue
    const sentence = bestDefinition(concept.name, sentences) || findSentence(sentences, concept.name)
    if (sentence) {
      concept.definition = clip(sentence, 220)
      const owner = allSentences.find((s) => s.sentence === sentence)?.block
      if (owner && !concept.sourceRefs.length) {
        concept.sourceRefs.push({ documentId: owner.documentId, pageNo: owner.pageNo, blockId: owner.blockId, quote: clip(sentence, 160) })
      }
    }
  }

  // 章节 -> 概念
  const chapterConcepts = new Map(chapters.map((c) => [c.id, []]))
  for (const concept of list) {
    if (!concept.chapterId) {
      // 归到其来源块所在的章节，其次最后一章
      const ref = concept.sourceRefs[0]
      const chapterId = ref ? chapterByBlock.get(ref.blockId) : null
      concept.chapterId = chapterId ?? chapters[chapters.length - 1]?.id ?? null
    }
    if (concept.chapterId && chapterConcepts.has(concept.chapterId)) chapterConcepts.get(concept.chapterId).push(concept.id)
  }
  for (const chapter of chapters) {
    chapter.conceptIds = chapterConcepts.get(chapter.id) ?? []
    chapter.summary = chapter.summary || clip(chapter.text, 160)
  }

  // 关系：前置 / 相关
  const relations = []
  const byName = new Map(list.map((c) => [c.name.toLowerCase(), c]))
  const orderOfChapter = new Map(chapters.map((c) => [c.id, c.order]))
  const contextOf = (concept) => {
    const refs = concept.sourceRefs.slice(0, 3)
    return refs.map((ref) => blockById.get(ref.blockId)?.text ?? '').join(' ')
  }
  const mentionCount = (text, term) => {
    if (!text || !term) return 0
    let count = 0
    let idx = text.indexOf(term)
    while (idx >= 0 && count < 20) { count += 1; idx = text.indexOf(term, idx + term.length) }
    return count
  }
  const prereqCount = new Map()
  for (const concept of list) {
    const context = concept.definition || ''
    const ownOrder = orderOfChapter.get(concept.chapterId) ?? 999
    for (const other of list) {
      if (other.id === concept.id) continue
      if (other.name.length < 2 || other.name === concept.name) continue
      if (GENERIC_TERMS.has(other.name)) continue
      if ((other.freq ?? 0) < 3) continue
      const mentions = mentionCount(context, other.name)
      if (!mentions) continue
      const otherOrder = orderOfChapter.get(other.chapterId) ?? 999
      if (otherOrder < ownOrder) {
        const weight = Math.min(1, 0.35 + mentions * 0.2)
        prereqCount.set(`${concept.id}>${other.id}`, { sourceId: concept.id, targetId: other.id, type: 'prerequisite', weight })
      } else if (Math.abs(otherOrder - ownOrder) <= 1) {
        const weight = Math.min(1, 0.2 + mentions * 0.15)
        relations.push({ id: newId('r'), sourceId: concept.id, targetId: other.id, type: 'related', weight })
      }
    }
  }
  // 前置边每概念最多 4 条，取权重高的
  const prereqByTarget = new Map()
  for (const edge of prereqCount.values()) {
    if (!prereqByTarget.has(edge.sourceId)) prereqByTarget.set(edge.sourceId, [])
    prereqByTarget.get(edge.sourceId).push(edge)
  }
  for (const [, edges] of prereqByTarget) {
    edges.sort((a, b) => b.weight - a.weight)
    for (const edge of edges.slice(0, 4)) relations.push({ id: newId('r'), ...edge })
  }
  // 相关边去重 + 每概念最多 6 条
  const seen = new Set()
  const relatedBySource = new Map()
  for (const edge of relations) {
    const dedupeKey = [edge.type, edge.sourceId, edge.targetId].sort().join('|')
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    if (edge.type !== 'related') continue
    if (!relatedBySource.has(edge.sourceId)) relatedBySource.set(edge.sourceId, [])
    relatedBySource.get(edge.sourceId).push(edge)
  }
  const kept = relations.filter((r) => r.type !== 'related')
  for (const [, edges] of relatedBySource) {
    edges.sort((a, b) => b.weight - a.weight)
    kept.push(...edges.slice(0, 6))
  }

  // 课程概览统计
  const stats = {
    documents: documents.length,
    pages: documents.reduce((n, d) => n + (d.pages?.length ?? 0), 0),
    blocks: blocks.length,
    chapters: chapters.length,
    concepts: list.length,
    relations: kept.length,
    charCount: blocks.reduce((n, b) => n + b.text.length, 0),
    bodyFontSize: body,
  }
  return { chapters, concepts: list, relations: kept, stats, byName }
}

/** 生成文档大纲（章节 + 页码），供 MCP/工具 get_document_outline 使用。 */
export function documentOutline(documents) {
  return documents.map((doc) => ({
    documentId: doc.documentId,
    filename: doc.filename,
    parser: doc.parser,
    pages: doc.pages?.length ?? 0,
    sections: (doc.pages ?? []).flatMap((page) => (page.blocks ?? [])
      .filter((b) => b.kind === 'heading')
      .map((b) => ({ title: oneLine(b.text), pageNo: blockPage(b, page), level: b.level ?? 1 }))),
  }))
}

function blockPage(block, page) {
  return block.pageNo ?? page.pageNo ?? 1
}

/** 文本指纹，用于判断资料是否变化需要重算。 */
export function contentFingerprint(documents) {
  return stableHash(documents.map((d) => `${d.documentId}:${d.pages?.length ?? 0}:${(d.pages ?? []).reduce((n, p) => n + (p.blocks ?? []).length, 0)}`).join('|'))
}
