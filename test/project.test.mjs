import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { copyFile, lstat, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { LearningStore } from '../lib/store.js'
import { ensureProject, safeSegment } from '../lib/project.js'

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'edugraph-project-'))
  const store = new LearningStore({ baseDir: path.join(root, 'storage') })
  await store.init()
  return { root, store, workspace: path.join(root, 'workspace') }
}

async function addDoc(store, courseId, name, originalName) {
  await mkdir(store.documentsDir(courseId), { recursive: true })
  await writeFile(path.join(store.documentsDir(courseId), name), 'fake-pdf-content')
  const { meta } = await store.mutateCourse(courseId, (draft) => {
    draft.documents.push({
      id: 'd-' + name,
      storedName: name,
      originalName,
      kind: 'pdf',
      pages: 3,
      size: 16,
      uploadedAt: new Date().toISOString(),
    })
  })
  return meta
}

test('safeSegment strips path separators and trailing dots', () => {
  assert.equal(safeSegment('模拟/电子:技术*?'), '模拟 电子 技术')
  assert.equal(safeSegment('   ...   '), '课程')
})

test('ensureProject creates a course workspace and shares materials via a link', async () => {
  const { root, store, workspace } = await fixture()
  try {
    const meta = await store.createCourse({ name: '模拟电子技术', subject: '电子工程', goal: '掌握二极管' })
    await addDoc(store, meta.course.id, 'd1.pdf', '第一章 半导体.pdf')
    await addDoc(store, meta.course.id, 'd2.pdf', '第一章 半导体.pdf')

    const project = await ensureProject(store, meta.course.id, workspace)
    assert.equal(project.path, path.join(workspace, 'EduGraph', 'EduGraph - 模拟电子技术'))
    assert.equal(project.materials, 2)
    assert.equal(project.files[0].name, '第一章 半导体.pdf')
    assert.equal(project.files[1].name, '第一章 半导体 (2).pdf')
    assert.equal(await readFile(path.join(project.path, 'materials', '第一章 半导体.pdf'), 'utf8'), 'fake-pdf-content')

    const link = await lstat(path.join(project.path, 'materials'))
    assert.equal(link.isSymbolicLink(), true)
    assert.equal(project.materialsMode, 'link')
    assert.equal(await readFile(path.join(store.documentsDir(meta.course.id), '第一章 半导体.pdf'), 'utf8'), 'fake-pdf-content')

    const manifest = JSON.parse(await readFile(path.join(project.path, 'project.json'), 'utf8'))
    assert.equal(manifest.course.id, meta.course.id)
    assert.equal(manifest.counts.documents, 2)
    const readme = await readFile(path.join(project.path, 'README.md'), 'utf8')
    assert.match(readme, /模拟电子技术/)
    assert.match(readme, /materials/)

    const again = await ensureProject(store, meta.course.id, path.join(root, 'other-workspace'))
    assert.equal(again.path, project.path, 'existing project path wins over a new base')
    const saved = await store.getCourse(meta.course.id)
    assert.equal(saved.project.path, project.path)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('same course name gets a distinct project folder', async () => {
  const { root, store, workspace } = await fixture()
  try {
    const a = await store.createCourse({ name: '同一门课' })
    const b = await store.createCourse({ name: '同一门课' })
    const pa = await ensureProject(store, a.course.id, workspace)
    const pb = await ensureProject(store, b.course.id, workspace)
    assert.notEqual(pa.path, pb.path)
    assert.match(path.basename(pb.path), /同一门课/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('ensureProject migrates an old real materials copy into the shared link', async () => {
  const { root, store, workspace } = await fixture()
  try {
    const meta = await store.createCourse({ name: '迁移课程' })
    await addDoc(store, meta.course.id, 'd1.pdf', '讲义.pdf')
    const projectPath = path.join(workspace, 'EduGraph', 'EduGraph - 迁移课程')
    await mkdir(path.join(projectPath, 'materials'), { recursive: true })
    await copyFile(path.join(store.documentsDir(meta.course.id), 'd1.pdf'), path.join(projectPath, 'materials', '讲义.pdf'))
    await store.mutateCourse(meta.course.id, (draft) => {
      draft.project = { path: projectPath, title: 'EduGraph · 迁移课程', createdAt: new Date().toISOString() }
    })

    const project = await ensureProject(store, meta.course.id, workspace)
    assert.equal(project.materialsMode, 'link')
    assert.equal((await lstat(path.join(project.path, 'materials'))).isSymbolicLink(), true)
    assert.equal(await readFile(path.join(project.path, 'materials', '讲义.pdf'), 'utf8'), 'fake-pdf-content')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('ensureProject requires a workspace path', async () => {
  const { root, store } = await fixture()
  try {
    const meta = await store.createCourse({ name: '课' })
    await assert.rejects(() => ensureProject(store, meta.course.id, ''), /缺少工作区路径/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
