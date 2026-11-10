/**
 * FSRS-5 复习调度（简化实现）
 * ==========================
 * 纯函数、零依赖、ESM。时间一律使用毫秒时间戳，稳定度 stability 的单位是「天」。
 *
 * 参数与公式取自公开的 FSRS-4.5 / FSRS-5 默认权重：
 * - 初始稳定度      S0(G) = w[G-1]                       （w0..w3）
 * - 初始难度        D0(G) = clamp(w4 - e^(w5*(G-1)) + 1, 1, 10)
 * - 难度演化        D'  = clamp(D - w6*(G-3), 1, 10)
 *                   D'' = w7 * D0(4) + (1-w7) * D'
 * - 成功回忆        S' = S * (1 + e^w8 * (11-D) * S^-w9 * (e^((1-R)*w10) - 1) * hard * easy)
 * - 遗忘            S' = w11 * D^-w12 * ((S+1)^w13 - 1) * e^((1-R)*w14)，并以 S 为上限
 * - 遗忘曲线        R = (1 + FACTOR * t / S)^DECAY
 * - 间隔反解        interval = S / FACTOR * (retention^(1/DECAY) - 1)
 *
 * 刻意的简化（完整 FSRS 有、这里没有的部分）：
 * 1. 不做 same-day review 的 w17/w18 短时稳定度公式：learning 卡在 Hard/Good/Easy
 *    毕业时直接取 S0(G)，符合「首次成功回忆走 S0 逻辑」的约定。
 * 2. 目标保留率固定 0.9（DEFAULT_TARGET_RETENTION），不对外暴露。
 * 3. G==1 时调度 10 分钟后再来（FSRS-5 的学习步长之一），不进入按天取整的间隔估算。
 */

/** 一天的毫秒数。 */
const DAY_MS = 86_400_000;
/** Again 之后的重学间隔：10 分钟。 */
const AGAIN_DELAY_MS = 10 * 60 * 1000;
/** 遗忘曲线衰减指数。 */
const DECAY = -0.5;
/** 遗忘曲线因子 FACTOR = 0.9^(1/DECAY) - 1 ≈ 0.2345679。 */
const FACTOR = 0.9 ** (1 / DECAY) - 1;
/** 目标保留率（间隔反解用）。 */
const DEFAULT_TARGET_RETENTION = 0.9;
/** 按天调度时的上下限。 */
const MIN_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 36_500;
/** 难度上下限。 */
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;
/** 合法卡片状态。 */
const STATES = Object.freeze(['new', 'learning', 'review', 'relearning']);

/**
 * 21 个默认参数。
 * w0..w18 是公开的 FSRS-5 默认权重（19 个），其中 w17/w18 属于 same-day review 的
 * 短时稳定度公式，本简化实现不使用、仅保留槽位；w19/w20 为后续版本参数预留，
 * 同样不参与本模块的公式。签名固定为 21 位，方便以后替换成训练出来的权重。
 */
export const FSRS_PARAMS = Object.freeze([
  // S0：G=1..4 的初始稳定度
  0.40255, 1.18385, 3.173, 15.69105,
  // D0 与难度演化
  7.1949, 0.5345, 1.4604, 0.0046,
  // 成功回忆的稳定度增长
  1.54575, 0.1192, 1.01925,
  // 遗忘的稳定度收缩
  1.9395, 0.11, 0.29605, 2.2698,
  // Hard 惩罚 / Easy 奖励
  0.2315, 2.9898,
  // 短时复习权重（本实现未使用）
  0.51655, 0.6621,
  // 预留槽位（本实现未使用）
  0.1051, 0.2713,
]);

const param = (index) => FSRS_PARAMS[index];

/** 限定到 [min, max]，NaN 视为 min。 */
function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** 四舍五入到指定小数位。 */
function roundTo(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** 校验并归一化评分：1=Again 2=Hard 3=Good 4=Easy。 */
function normalizeRating(rating) {
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 4) {
    throw new RangeError('rating 必须是 1..4 的整数（1=Again 2=Hard 3=Good 4=Easy），收到：' + String(rating));
  }
  return rating;
}

