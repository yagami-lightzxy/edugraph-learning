/**
 * 中英文全文检索（BM25）
 * =====================
 * 纯函数、零依赖、ESM。
 *
 * 分词策略：
 * - 汉字按「1-gram + 2-gram」切分。中文没有空格，1-gram 保证召回，2-gram 提供局部语序信息，
 *   查询与文档用同一套切分，命中判断自然一致。
 * - 拉丁字母/数字按连续串切成小写词，长度 < 2 的丢弃（单个字母几乎不携带信息）。
 * - 标点与空白在切分阶段就被丢弃（只保留汉字与拉丁/数字串），再叠加内置停用词表。
 *
 * 打分：标准 BM25（k1=1.2, b=0.75），查询词去重后按 idf 加权求和。
 * idf 使用 Lucene 形式 ln(1 + (N - df + 0.5) / (df + 0.5))，恒为正，避免高频词负分。
 */

/** BM25 词频饱和系数。 */
const BM25_K1 = 1.2;
/** BM25 文档长度归一化系数。 */
const BM25_B = 0.75;
/** 默认返回条数。 */
const DEFAULT_LIMIT = 20;
/** 摘要默认宽度（字符数）。 */
const DEFAULT_SNIPPET_WIDTH = 120;
/** 摘要最小宽度（低于这个值摘要失去意义，统一抬到这个下限）。 */
const MIN_SNIPPET_WIDTH = 8;
/** 命中窗口前后扩张时允许越过边界的最大距离（宽度大时按 width/3 放大）。 */
const MIN_LOOKBACK = 8;
/** 摘要截断标记。 */
const ELLIPSIS = '…';

/**
 * 停用词：少量中英文虚词。中文单个虚词全部屏蔽；英文按整词屏蔽。
 */
const STOPWORDS = new Set([
  // 中文单字虚词/高频助词
  '的', '地', '得', '了', '着', '过', '和', '与', '及', '或', '是', '在', '有', '为', '以',
  '于', '之', '其', '则', '就', '而', '也', '都', '很', '更', '最', '不', '没', '被', '把',
  '让', '给', '对', '从', '到', '向', '由', '并', '但', '却', '即', '如', '若', '将', '可',
  '这', '那', '哪', '些', '个', '们', '我', '你', '他', '她', '它', '等', '吗', '呢', '吧',
  '啊', '呀', '哦', '嗯',
  // 中文常见双字虚词/套话
  '我们', '你们', '他们', '自己', '什么', '怎么', '如何', '以及', '并且', '或者', '因为',
  '所以', '如果', '虽然', '但是', '然后', '还有', '就是', '这个', '那个', '这样', '那样',
  '这些', '那些', '其中', '对于', '关于', '由于', '根据', '按照', '通过', '可以', '能够',
  '一个', '一些', '一下', '这种', '那种', '没有', '不是', '还是', '已经',
  // 英文停用词
  'a', 'an', 'the', 'of', 'and', 'or', 'but', 'if', 'then', 'than', 'so', 'such', 'as',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am', 'do', 'does', 'did', 'done',
  'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'into', 'onto', 'over', 'under',
  'it', 'its', 'this', 'that', 'these', 'those', 'there', 'here', 'not', 'no', 'nor',
  'has', 'have', 'had', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must',
  'i', 'you', 'he', 'she', 'we', 'they', 'them', 'his', 'her', 'their', 'our', 'your',
  'my', 'me', 'us', 'who', 'whom', 'which', 'what', 'when', 'where', 'why', 'how',
]);

/** 是否为汉字（覆盖常用区、扩展 A、兼容区与扩展 B 以上）。 */
function isHan(cp) {
  return (
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0x20000 && cp <= 0x3ffff)
  );
}

/** 是否为拉丁字母/数字（含拉丁扩展与全角数字、全角字母）。 */
function isWordChar(cp) {
  return (
    (cp >= 0x30 && cp <= 0x39) ||
    (cp >= 0x41 && cp <= 0x5a) ||
    (cp >= 0x61 && cp <= 0x7a) ||
    (cp >= 0xc0 && cp <= 0x24f) ||
    (cp >= 0xff10 && cp <= 0xff19) ||
    (cp >= 0xff21 && cp <= 0xff3a) ||
    (cp >= 0xff41 && cp <= 0xff5a)
  );
}

