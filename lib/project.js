/**
 * 课程项目：每门课在用户当前 DSH 工作区下生成一个可独立打开的文件夹，
 * 并把插件里的原始资料复制进项目的 materials/。项目同时作为导师会话的工作区。
 */
import path from 'node:path'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { DomainError } from './store.js'

const PROJECT_ROOT = 'EduGraph'
const MANIFEST = 'project.json'
const MATERIALS = 'materials'

/** Windows/POSIX 文件名都安全的单段名称。 */
export function safeSegment(value, fallback = '课程') {
  const text = String(value ?? '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
  return (text || fallback).slice(0, 80)
}

function safeFileName(value, fallback = 'document') {
  const base = path.basename(String(value ?? ''))
  const safe = safeSegment(base, fallback)
  return /\.[A-Za-z0-9]{1,8}$/.test(safe) ? safe : safe + '.bin'
}

function uniqueName(used, name) {
  if (!used.has(name)) { used.add(name); return name }
  const ext = path.extname(name)
  const stem = ext ? name.slice(0, -ext.length) : name
  let index = 2
  while (used.has(`${stem} (${index})${ext}`)) index += 1
  const next = `${stem} (${index})${ext}`
  used.add(next)
  return next
}

async function readManifest(folder) {
  try { return JSON.parse(await readFile(path.join(folder, MANIFEST), 'utf8')) } catch { return null }
}

/**
 * 确保课程项目存在：优先沿用课程 meta 里已经记录的路径；首次在 basePath 下创建。
 * 已存在的资料会被更新，不删除用户后来放进项目的其它文件。
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
  const materialsDir = path.join(projectPath, MATERIALS)
  // materials/ 由插件管理；重新同步时清掉旧文件，避免改名后留下重复副本。
  await rm(materialsDir, { recursive: true, force: true })
  await mkdir(materialsDir, { recursive: true })
  const used = new Set()
  const files = []
  for (const doc of meta.documents ?? []) {
    const source = path.join(store.documentsDir(courseId), doc.storedName)
    if (!existsSync(source)) continue
    const originalName = doc.filename || doc.originalName || doc.storedName
    const name = uniqueName(used, safeFileName(originalName))
    await copyFile(source, path.join(materialsDir, name))
    files.push({
      name,
      originalName,
      kind: doc.kind ?? '',
      pages: doc.pages ?? null,
      size: doc.size ?? null,
    })
  }

  const now = new Date().toISOString()
  const projectView = {
    path: projectPath,
    title: project.title,
    createdAt: project.createdAt ?? now,
    updatedAt: now,
    materials: files.length,
    files,
  }
  const manifest = {
    version: 1,
    app: 'edugraph-learning',
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
    `由 EduGraph AI 自动建立。课程资料放在 ${MATERIALS}/ 目录，学习数据仍在 DSH 插件存储里。`,
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
    draft.project = {
      path: projectPath,
      title: project.title,
      createdAt: project.createdAt ?? now,
      updatedAt: now,
    }
  })
  return projectView
}