/** 校验时间戳。 */
function normalizeTime(now, label) {
  const value = typeof now === 'number' ? now : Number(now);
  if (!Number.isFinite(value)) {
    throw new TypeError(label + ' 必须是毫秒时间戳（有限数字），收到：' + String(now));
  }
  return value;
}

/** 初始稳定度 S0(G) = w[G-1]。 */
function initialStability(grade) {
  return param(grade - 1);
}

/** 初始难度 D0(G) = clamp(w4 - e^(w5*(G-1)) + 1, 1, 10)。 */
function initialDifficulty(grade) {
  const value = param(4) - Math.exp(param(5) * (grade - 1)) + 1;
  return clamp(value, MIN_DIFFICULTY, MAX_DIFFICULTY);
}

/** D0(4)：难度 mean-reversion 的目标值。 */
const INITIAL_DIFFICULTY_EASY = initialDifficulty(4);

/** 下次难度：先按评分平移，再向 D0(4) 线性阻尼。 */
function nextDifficulty(difficulty, grade) {
  const current = clamp(difficulty, MIN_DIFFICULTY, MAX_DIFFICULTY);
  const shifted = clamp(current - param(6) * (grade - 3), MIN_DIFFICULTY, MAX_DIFFICULTY);
  const damped = param(7) * INITIAL_DIFFICULTY_EASY + (1 - param(7)) * shifted;
  return clamp(damped, MIN_DIFFICULTY, MAX_DIFFICULTY);
}

/** 遗忘曲线：给定稳定度与已过天数，返回可提取概率 R。 */
function retrievabilityFromStability(stability, elapsedDays) {
  if (!Number.isFinite(stability) || stability <= 0) return 0;
  const elapsed = Number.isFinite(elapsedDays) && elapsedDays > 0 ? elapsedDays : 0;
  const value = (1 + (FACTOR * elapsed) / stability) ** DECAY;
  return clamp(value, 0, 1);
}

/** 成功回忆后的稳定度。 */
function recallStability(stability, difficulty, recall, grade) {
  if (!Number.isFinite(stability) || stability <= 0) return initialStability(grade);
  const hardPenalty = grade === 2 ? param(15) : 1;
  const easyBonus = grade === 4 ? param(16) : 1;
  const growth =
    Math.exp(param(8)) *
    (11 - difficulty) *
    stability ** -param(9) *
    (Math.exp((1 - recall) * param(10)) - 1) *
    hardPenalty *
    easyBonus;
  const next = stability * (1 + growth);
  return Number.isFinite(next) && next > 0 ? next : initialStability(grade);
}

/** 遗忘后的稳定度，并以原稳定度为上限（短时记忆不会因一次遗忘而变「更牢」）。 */
function forgettingStability(stability, difficulty, recall) {
  const d = clamp(difficulty, MIN_DIFFICULTY, MAX_DIFFICULTY);
  const computed =
    param(11) * d ** -param(12) * ((stability + 1) ** param(13) - 1) * Math.exp((1 - recall) * param(14));
  const bounded = Number.isFinite(computed) && computed > 0 ? computed : stability;
  return Math.min(bounded, stability);
}

/** 未取整的间隔天数（天）。 */
function rawIntervalDays(stability, retention = DEFAULT_TARGET_RETENTION) {
  if (!Number.isFinite(stability) || stability <= 0) return MIN_INTERVAL_DAYS;
  const days = (stability / FACTOR) * (retention ** (1 / DECAY) - 1);
  return clamp(days, MIN_INTERVAL_DAYS, MAX_INTERVAL_DAYS);
}

