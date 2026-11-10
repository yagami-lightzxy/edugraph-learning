import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PACK_FORMAT, PACK_VERSION, buildPackPrompt, exportCoursePack, mergePack, normalizePack, packStats,
} from '../lib/pack.js'

const fence = String.fromCharCode(96).repeat(3)

function meta() {
  return {
    course: { id: 'c1', name: '模拟电子技术', subject: '电子工程', goal: '掌握二极管' },
    profile: { examDate: '2026-12-20', dailyMinutes: 45, level: 'beginner' },
    chapters: [{ id: 'ch1', title: '第一章', summary: '', order: 1, conceptIds: ['k1'] }],
    concepts: [{
      id: 'k1', name: '半导体', key: '半导体', definition: '导电能力介于导体与绝缘体之间', chapterId: 'ch1',
      sourceRefs: [{ documentId: 'd1', pageNo: 1, blockId: 'b1', quote: '半导体是导电能力介于导体与绝缘体之间的材料。' }], tags: [],
    }],
    relations: [], questions: [], plan: null,
  }
}

const valid = {
  format: PACK_FORMAT,
  version: PACK_VERSION,
  course: { id: 'c1', name: '模拟电子技术' },
  chapters: [{
    title: '第二章',
    summary: 'PN 结',
    concepts: [
      { name: 'PN结', definition: 'P 型与 N 型半导体接触形成的结' },
      { name: '半导体', definition: '外部模型重写的定义' },
    ],
  }],
  questions: [
    { conceptName: 'PN结', type: 'choice', stem: 'PN 结由什么接触形成？', options: ['P 型与 N 型半导体', '两种金属'], answer: 'A', explanation: 'P 型与 N 型接触。' },
    { conceptName: 'PN结', type: 'judge', stem: 'PN 结有内建电场。', answer: '正确' },
    { conceptName: 'PN结', type: 'choice-reverse', stem: '“P 型与 N 型接触形成的结”说的是？', options: ['PN结', '二极管'], answer: 'PN结' },
  ],
  relations: [{ from: '半导体', to: 'PN结', type: 'prerequisite', weight: 0.8 }],
}

test('exportCoursePack keeps course content but not personal attempts', () => {
  const source = meta()
  source.attempts = [{ id: 'a1', score: 0.5 }]
  source.reviews = [{ conceptId: 'k1', due: 1 }]
  const pack = exportCoursePack(source)
  assert.equal(pack.format, PACK_FORMAT)
  assert.equal(pack.course.id, 'c1')
  assert.equal(pack.chapters[0].concepts[0].name, '半导体')
  assert.equal(pack.attempts, undefined)
  assert.equal(pack.reviews, undefined)
  assert.equal(pack.plan, null)
  assert.deepEqual(packStats(pack).concepts, 1)
})

test('normalizePack accepts fenced JSON and canonicalizes answers', () => {
  const normalized = normalizePack(String.fromCharCode(0xFEFF) + fence + 'json\n' + JSON.stringify(valid) + '\n' + fence)
  assert.equal(normalized.chapters.length, 1)
  assert.equal(normalized.concepts.length, 2)
  assert.equal(normalized.questions.length, 3)
  assert.equal(normalized.questions[0].answer, '0')
  assert.equal(normalized.questions[1].answer, '0')
  assert.equal(normalized.questions[2].answer, '0')
  assert.equal(normalized.relations.length, 1)
})

test('normalizePack rejects a wrong format and bad JSON', () => {
  assert.throws(() => normalizePack({ format: 'other', version: 1, chapters: [{ title: 'x', concepts: [{ name: 'a' }] }] }), /format/)
  assert.throws(() => normalizePack('{oops'), /不是合法 JSON/)
})

test('mergePack adds new chapter/concept/question/relation and skips duplicate question', () => {
  const source = meta()
  const normalized = normalizePack(valid)
  const result = mergePack(source, normalized, { overwriteDefinitions: false })
  assert.equal(result.counts.chaptersAdded, 1)
  assert.equal(result.counts.conceptsAdded, 1)
  assert.equal(result.counts.conceptsUpdated, 0)
  assert.equal(result.counts.questionsAdded, 3)
  assert.equal(result.counts.relationsAdded, 1)
  assert.equal(source.concepts.find((c) => c.name === '半导体').definition, '导电能力介于导体与绝缘体之间')
  const again = mergePack(source, normalized, { overwriteDefinitions: false })
  assert.equal(again.counts.questionsAdded, 0)
  assert.equal(again.counts.questionsSkipped, 3)
})

test('overwriteDefinitions updates an existing definition only when asked', () => {
  const source = meta()
  const normalized = normalizePack(valid)
  const quiet = mergePack(source, normalized, { overwriteDefinitions: false })
  assert.equal(quiet.counts.conceptsUpdated, 0)
  assert.equal(source.concepts.find((c) => c.name === '半导体').definition, '导电能力介于导体与绝缘体之间')
  const loud = mergePack(source, normalized, { overwriteDefinitions: true })
  assert.equal(loud.counts.conceptsUpdated, 1)
  assert.equal(source.concepts.find((c) => c.name === '半导体').definition, '外部模型重写的定义')
})

test('questions-only pack resolves concepts already in the course', () => {
  const source = meta()
  const normalized = normalizePack({
    format: PACK_FORMAT,
    version: PACK_VERSION,
    questions: [{ conceptName: '半导体', type: 'cloze', stem: '填空：导电能力介于导体与____之间。', answer: '绝缘体' }],
  })
  assert.equal(normalized.concepts.length, 0)
  const result = mergePack(source, normalized)
  assert.equal(result.counts.questionsAdded, 1)
  assert.equal(source.questions[0].origin, 'external-ai')
})

test('bad choice answer and unknown concept are surfaced as skips', () => {
  const normalized = normalizePack({
    format: PACK_FORMAT,
    version: PACK_VERSION,
    chapters: [{ title: '第一章', concepts: [{ name: '半导体' }] }],
    questions: [
      { conceptName: '半导体', type: 'choice', stem: '选项越界', options: ['A', 'B'], answer: 9 },
      { conceptName: '不存在的概念', type: 'short', stem: '这道题没有对应概念', answer: '答案' },
    ],
  })
  assert.equal(normalized.questions.length, 1)
  assert.ok(normalized.warnings.some((line) => line.includes('答案不在选项里')))
})

test('buildPackPrompt includes the schema and current pack', () => {
  const prompt = buildPackPrompt(exportCoursePack(meta()))
  assert.match(prompt, /edugraph-course-pack/)
  assert.match(prompt, /只输出 JSON/)
  assert.match(prompt, /当前课程包/)
  assert.match(prompt, /半导体/)
})