/**
 * 分词：汉字 1-gram + 2-gram，英文/数字转小写整词（长度 >= 2），过滤停用词与标点。
 * @param {string} text
 * @returns {string[]} 保留重复（tf 需要计数），顺序与原文一致
 */
export function tokenize(text) {
  if (typeof text !== 'string' || text.length === 0) return [];

  const tokens = [];
  let han = '';
  let word = '';

  const push = (token) => {
    if (token.length === 0) return;
    if (STOPWORDS.has(token)) return;
    tokens.push(token);
  };

  const flushHan = () => {
    if (han.length === 0) return;
    const chars = Array.from(han);
    for (let i = 0; i < chars.length; i += 1) {
      push(chars[i]);
      if (i + 1 < chars.length) push(chars[i] + chars[i + 1]);
    }
    han = '';
  };

  const flushWord = () => {
    if (word.length >= 2) push(word);
    word = '';
  };

  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (isHan(cp)) {
      flushWord();
      han += ch;
      continue;
    }
    if (isWordChar(cp)) {
      flushHan();
      word += ch.toLowerCase();
      continue;
    }
    // 标点、空白、其他文字系统：切段
    flushHan();
    flushWord();
  }
  flushHan();
  flushWord();

  return tokens;
}

/** 拆分文档数组的入参，容忍字段缺失。 */
function normalizeDocument(document, fallbackId) {
  const raw = document && typeof document === 'object' ? document : {};
  let text = '';
  if (typeof raw.text === 'string') text = raw.text;
  else if (raw.text != null) text = String(raw.text);
  const meta = raw.meta && typeof raw.meta === 'object' && !Array.isArray(raw.meta) ? raw.meta : {};
  const id = raw.id === undefined ? fallbackId : raw.id;
  return { id, text, meta };
}

/**
 * 建立倒排索引。
 * @param {Array<{id: any, text: string, meta?: object}>} documents
 * @returns {{docCount:number, avgLen:number, postings:Map<string, Array<{docIdx:number, tf:number}>>, lengths:number[], docs:Array}}
 */
export function buildIndex(documents) {
  if (!Array.isArray(documents)) throw new TypeError('buildIndex：documents 必须是数组');

  const docs = [];
  const lengths = [];
  const postings = new Map();
  let totalLength = 0;

  for (let docIdx = 0; docIdx < documents.length; docIdx += 1) {
    const doc = normalizeDocument(documents[docIdx], docIdx);
    const tokens = tokenize(doc.text);
    lengths.push(tokens.length);
    totalLength += tokens.length;

    const frequencies = new Map();
    for (const token of tokens) {
      frequencies.set(token, (frequencies.get(token) || 0) + 1);
    }
    for (const [term, tf] of frequencies) {
      let list = postings.get(term);
      if (list === undefined) {
        list = [];
        postings.set(term, list);
      }
      list.push({ docIdx, tf });
    }

    docs.push(doc);
  }

  const docCount = docs.length;
  return {
    docCount,
    avgLen: docCount === 0 ? 0 : totalLength / docCount,
    postings,
    lengths,
    docs,
  };
}

