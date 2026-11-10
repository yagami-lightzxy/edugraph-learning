import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FSRS_PARAMS,
  createCard,
  reviewCard,
  retrievability,
  previewIntervals,
  serializeCard,
  hydrateCard,
} from '../lib/fsrs.js';

/** 一天 / 十分钟的毫秒数，测试内部反复用到。 */
const DAY = 86_400_000;
const TEN_MINUTES = 10 * 60 * 1000;
/** 固定基准时间，避免用例依赖当前时间。 */
const T0 = Date.UTC(2026, 0, 1, 0, 0, 0);

/** 连续复习若干次，返回每一步的卡片。 */
function reviewMany(card, ratings, start = T0) {
  const steps = [];
  let now = start;
  let current = card;
  for (const rating of ratings) {
    current = reviewCard(current, rating, now);
    steps.push(current);
    now = current.due;
  }
  return steps;
}

test('FSRS_PARAMS 是 21 个有限数字', () => {
  assert.ok(Array.isArray(FSRS_PARAMS), 'FSRS_PARAMS 应当是数组');
  assert.equal(FSRS_PARAMS.length, 21);
  for (const [index, value] of FSRS_PARAMS.entries()) {
    assert.equal(typeof value, 'number', 'w' + index + ' 必须是数字');
    assert.ok(Number.isFinite(value), 'w' + index + ' 必须是有限数字');
  }
});

test('createCard 返回一张全新卡片', () => {
  const card = createCard(T0);
  assert.equal(card.due, T0, '新卡应立即到期');
  assert.equal(card.stability, 0, '新卡尚未建立稳定度');
  assert.equal(card.reps, 0);
  assert.equal(card.lapses, 0);
  assert.equal(card.state, 'new');
  assert.equal(card.lastReview, null);
  assert.ok(card.difficulty >= 1 && card.difficulty <= 10, 'difficulty 必须落在 1..10');
  assert.equal(card.elapsedDays, undefined, '新卡不应带 elapsedDays');

  // 默认参数应当是「现在」
  const before = Date.now();
  const live = createCard();
  const after = Date.now();
  assert.ok(live.due >= before && live.due <= after, '默认 due 应当是当前时间');
});

test('连续 Good 的间隔单调递增', () => {
  let card = createCard(T0);
  let now = T0;
  const intervals = [];
  for (let i = 0; i < 6; i += 1) {
    card = reviewCard(card, 3, now);
    intervals.push((card.due - now) / DAY);
    now = card.due;
  }
  assert.equal(card.state, 'review', '连续 Good 后应处于 review');
  assert.equal(card.reps, 6);
  for (let i = 1; i < intervals.length; i += 1) {
    assert.ok(
      intervals[i] > intervals[i - 1],
      '第 ' + i + ' 次间隔 ' + intervals[i] + ' 应当大于上一次 ' + intervals[i - 1],
    );
  }
  assert.ok(intervals[0] >= 1, '首次 Good 至少排 1 天');
});

test('Again 使 stability 下降，并在 10 分钟后重学', () => {
  const good = reviewMany(createCard(T0), [3, 3]);
  const before = good[good.length - 1];
  assert.equal(before.state, 'review');

  const now = before.due;
  const lapsed = reviewCard(before, 1, now);

  assert.ok(lapsed.stability < before.stability, '遗忘后稳定度必须下降');
  assert.equal(lapsed.due - now, TEN_MINUTES, 'Again 后应当在 10 分钟后再来');
  assert.equal(lapsed.state, 'relearning', 'review 卡遗忘后进入 relearning');
  assert.equal(lapsed.lapses, before.lapses + 1, 'lapses 应当 +1');
  assert.equal(lapsed.reps, before.reps + 1, 'reps 应当 +1');
  assert.equal(lapsed.lastReview, now);
});

test('新卡 Again 进入 learning 且 10 分钟后到期', () => {
  const card = reviewCard(createCard(T0), 1, T0);
  assert.equal(card.state, 'learning');
  assert.equal(card.due - T0, TEN_MINUTES);
  assert.equal(card.stability, FSRS_PARAMS[0], '新卡首次评分使用 S0(1)');
  assert.equal(card.reps, 1);
  assert.equal(card.scheduledDays, 0, '十分钟的步长记为 0 天');
});

test('retrievability 随时间下降', () => {
  const fresh = createCard(T0);
  assert.equal(retrievability(fresh, T0), 0, 'new 卡返回 0');

  const learning = reviewCard(fresh, 1, T0);
  assert.equal(retrievability(learning, learning.due), 0, 'learning 卡返回 0');

  const card = reviewCard(fresh, 3, T0);
  const samples = [0, 3, 10, 30, 365].map((days) => retrievability(card, T0 + days * DAY));
  for (let i = 1; i < samples.length; i += 1) {
    assert.ok(samples[i] < samples[i - 1], '第 ' + i + ' 个采样点应当低于前一个');
  }
  assert.ok(samples[0] <= 1 && samples[0] > 0.99, '刚复习完的可提取率接近 1');
  assert.ok(samples[samples.length - 1] >= 0, '可提取率不会为负');
  for (const value of samples) {
    assert.ok(value >= 0 && value <= 1, '可提取率落在 0..1');
  }
});