/** 实际调度用的间隔天数：四舍五入，限制在 [1, 36500]。 */
function intervalDays(stability, retention = DEFAULT_TARGET_RETENTION) {
  return clamp(Math.round(rawIntervalDays(stability, retention)), MIN_INTERVAL_DAYS, MAX_INTERVAL_DAYS);
}

/** 复制并修补卡片，保证后续计算拿到合法数值。 */
function normalizeCard(card) {
  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    throw new TypeError('card 必须是卡片对象');
  }
  const state = STATES.includes(card.state) ? card.state : 'new';
  const stability = Number.isFinite(card.stability) && card.stability > 0 ? card.stability : 0;
  const rawDifficulty = Number.isFinite(card.difficulty) ? card.difficulty : MIN_DIFFICULTY;
  const difficulty = clamp(
    rawDifficulty > 0 ? rawDifficulty : INITIAL_DIFFICULTY_EASY,
    MIN_DIFFICULTY,
    MAX_DIFFICULTY,
  );
  const reps = Number.isInteger(card.reps) && card.reps >= 0 ? card.reps : 0;
  const lapses = Number.isInteger(card.lapses) && card.lapses >= 0 ? card.lapses : 0;
  const lastReview = Number.isFinite(card.lastReview) ? card.lastReview : null;
  return { state, stability, difficulty, reps, lapses, lastReview };
}

/**
 * 计算一次复习的结果（内部实现，入参已归一化）。
 * 返回新的卡片对象，不修改入参。
 */
function computeNext(current, grade, timestamp) {
  const elapsedDays =
    current.lastReview === null ? 0 : Math.max(0, (timestamp - current.lastReview) / DAY_MS);
  // 新卡还没有稳定度，不参与遗忘曲线；其余状态用模型自身的 R（与对外的 retrievability 分开，
  // 后者按接口约定对 new/learning 返回 0）。
  const recall = current.state === 'new'
    ? 0
    : retrievabilityFromStability(current.stability, elapsedDays);

  let stability;
  let difficulty;

  if (current.state === 'new') {
    // 首次评分：无论评分如何都走 S0/D0，避免 D=0 让遗忘公式发散。
    stability = initialStability(grade);
    difficulty = initialDifficulty(grade);
  } else if (grade === 1) {
    stability = forgettingStability(current.stability, current.difficulty, recall);
    difficulty = nextDifficulty(current.difficulty, grade);
  } else if (current.state === 'learning') {
    // 学习阶段的第一次成功回忆直接采用 S0，随后毕业进入 review。
    stability = initialStability(grade);
    difficulty = nextDifficulty(current.difficulty, grade);
  } else {
    stability = recallStability(current.stability, current.difficulty, recall, grade);
    difficulty = nextDifficulty(current.difficulty, grade);
  }

  const state = grade === 1
    ? (current.state === 'review' || current.state === 'relearning' ? 'relearning' : 'learning')
    : 'review';

  let due;
  let scheduledDays;
  if (grade === 1) {
    // 重学步长：10 分钟后再来一次，state 停留在 learning/relearning。
    scheduledDays = 0;
    due = timestamp + AGAIN_DELAY_MS;
  } else {
    scheduledDays = intervalDays(stability);
    due = timestamp + scheduledDays * DAY_MS;
  }

  return {
    due,
    stability,
    difficulty,
    reps: current.reps + 1,
    lapses: current.lapses + (grade === 1 ? 1 : 0),
    state,
    lastReview: timestamp,
    elapsedDays,
    scheduledDays,
  };
}

/**
 * 新建一张「全新」卡片。
 * difficulty 预置为 5（落在 1..10 区间内），首次复习时会被 D0(G) 覆盖。
 * @param {number} [now] 当前时间戳（毫秒）
 */
export function createCard(now = Date.now()) {
  const timestamp = normalizeTime(now, 'now');
  return {
    due: timestamp,
    stability: 0,
    difficulty: 5,
    reps: 0,
    lapses: 0,
    state: 'new',
    lastReview: null,
  };
}

