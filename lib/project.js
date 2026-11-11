/**
 * 课程项目：每门课在当前 DSH 工作区生成一个可独立打开的文件夹。
 *
 * 资料只保留一份：插件的 documents 目录是唯一源，项目里的 materials/ 是一个
 * Windows 目录 junction（其他平台为目录 symlink）指回它。项目看起来有完整资料，
 * 删除项目只会移除链接，不会删插件里的原件。junction 不可用时退回复制。
 */
import path from 'node:path'
import { existsSync } from 'node:fs'
import { copyFile, lstat, mkdir, readFile, realpath, rename, rm, stat, symlink, unlink, writeFile } from 'node:fs/promises'
import { DomainError } from './store.js'

const PROJECT_ROOT = 'EduGraph'
const MANIFEST = 'project.json'
const MATERIALS = 'materials'
const LINK_TYPE = process.platform === 'win32' ? 'junction' : 'dir'

/** Windows/POSIX 文件名都安全的单段名称。 */
export function safeSegment(value, fallback = '课程') {
  const text = String(value ?? '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
  return (text || fallback).slice(0, 80)
}

/** 保留扩展名的安全文件名；没有扩展名时补 .bin。 */
export function safeFileName(value, fallback = 'document') {
  const base = path.basename(String(value ?? ''))
  const safe = safeSegment(base, fallback)
  return /\.[A-Za-z0-9]{1,8}$/.test(safe) ? safe : safe + '.bin'
}

function samePath(a, b) {
  return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase()
}

async function infoOf(target) {
  try { return await lstat(target) } catch { return null }
}

async function removePath(target) {
  const info = await infoOf(target)
  if (!info) return
  if (info.isSymbolicLink()) {
    // junction/symlink 只删链接本身，绝不递归目标目录。
    await rm(target, { force: true })
    return
  }
  await rm(target, { recursive: true, force: true })
}

/**
 * 把 link 变成指向 target 的目录链接。已指向 target 就复用；否则删掉旧链接。
 * 返回 false 表示当前系统不允许链接，调用方退回复制。
 */
async function ensureMaterialsLink(target, link) {
  const info = await infoOf(link)
  if (info?.isSymbolicLink()) {
    const real = await realpath(link).catch(() => '')
    if (real && samePath(real, target)) return true
    await removePath(link)
  } else if (info) {
    await removePath(link)
  }
  await mkdir(path.dirname(link), { recursive: true })
  try {
    await symlink(path.resolve(target), link, LINK_TYPE)
    return true
  } catch (error) {
    console.warn('[edugraph] project materials link unavailable, falling back to copy', error?.message ?? error)
    return false
  }
}

async function uniqueDocName(docsDir, value, sourcePath) {
  const base = safeFileName(value)
  const ext = path.extname(base)
  const stem = ext ? base.slice(0, -ext.length) : base
  let candidate = base
  let index = 2
  while (existsSync(path.join(docsDir, candidate)) && !samePath(path.join(docsDir, candidate), sourcePath)) {
    candidate = `${stem} (${index})${ext}`
    index += 1
  }
  return candidate
}

/**
 * 把某份资料收进插件 documents 目录，并使用可读的原始文件名。
 * 项目旧版里已有的副本可以作为回退来源；成功后再删副本，避免一份资料两份字节。
 */
async function ensureDocFile(store, courseId, doc, projectMaterials) {
  const docsDir = store.documentsDir(courseId)
  await mkdir(docsDir, { recursive: true })
  const candidates = []
  if (doc.storedName) candidates.push(path.join(docsDir, doc.storedName))
  if (doc.filename) candidates.push(path.join(projectMaterials, safeFileName(doc.filename)))
  if (doc.originalName) candidates.push(path.join(projectMaterials, safeFileName(doc.originalName)))
  const source = candidates.find((candidate) => existsSync(candidate))
  if (!source) return false

  const name = await uniqueDocName(docsDir, doc.filename || doc.originalName || doc.storedName, source)
  const target = path.join(docsDir, name)
  if (!samePath(source, target)) {
    if (path.dirname(path.resolve(source)) === path.resolve(docsDir)) {
      await rename(source, target)
    } else {
      // 项目可能在另一个盘；先复制到插件目录，再删项目里的旧副本。
      await copyFile(source, target)
      await unlink(source).catch(() => undefined)
    }
  }
  doc.storedName = name
  return true
}

async function readManifest(folder) {
  try { return JSON.parse(await readFile(path.join(folder, MANIFEST), 'utf8')) } catch { return null }
}

/**
 * 确保课程项目存在：优先沿用课程 meta 里已经记录的路径；首次在 basePath 下创建。
 * 项目 materials/ 指向插件 documents/（不复制）；只有链接不可用时才复制。
 */
export async function ensureProject(store, courseId, basePath) {
  const meta = await store.getCourse(courseId)
  const course = meta.course
  const base = String(basePath ?? '').trim()
  if (!base) throw new DomainError('缺少工作区路径', 400, 'missing-workspace')
  const resolvedBase = path.resolve(base)
  try {
    const info = await stat(resolvedBase)
    if (!info.isDirectory()) throw new Error('not a directory')
  } catch {
    await mkdir(resolvedBase, { recursive: true })
  }

  let project = meta.project
  if (!project?.path || !existsSync(project.path)) {
    const root = path.join(resolvedBase, PROJECT_ROOT)
    await mkdir(root, { recursive: true })
    const baseName = safeSegment(course.name)
    let folderName = `${PROJECT_ROOT} - ${baseName}`
    let folder = path.join(root, folderName)
    const manifest = await readManifest(folder)
    if (existsSync(folder) && manifest?.course?.id !== course.id) {
      folderName = `${PROJECT_ROOT} - ${baseName} (${String(course.id).slice(-6)})`
      folder = path.join(root, folderName)
    }
    project = {
      path: folder,
      title: `${PROJECT_ROOT} · ${course.name}`,
      createdAt: new Date().toISOString(),
    }
  }

  const projectPath = project.path
  const projectMaterials = path.join(projectPath, MATERIALS)
  const materialsInfo = await infoOf(projectMaterials)
  const oldCopyDir = materialsInfo && !materialsInfo.isSymbolicLink() ? projectMaterials : null

  // 1) 资料统一收进插件 documents/，文件名用原始可读名。
  const renamed = new Map()
  for (const doc of meta.documents ?? []) {
    const ok = await ensureDocFile(store, courseId, doc, oldCopyDir ?? projectMaterials)
    if (ok) renamed.set(doc.id, doc.storedName)
  }

  // 2) 项目 materials/ 变成指向插件 documents/ 的链接；旧的复制目录先移除。
  if (oldCopyDir) await removePath(oldCopyDir)
  let materialsMode = 'link'
  const linked = await ensureMaterialsLink(store.documentsDir(courseId), projectMaterials)
  if (!linked) {
    materialsMode = 'copy'
    await mkdir(projectMaterials, { recursive: true })
    for (const doc of meta.documents ?? []) {
      const source = path.join(store.documentsDir(courseId), doc.storedName || '')
      if (!existsSync(source)) continue
      await copyFile(source, path.join(projectMaterials, safeFileName(doc.filename || doc.originalName || doc.storedName)))
    }
  }

  const now = new Date().toISOString()
  const files = []
  for (const doc of meta.documents ?? []) {
    if (!doc.storedName) continue
    const source = path.join(store.documentsDir(courseId), doc.storedName)
    if (!existsSync(source)) continue
    files.push({
      name: materialsMode === 'link' ? doc.storedName : safeFileName(doc.filename || doc.originalName || doc.storedName),
      originalName: doc.filename || doc.originalName || doc.storedName,
      kind: doc.kind ?? '',
      pages: doc.pages ?? null,
      size: doc.size ?? null,
    })
  }

  const projectView = {
    path: projectPath,
    title: project.title,
    createdAt: project.createdAt ?? now,
    updatedAt: now,
    materials: files.length,
    materialsMode,
    files,
  }
  const manifest = {
    version: 2,
    app: 'edugraph-learning',
    materialsMode,
    course: {
      id: course.id,
      name: course.name,
      subject: course.subject ?? '',
      goal: course.goal ?? '',
    },
    counts: {
      documents: meta.documents?.length ?? 0,
      chapters: meta.chapters?.length ?? 0,
      concepts: meta.concepts?.length ?? 0,
      questions: meta.questions?.length ?? 0,
    },
    files,
    updatedAt: now,
  }
  await writeFile(path.join(projectPath, MANIFEST), JSON.stringify(manifest, null, 2), 'utf8')
  const readme = [
    `# ${course.name}`,
    '',
    materialsMode === 'link'
      ? '由 EduGraph AI 自动建立。课程资料在 materials/ 里，通过目录链接共享，不会在项目里再存一份；学习数据仍在 DSH 插件存储里。'
      : '由 EduGraph AI 自动建立。当前系统不支持目录链接，课程资料是插件存储的副本。',
    '',
    `- 学科：${course.subject || '未填写'}`,
    `- 目标：${course.goal || '未填写'}`,
    `- 资料：${files.length} 个`,
    `- 概念：${meta.concepts?.length ?? 0} 个`,
    '',
    '导师会话在这个工作区里运行；需要重新同步资料时，从学习面板再点一次课程项目即可。',
    '',
  ].join('\n')
  await writeFile(path.join(projectPath, 'README.md'), readme, 'utf8')

  await store.mutateCourse(courseId, (draft) => {
    for (const doc of draft.documents ?? []) {
      const next = renamed.get(doc.id)
      if (next) doc.storedName = next
    }
    draft.project = {
      path: projectPath,
      title: project.title,
      createdAt: project.createdAt ?? now,
      updatedAt: now,
    }
  })
  return projectView
}