/** 四舍五入到指定小数位。 */
function roundTo(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** 查询词去重（保持首次出现顺序）。 */
function uniqueTerms(tokens) {
  const seen = new Set();
  const out = [];
  for (const token of tokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    out.push(token);
  }
  return out;
}

/**
 * BM25 检索。
 * @param {object} index buildIndex 的返回值
 * @param {string} query 查询串
 * @param {{limit?:number, k1?:number, b?:number, snippetWidth?:number}} [options]
 * @returns {Array<{id:any, score:number, snippet:string, meta:object}>} 按分数降序，无命中返回 []
 */
export function search(index, query, options) {
  const opts = options && typeof options === 'object' ? options : {};
  const limit = Number.isFinite(opts.limit) && opts.limit > 0 ? Math.floor(opts.limit) : DEFAULT_LIMIT;
  const k1 = Number.isFinite(opts.k1) && opts.k1 > 0 ? opts.k1 : BM25_K1;
  const b = Number.isFinite(opts.b) && opts.b >= 0 && opts.b <= 1 ? opts.b : BM25_B;
  const snippetWidth = Number.isFinite(opts.snippetWidth) ? opts.snippetWidth : DEFAULT_SNIPPET_WIDTH;

  if (!index || typeof index !== 'object') return [];
  if (!(index.postings instanceof Map)) return [];
  if (!Array.isArray(index.lengths) || !Array.isArray(index.docs)) return [];
  if (typeof query !== 'string') return [];

  const docCount = Number.isFinite(index.docCount) ? index.docCount : index.docs.length;
  if (docCount <= 0) return [];

  const terms = uniqueTerms(tokenize(query));
  if (terms.length === 0) return [];

  const avgLen = Number.isFinite(index.avgLen) && index.avgLen > 0 ? index.avgLen : 1;
  const scores = new Map();

  for (const term of terms) {
    const list = index.postings.get(term);
    if (!Array.isArray(list) || list.length === 0) continue;
    const df = list.length;
    const idf = Math.log(1 + (docCount - df + 0.5) / (df + 0.5));
    if (!(idf > 0)) continue;

    for (const posting of list) {
      const docIdx = posting.docIdx;
      const tf = posting.tf;
      if (!Number.isInteger(docIdx) || docIdx < 0 || docIdx >= index.lengths.length) continue;
      if (!(tf > 0)) continue;
      const docLength = Number.isFinite(index.lengths[docIdx]) ? index.lengths[docIdx] : 0;
      const denominator = tf + k1 * (1 - b + (b * docLength) / avgLen);
      if (!(denominator > 0)) continue;
      const contribution = (idf * (tf * (k1 + 1))) / denominator;
      scores.set(docIdx, (scores.get(docIdx) || 0) + contribution);
    }
  }

  if (scores.size === 0) return [];

  // 分数降序；同分按文档原始顺序，保证结果稳定可测。
  const ranked = Array.from(scores.entries()).sort((left, right) => {
    if (right[1] !== left[1]) return right[1] - left[1];
    return left[0] - right[0];
  });

  const results = [];
  for (const [docIdx, rawScore] of ranked) {
    if (results.length >= limit) break;
    const doc = index.docs[docIdx];
    if (!doc) continue;
    results.push({
      id: doc.id,
      score: roundTo(rawScore, 4),
      snippet: snippet(doc.text, terms, { width: snippetWidth }),
      meta: doc.meta && typeof doc.meta === 'object' ? { ...doc.meta } : {},
    });
  }
  return results;
}

/** 归一化摘要引擎收到的 terms。 */
function normalizeTerms(terms) {
  const list = Array.isArray(terms) ? terms : terms == null ? [] : [terms];
  const out = [];
  for (const term of list) {
    if (typeof term !== 'string') continue;
    const trimmed = term.trim();
    if (trimmed.length === 0) continue;
    if (!out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

/** 句读与换行边界：摘要尽量落在整句上，避免把中文从半句切断。 */
const BOUNDARY = new Set([
  '。', '！', '？', '；', '：', '，', '、',
  '.', '!', '?', ';', ':', ',',
  '\n', '\r', '\t',
]);

/**
 * 在候选命中里挑一个作为窗口锚点：优先最长的词，其次最早出现。
 * @returns {{start:number, length:number}|null}
 */
function findAnchor(lowerSource, source, terms) {
  const ordered = [...terms].sort((left, right) => right.length - left.length);
  for (const term of ordered) {
    const needle = term.toLowerCase();
    if (needle.length === 0) continue;
    const position = lowerSource.length === source.length
      ? lowerSource.indexOf(needle)
      : source.indexOf(term);
    if (position >= 0) return { start: position, length: term.length };
  }
  return null;
}

/** 收集窗口内所有命中区间（长词先扫，重叠的留给 mergeRanges 取并集）。 */
function collectRanges(windowText, terms) {
  if (terms.length === 0 || windowText.length === 0) return [];

  const lowerWindow = windowText.toLowerCase();
  const caseAligned = lowerWindow.length === windowText.length;
  const haystack = caseAligned ? lowerWindow : windowText;
  const ordered = [...terms].sort((left, right) => right.length - left.length);
  const ranges = [];

  for (const term of ordered) {
    const needle = caseAligned ? term.toLowerCase() : term;
    if (needle.length === 0 || needle.length > haystack.length) continue;
    let cursor = 0;
    while (cursor <= haystack.length - needle.length) {
      const position = haystack.indexOf(needle, cursor);
      if (position < 0) break;
      // 重叠的区间不丢弃，交给 mergeRanges 取并集：
      // 中文「二极」+「极管」两段 2-gram 正好拼成「二极管」，合并后才是完整的一个粗体段。
      ranges.push({ start: position, end: position + needle.length });
      cursor = position + needle.length;
    }
  }

  return ranges.sort((left, right) => left.start - right.start);
}

/** 相邻/重叠的区间合并成一个粗体段，避免出现 **二****极管** 这种碎片。 */
function mergeRanges(ranges) {
  const merged = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ start: range.start, end: range.end });
    }
  }
  return merged;
}

