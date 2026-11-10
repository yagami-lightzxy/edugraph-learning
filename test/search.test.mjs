import test from 'node:test';
import assert from 'node:assert/strict';

import { tokenize, buildIndex, search, snippet } from '../lib/search.js';

/** 基础语料：一中文段、一中文段、一英文段、一混合段。 */
const DOCS = [
  {
    id: 'diode',
    text: '二极管是一种常见的半导体器件。二极管的核心特性是单向导通：正向导通，反向截止。',
    meta: { chapter: 1, topic: '二极管' },
  },
  {
    id: 'triode',
    text: '三极管（双极型晶体管）通过基极电流控制集电极电流，可用于放大和开关。',
    meta: { chapter: 2 },
  },
  {
    id: 'capacitor',
    text: 'The capacitor stores electric charge, and the capacitance is measured in farads.',
    meta: { chapter: 3 },
  },
  {
    id: 'rc',
    text: 'RC 电路由电阻和电容组成，用于滤波与延时。',
    meta: { chapter: 4 },
  },
];

/** 去掉摘要里的高亮与省略号标记，只留下正文字符。 */
function stripMarks(text) {
  return text.replace(/\*\*/g, '').replace(/…/g, '');
}

test('tokenize：中文按 1-gram + 2-gram 切分', () => {
  assert.deepEqual(tokenize('二极管'), ['二', '二极', '极', '极管', '管']);
  assert.deepEqual(tokenize('导通'), ['导', '导通', '通']);
});

test('tokenize：英文与数字小写化，长度小于 2 的词丢弃', () => {
  assert.deepEqual(tokenize('QUICK brown FOX'), ['quick', 'brown', 'fox']);
  assert.deepEqual(tokenize('Node 24 ESM'), ['node', '24', 'esm']);
  assert.deepEqual(tokenize('a b c abc'), ['abc'], '单字符词应当被丢弃');
  assert.deepEqual(tokenize('FSRS-5'), ['fsrs'], '连字符切分且 5 太短');
});

test('tokenize：过滤停用词与纯标点', () => {
  const tokens = tokenize('的了和是在');
  for (const stopword of ['的', '了', '和', '是', '在']) {
    assert.ok(!tokens.includes(stopword), '停用词 ' + stopword + ' 应当被过滤');
  }
  assert.deepEqual(tokenize('，。！？ ；：\n\t'), [], '纯标点不产生词');
  assert.deepEqual(tokenize(''), []);
  assert.deepEqual(tokenize(null), []);
  assert.deepEqual(tokenize(undefined), []);
  assert.deepEqual(tokenize(123), [], '非字符串入参返回空数组');
});

test('tokenize：2-gram 只在连续汉字段内产生', () => {
  const tokens = tokenize('二极管 test 导通');
  assert.deepEqual(tokens, ['二', '二极', '极', '极管', '管', 'test', '导', '导通', '通']);
  assert.ok(!tokens.includes('管导'), '空白两侧的汉字不应拼成一个 2-gram');
});

test('buildIndex：返回可用的倒排索引', () => {
  const index = buildIndex(DOCS);
  assert.equal(index.docCount, DOCS.length);
  assert.ok(index.avgLen > 0, '平均长度应当为正');
  assert.ok(index.postings instanceof Map);
  assert.equal(index.lengths.length, DOCS.length);
  assert.equal(index.docs.length, DOCS.length);
  assert.deepEqual(index.docs.map((doc) => doc.id), DOCS.map((doc) => doc.id));

  const postings = index.postings.get('二极');
  assert.ok(Array.isArray(postings), '「二极」应当有倒排表');
  const hit = postings.find((entry) => entry.docIdx === 0);
  assert.ok(hit && hit.tf >= 2, 'diode 文档里「二极」出现两次以上');

  // 空文档集不崩
  const empty = buildIndex([]);
  assert.equal(empty.docCount, 0);
  assert.equal(empty.avgLen, 0);
});

test('中文查询命中中文文档', () => {
  const index = buildIndex(DOCS);
  const results = search(index, '二极管 导通');
  assert.ok(results.length >= 1);
  assert.equal(results[0].id, 'diode', '最相关的结果应当是二极管那篇');
  for (const result of results) {
    assert.ok(result.score > 0, '命中的分数必须为正');
  }

  const snippetText = results[0].snippet;
  assert.ok(snippetText.includes('二极管'), '摘要里应当出现命中词');
});

test('同义词不做扩展：查不到就是查不到', () => {
  const index = buildIndex(DOCS);
  assert.deepEqual(search(index, 'condenser'), [], 'condenser 不是 capacitor 的同义词扩展项');
  assert.deepEqual(search(index, '磁滞回线'), [], '语料里没有的词应当返回空数组');
});

test('英文大小写不敏感', () => {
  const index = buildIndex(DOCS);
  const lower = search(index, 'capacitor');
  const upper = search(index, 'CAPACITOR');
  const mixed = search(index, 'CaPaCiToR');
  assert.equal(lower[0].id, 'capacitor');
  assert.deepEqual(upper.map((r) => r.id), lower.map((r) => r.id));
  assert.deepEqual(mixed.map((r) => r.id), lower.map((r) => r.id));
  assert.equal(upper[0].score, lower[0].score, '大小写不应改变打分');
});