/**
 * 复习一次，返回新卡片（不修改入参）。
 * @param {object} card 卡片
 * @param {1|2|3|4} rating 1=Again 2=Hard 3=Good 4=Easy
 * @param {number} [now] 当前时间戳（毫秒）
 */
export function reviewCard(card, rating, now = Date.now()) {
  const grade = normalizeRating(rating);
  const timestamp = normalizeTime(now, 'now');
  return computeNext(normalizeCard(card), grade, timestamp);
}

/**
 * 当前可提取概率（0..1）。new / learning 卡一律返回 0。
 * @param {object} card 卡片
 * @param {number} [now] 当前时间戳（毫秒）
 */
export function retrievability(card, now = Date.now()) {
  const timestamp = normalizeTime(now, 'now');
  const current = normalizeCard(card);
  if (current.state === 'new' || current.state === 'learning') return 0;
  if (current.lastReview === null) return 0;
  const elapsedDays = Math.max(0, (timestamp - current.lastReview) / DAY_MS);
  return retrievabilityFromStability(current.stability, elapsedDays);
}

/**
 * 预览四个评分档位对应的间隔（单位：天，保留 2 位小数）。
 * 这里返回未取整的估算值；真正落库的 due 会四舍五入到整天，Again 档固定为 10 分钟。
 * @param {object} card 卡片
 * @param {number} [now] 当前时间戳（毫秒）
 * @returns {{1:number,2:number,3:number,4:number}}
 */
export function previewIntervals(card, now = Date.now()) {
  const timestamp = normalizeTime(now, 'now');
  const current = normalizeCard(card);
  const preview = {};
  for (const grade of [1, 2, 3, 4]) {
    const next = computeNext(current, grade, timestamp);
    const days = grade === 1 ? AGAIN_DELAY_MS / DAY_MS : rawIntervalDays(next.stability);
    preview[grade] = roundTo(days, 2);
  }
  return preview;
}

/**
 * 序列化为 JSON 字符串（字段顺序固定，省略未设置的 elapsedDays/scheduledDays）。
 * @param {object} card 卡片
 * @returns {string}
 */
export function serializeCard(card) {
  if (!card || typeof card !== 'object') throw new TypeError('card 必须是卡片对象');
  const payload = {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReview: card.lastReview === undefined ? null : card.lastReview,
  };
  if (typeof card.elapsedDays === 'number' && Number.isFinite(card.elapsedDays)) {
    payload.elapsedDays = card.elapsedDays;
  }
  if (typeof card.scheduledDays === 'number' && Number.isFinite(card.scheduledDays)) {
    payload.scheduledDays = card.scheduledDays;
  }
  return JSON.stringify(payload);
}

/**
 * 反序列化：接受 JSON 字符串或普通对象，返回修补过默认值的卡片对象。
 * @param {string|object} raw
 */
export function hydrateCard(raw) {
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch (error) {
      throw new TypeError('hydrateCard 收到无法解析的 JSON 字符串：' + error.message);
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new TypeError('hydrateCard 需要卡片对象或 JSON 字符串');
  }

  const card = {
    due: Number.isFinite(data.due) ? data.due : 0,
    stability: Number.isFinite(data.stability) ? data.stability : 0,
    difficulty: Number.isFinite(data.difficulty) ? data.difficulty : 0,
    reps: Number.isInteger(data.reps) && data.reps >= 0 ? data.reps : 0,
    lapses: Number.isInteger(data.lapses) && data.lapses >= 0 ? data.lapses : 0,
    state: STATES.includes(data.state) ? data.state : 'new',
    lastReview: Number.isFinite(data.lastReview) ? data.lastReview : null,
  };
  if (Number.isFinite(data.elapsedDays)) card.elapsedDays = data.elapsedDays;
  if (Number.isFinite(data.scheduledDays)) card.scheduledDays = data.scheduledDays;
  return card;
}