test('previewIntervals 四档递增', () => {
  const fresh = createCard(T0);
  const freshPreview = previewIntervals(fresh, T0);
  assert.deepEqual(Object.keys(freshPreview).map(Number).sort((a, b) => a - b), [1, 2, 3, 4]);
  assert.ok(
    freshPreview[1] < freshPreview[2] && freshPreview[2] < freshPreview[3] && freshPreview[3] < freshPreview[4],
    '新卡四档预览应当递增：' + JSON.stringify(freshPreview),
  );

  const reviewed = reviewMany(createCard(T0), [3, 3]).pop();
  const reviewPreview = previewIntervals(reviewed, reviewed.due);
  assert.ok(
    reviewPreview[1] < reviewPreview[2] &&
      reviewPreview[2] < reviewPreview[3] &&
      reviewPreview[3] < reviewPreview[4],
    '复习卡四档预览应当递增：' + JSON.stringify(reviewPreview),
  );

  // 保留两位小数
  for (const value of Object.values(reviewPreview)) {
    assert.equal(value, Math.round(value * 100) / 100, '预览值保留两位小数');
  }
  assert.equal(freshPreview[1], 0.01, 'Again 档的 10 分钟换算成天是 0.01');
});

test('序列化往返一致', () => {
  const fresh = createCard(T0);
  assert.equal(typeof serializeCard(fresh), 'string');
  assert.deepEqual(hydrateCard(serializeCard(fresh)), fresh, '新卡往返一致');

  const reviewed = reviewMany(createCard(T0), [4, 3, 1, 3]).pop();
  const restored = hydrateCard(serializeCard(reviewed));
  assert.deepEqual(restored, reviewed, '复习过的卡片往返一致');

  // 也接受已经解析好的对象
  assert.deepEqual(hydrateCard(JSON.parse(serializeCard(reviewed))), reviewed);

  // 继续复习时行为一致
  const fromRestored = reviewCard(restored, 3, restored.due);
  const fromOriginal = reviewCard(reviewed, 3, reviewed.due);
  assert.deepEqual(fromRestored, fromOriginal, '反序列化后的卡片可以继续复习');

  assert.throws(() => hydrateCard('{'), TypeError, '非法 JSON 应当抛 TypeError');
  assert.throws(() => hydrateCard(null), TypeError);
});

test('difficulty 始终落在 1..10', () => {
  const sequences = [
    [1],
    [2],
    [3],
    [4],
    [1, 1, 1, 1],
    [4, 4, 4, 4],
    [1, 4, 1, 4, 1],
    [2, 3, 4, 1, 3, 2, 4, 1, 1, 1, 4, 2, 3, 1],
  ];
  for (const ratings of sequences) {
    let now = T0;
    for (const card of reviewMany(createCard(T0), ratings)) {
      assert.ok(
        card.difficulty >= 1 && card.difficulty <= 10,
        '序列 ' + ratings.join('') + ' 的 difficulty 越界：' + card.difficulty,
      );
      assert.ok(Number.isFinite(card.difficulty), 'difficulty 必须是有限数字');
      assert.ok(Number.isFinite(card.stability) && card.stability > 0, 'stability 必须为正');
      assert.ok(Number.isFinite(card.due) && card.due > now, 'due 必须晚于本次复习时间');
      now = card.due;
    }
  }
});

test('reviewCard 是纯函数，不修改入参', () => {
  const card = Object.freeze(createCard(T0));
  const snapshot = JSON.parse(JSON.stringify(card));
  const next = reviewCard(card, 3, T0);
  assert.deepEqual(card, snapshot, '入参不应被修改');
  assert.notEqual(next, card, '应当返回新对象');
});

test('非法评分与时间戳会被拒绝', () => {
  const card = createCard(T0);
  for (const bad of [0, 5, -1, 2.5, '3', null, undefined, Number.NaN]) {
    assert.throws(() => reviewCard(card, bad, T0), RangeError, '应当拒绝 rating=' + String(bad));
  }
  assert.throws(() => reviewCard(card, 3, 'now'), TypeError);
  assert.throws(() => reviewCard(null, 3, T0), TypeError);
});

test('scheduledDays 与实际天数一致', () => {
  const steps = reviewMany(createCard(T0), [3, 3, 4, 2, 1, 3]);
  let previous = { due: T0 };
  for (const card of steps) {
    if (card.state === 'learning' || card.state === 'relearning') {
      assert.equal(card.scheduledDays, 0, '短时步长记为 0 天');
      assert.equal(card.due - previous.due, TEN_MINUTES, '短时步长固定 10 分钟');
    } else {
      assert.equal((card.due - previous.due) / DAY, card.scheduledDays, 'due 间隔应等于 scheduledDays');
      assert.ok(card.scheduledDays >= 1, '按天调度至少 1 天');
    }
    previous = card;
  }
});