/**
 * 给窗口内命中的词加 ** 粗体。
 * 中文 1-gram 是召回用的，直接高亮会把「半导体」里的「导」也标上，
 * 所以只要存在多字词就优先只标注多字词；实在标不上再退回单字。
 */
function highlight(windowText, terms) {
  if (terms.length === 0 || windowText.length === 0) return windowText;

  const longTerms = terms.filter((term) => term.length >= 2);
  let ranges = collectRanges(windowText, longTerms.length > 0 ? longTerms : terms);
  if (ranges.length === 0 && longTerms.length > 0) {
    ranges = collectRanges(windowText, terms);
  }
  if (ranges.length === 0) return windowText;

  let output = '';
  let cursor = 0;
  for (const range of mergeRanges(ranges)) {
    output += windowText.slice(cursor, range.start);
    output += '**' + windowText.slice(range.start, range.end) + '**';
    cursor = range.end;
  }
  output += windowText.slice(cursor);
  return output;
}

/**
 * 生成命中摘要：从命中位置向两侧扩出窗口，落在句读边界上，
 * 命中的词用 ** 包裹，两端用「…」表示截断。
 * @param {string} text 原文
 * @param {string[]|string} terms 需要高亮的词
 * @param {{width?: number}} [options]
 * @returns {string}
 */
export function snippet(text, terms, options) {
  const source = typeof text === 'string' ? text : text == null ? '' : String(text);
  if (source.length === 0) return '';

  const opts = options && typeof options === 'object' ? options : {};
  const requested = Number.isFinite(opts.width) ? Math.floor(opts.width) : DEFAULT_SNIPPET_WIDTH;
  const width = Math.max(MIN_SNIPPET_WIDTH, requested);
  const termList = normalizeTerms(terms);

  const lowerSource = source.toLowerCase();
  const anchor = termList.length === 0 ? null : findAnchor(lowerSource, source, termList);

  const lookback = Math.max(MIN_LOOKBACK, Math.floor(width / 3));
  // 1) 以命中词为中心开出初始窗口。
  const leading = anchor ? Math.max(0, Math.floor((width - anchor.length) / 2)) : 0;
  let start = anchor ? Math.max(0, anchor.start - leading) : 0;
  let end = Math.min(source.length, start + width);

  // 2) 让起点落在句读/换行之后：优先在窗口内朝锚点方向找边界（前移，句子更完整），
  //    找不到再向前回退。中文没有空格，这一条比按空格切更贴近「不要截成半句」。
  if (start > 0) {
    const ceiling = Math.min(anchor.start, start + Math.floor(width / 2));
    let snapped = -1;
    for (let i = ceiling - 1; i >= start; i -= 1) {
      if (BOUNDARY.has(source[i])) {
        snapped = i + 1;
        break;
      }
    }
    if (snapped > 0) {
      start = snapped;
    } else {
      const floor = Math.max(0, start - lookback);
      for (let i = start - 1; i >= floor; i -= 1) {
        if (BOUNDARY.has(source[i])) {
          start = i + 1;
          break;
        }
      }
    }
  }

  end = Math.min(source.length, start + width);
  if (anchor) {
    const anchorEnd = anchor.start + anchor.length;
    if (end < anchorEnd) {
      end = Math.min(source.length, anchorEnd);
      start = Math.max(0, end - width);
    }
  }

  // 3) 终点向后扩到最近的句读/换行，尽量不给半句话。
  if (end < source.length) {
    const ceiling = Math.min(source.length, end + lookback);
    for (let i = end; i < ceiling; i += 1) {
      if (BOUNDARY.has(source[i])) {
        end = i + 1;
        break;
      }
    }
  }

  // 去掉窗口两端空白（先裁窗口再做高亮，避免破坏下标）。
  while (start < end && /\s/.test(source[start])) start += 1;
  while (end > start && /\s/.test(source[end - 1])) end -= 1;
  if (end <= start) return '';

  const windowText = source.slice(start, end);
  const body = highlight(windowText, termList).replace(/\s+/g, ' ').trim();

  const prefix = start > 0 ? ELLIPSIS : '';
  const suffix = end < source.length ? ELLIPSIS : '';
  return prefix + body + suffix;
}