test('BM25 排序：更相关的文档排前面', () => {
  // 同样命中，短文档分数更高（长度归一化）
  const lengthIndex = buildIndex([
    { id: 'focused', text: '二极管单向导通' },
    { id: 'diluted', text: '二极管单向导通' + '填充文本'.repeat(40) },
  ]);
  assert.deepEqual(search(lengthIndex, '二极管 导通').map((r) => r.id), ['focused', 'diluted']);

  // 覆盖更多查询词的文档分数更高
  const coverageIndex = buildIndex([
    { id: 'both', text: '二极管具有单向导通的特性' },
    { id: 'partial', text: '半导体材料的一般介绍' },
  ]);
  const ranked = search(coverageIndex, '导通');
  assert.equal(ranked[0].id, 'both', '同时命中 导通/导/通 的文档应当排在只命中「导」的文档前面');
  assert.ok(ranked[0].score > ranked[1].score);

  // 英文同理：词频越高越靠前
  const englishIndex = buildIndex([
    { id: 'once', text: 'capacitor stores charge' },
    { id: 'twice', text: 'capacitor and capacitor stores charge' },
  ]);
  assert.equal(search(englishIndex, 'capacitor')[0].id, 'twice');
});

test('结果结构与分数格式', () => {
  const index = buildIndex(DOCS);
  const results = search(index, '二极管 电容');
  assert.ok(results.length >= 2);
  let previous = Number.POSITIVE_INFINITY;
  for (const result of results) {
    assert.deepEqual(Object.keys(result).sort(), ['id', 'meta', 'score', 'snippet']);
    assert.equal(typeof result.snippet, 'string');
    assert.equal(typeof result.meta, 'object');
    assert.equal(result.score, Math.round(result.score * 10000) / 10000, '分数保留 4 位小数');
    assert.ok(result.score <= previous, '结果必须按分数降序');
    previous = result.score;
  }

  const diode = results.find((r) => r.id === 'diode');
  assert.deepEqual(diode.meta, DOCS[0].meta, 'meta 应当原样透传');

  assert.equal(search(index, '电容', { limit: 1 }).length, 1, 'limit 生效');
});

test('空查询、纯停用词查询返回空数组', () => {
  const index = buildIndex(DOCS);
  assert.deepEqual(search(index, ''), []);
  assert.deepEqual(search(index, '   '), []);
  assert.deepEqual(search(index, '，。！？'), []);
  assert.deepEqual(search(index, undefined), []);
  assert.deepEqual(search(index, '的了和是在', { limit: 5 }), []);
});

test('没有命中时返回空数组', () => {
  const index = buildIndex(DOCS);
  assert.deepEqual(search(index, 'quantum blockchain'), []);
  assert.deepEqual(search(index, 'zzzz-not-there'), []);
  assert.deepEqual(search(buildIndex([]), '二极管'), []);
});

test('snippet：命中词加粗', () => {
  const text = DOCS[0].text;
  const marked = snippet(text, tokenize('二极管 导通'));
  assert.ok(marked.includes('**二极管**'), '应当是完整的粗体词，得到：' + marked);
  assert.ok(marked.includes('**导通**'), '第二个命中词也应当加粗');
  assert.ok(!marked.includes('**二极**'), '2-gram 应当合并成一个粗体段');

  const english = snippet('The Capacitor stores charge.', tokenize('CAPACITOR'));
  assert.ok(english.includes('**Capacitor**'), '英文大小写不敏感且保留原大小写');
});

test('snippet：中文不按空格截断成半句', () => {
  const text = '第一章讲了很多背景知识。第二章开始介绍二极管的工作原理。';
  const marked = snippet(text, ['二极管'], { width: 30 });
  assert.ok(marked.includes('**二极管**'), '窗口必须完整包含命中词');
  assert.ok(marked.startsWith('…第二章'), '起点应当落在句号之后，得到：' + marked);
  assert.ok(marked.endsWith('。'), '终点应当落在句读上，得到：' + marked);

  // 长文本两侧都截断，并且正文是原文的连续片段
  const long = '前言部分。' + '这一段用来填充内容。'.repeat(30) + '二极管在这里出现。' + '后续还有内容。'.repeat(30);
  const mid = snippet(long, ['二极管'], { width: 40 });
  assert.ok(mid.startsWith('…') && mid.endsWith('…'), '两侧截断都要有省略号，得到：' + mid);
  assert.ok(long.includes(stripMarks(mid)), '摘要正文必须是原文的连续片段');
  assert.ok(mid.length < 160, '摘要长度应当受 width 约束，实际 ' + mid.length);
});

test('snippet：没有命中时给出开头', () => {
  const text = '第一章讲了很多背景知识。第二章开始介绍二极管。';
  const head = snippet(text, ['量子'], { width: 12 });
  assert.ok(head.startsWith('第一章'));
  assert.ok(head.endsWith('…'));
  assert.ok(!head.includes('**'), '没有命中就不该有粗体');
  assert.equal(snippet('', ['二极管']), '');
  assert.equal(snippet('短文本', ['长'], { width: 120 }), '短文本', '短文本不做截断');
  assert.equal(snippet('短文本', ['短'], { width: 120 }), '**短**文本', '短文本也可以高亮');
});

test('超长文档（>200k 字符）不崩', () => {
  const huge = '二极管单向导通。' + '填充'.repeat(120000);
  assert.ok(huge.length > 200000, '构造的文档应当超过 200k 字符');

  const index = buildIndex([{ id: 'huge', text: huge }]);
  assert.equal(index.docCount, 1);
  assert.ok(index.lengths[0] > 200000, '文档长度按词数统计');

  const results = search(index, '二极管 导通');
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'huge');
  assert.ok(Number.isFinite(results[0].score) && results[0].score > 0);
  assert.ok(results[0].snippet.includes('**二极管**'));
  assert.ok(results[0].snippet.length < 200, '摘要仍然要短');
});
