/**
 * EduGraph AI · HTTP 接口。
 *
 * 挂在 /plugins/edugraph-learning/api 下，只服务本机界面与本地 Agent。
 * 所有响应都是 JSON（除原文块与上传），错误统一为 { ok:false, error, code }。
 */
import { DomainError } from './store.js'

const MAX_JSON_BODY = 2 * 1024 * 1024
const MAX_UPLOAD_BYTES = 80 * 1024 * 1024

/** 写 JSON 响应。 */
export function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.statusCode = status
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8')
  res.setHeader?.('Cache-Control', 'no-store')
  res.end(body)
}

/** 返回二进制（图片）。 */
export function sendBinary(res, status, buffer, mime) {
  res.statusCode = status
  res.setHeader?.('Content-Type', mime)
  res.setHeader?.('Cache-Control', 'public, max-age=86400')
  res.setHeader?.('Content-Length', String(buffer.length))
  res.end(buffer)
}

/** 读取请求体（带大小上限）。 */
export function readBody(req, limit = MAX_JSON_BODY) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new DomainError(`请求体超过 ${Math.round(limit / 1024 / 1024)}MB 上限`, 413, 'payload-too-large'))
        req.destroy?.()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', (error) => reject(error))
  })
}

async function readJson(req, limit = MAX_JSON_BODY) {
  const buffer = await readBody(req, limit)
  if (!buffer.length) return {}
  try {
    return JSON.parse(buffer.toString('utf8'))
  } catch {
    throw new DomainError('请求体不是合法 JSON', 400, 'invalid-json')
  }
}

/**
 * 创建请求处理函数。
 * @param {{ service: import('./service.js').LearningService, store: import('./store.js').LearningStore, config: object, version: string }} deps
 */
export function createApiHandler({ service, store, config, version = '1.0.0', prefix = '/plugins/edugraph-learning/api', chatOrigin = null, chatFrameUrl = null }) {
  const routes = []
  const route = (method, pattern, handler) => routes.push({ method, pattern, handler })

  // ---------------------------------------------------------------- 基础

  route('GET', /^\/health$/, async () => ({
    ok: true, service: 'edugraph-learning', version, storage: store.baseDir, time: new Date().toISOString(),
  }))

  // 桌面端 dsh-app:// 子 frame 的 HTTP 入口：origin 给父页面校验消息，frame 302 到带启动 token 的地址。
  route('GET', /^\/chat-info$/, async () => ({
    ok: true, origin: typeof chatOrigin === 'function' ? String(chatOrigin()) : '',
  }))
  route('GET', /^\/chat-frame$/, async (ctx) => {
    const session = ctx.url.searchParams.get('session') || ''
    const target = typeof chatFrameUrl === 'function' ? chatFrameUrl(session) : ''
    if (!target) throw new DomainError('聊天嵌入地址不可用', 500, 'chat-frame-unavailable')
    ctx.res.writeHead?.(302, {
      Location: target,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    })
    ctx.res.end?.()
    return null
  })

  // ---------------------------------------------------------------- 课程

  route('GET', /^\/courses$/, async () => {
    const { courses, lastCourseId } = await service.listCourses()
    return { ok: true, courses, lastCourseId, profile: await store.getProfile() }
  })

  route('POST', /^\/courses$/, async (ctx) => {
    const body = await readJson(ctx.req)
    const bundle = await service.createCourse({
      name: body.name, subject: body.subject ?? '', goal: body.goal ?? '', tags: body.tags ?? [],
    })
    await store.saveState({ activeCourseId: bundle.course.id })
    return { ok: true, ...bundle }
  })

  route('GET', /^\/courses\/([^/]+)$/, async (ctx) => ({ ok: true, ...(await service.bundle(ctx.params[0])) }))

  route('PATCH', /^\/courses\/([^/]+)$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return { ok: true, ...(await service.updateCourse(ctx.params[0], body)) }
  })

  route('DELETE', /^\/courses\/([^/]+)$/, async (ctx) => ({ ok: true, ...(await service.deleteCourse(ctx.params[0])) }))

  route('GET', /^\/courses\/([^/]+)\/overview$/, async (ctx) => ({ ok: true, ...(await service.overview(ctx.params[0])) }))
  route('GET', /^\/courses\/([^/]+)\/graph$/, async (ctx) => ({ ok: true, ...(await service.graph(ctx.params[0])) }))
  route('GET', /^\/courses\/([^/]+)\/outline$/, async (ctx) => ({ ok: true, ...(await service.outline(ctx.params[0])) }))

  // ---------------------------------------------------------------- 资料

  route('GET', /^\/courses\/([^/]+)\/documents$/, async (ctx) => ({ ok: true, ...(await service.listDocuments(ctx.params[0])) }))

  route('POST', /^\/courses\/([^/]+)\/documents$/, async (ctx) => {
    const filename = ctx.url.searchParams.get('filename') || ctx.req.headers['x-filename'] || 'document'
    const mimeType = ctx.req.headers['content-type'] || ''
    const buffer = await readBody(ctx.req, MAX_UPLOAD_BYTES)
    if (!buffer.length) throw new DomainError('上传内容为空', 400, 'empty-upload')
    const result = await service.ingestDocument({
      courseId: ctx.params[0], filename: decodeURIComponent(String(filename)), buffer, mimeType,
    })
    return { ok: true, ...result }
  })

  route('DELETE', /^\/courses\/([^/]+)\/documents\/([^/]+)$/, async (ctx) => ({
    ok: true, ...(await service.deleteDocument(ctx.params[0], ctx.params[1])),
  }))

  route('GET', /^\/courses\/([^/]+)\/documents\/([^/]+)\/pages\/(\d+)\/image$/, async (ctx) => {
    const { readFile } = await import('node:fs/promises')
    const figure = await service.pageImage(ctx.params[0], ctx.params[1], Number(ctx.params[2]))
    const buffer = await readFile(figure.file)
    sendBinary(ctx.res, 200, buffer, figure.mime)
    return null
  })

  route('GET', /^\/courses\/([^/]+)\/documents\/([^/]+)\/media$/, async (ctx) => ({
    ok: true, ...(await service.documentMedia(ctx.params[0], ctx.params[1])),
  }))

  route('GET', /^\/courses\/([^/]+)\/documents\/([^/]+)\/media\/(\d+)$/, async (ctx) => {
    const item = await service.mediaItem(ctx.params[0], ctx.params[1], Number(ctx.params[2]))
    sendBinary(ctx.res, 200, item.bytes, item.mime)
    return null
  })

  route('GET', /^\/courses\/([^/]+)\/documents\/([^/]+)\/pages$/, async (ctx) => {
    const from = Number(ctx.url.searchParams.get('from') || 1)
    const count = Number(ctx.url.searchParams.get('count') || 3)
    return { ok: true, ...(await service.readDocumentPage(ctx.params[0], ctx.params[1], { from, count })) }
  })

  route('POST', /^\/courses\/([^/]+)\/analyze$/, async (ctx) => ({
    ok: true, ...(await service.reanalyze(ctx.params[0], { reason: 'manual' })),
  }))

  // ---------------------------------------------------------------- 外部 AI 课程包

  route('GET', /^\/courses\/([^/]+)\/pack$/, async (ctx) => ({ ok: true, ...(await service.exportPack(ctx.params[0])) }))

  route('POST', /^\/courses\/([^/]+)\/pack\/preview$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return {
      ok: true,
      ...(await service.previewPack(ctx.params[0], body.pack ?? body, { overwriteDefinitions: Boolean(body.overwriteDefinitions) })),
    }
  })

  route('POST', /^\/courses\/([^/]+)\/pack$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return {
      ok: true,
      ...(await service.importPack(ctx.params[0], body.pack ?? body, { overwriteDefinitions: Boolean(body.overwriteDefinitions) })),
    }
  })

  // ---------------------------------------------------------------- 计划

  route('GET', /^\/courses\/([^/]+)\/plan$/, async (ctx) => ({ ok: true, ...(await service.plan(ctx.params[0])) }))

  route('POST', /^\/courses\/([^/]+)\/plan\/generate$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return { ok: true, ...(await service.generatePlan(ctx.params[0], body)) }
  })

  route('PATCH', /^\/courses\/([^/]+)\/plan\/tasks\/([^/]+)$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return { ok: true, ...(await service.updateTask(ctx.params[0], ctx.params[1], body)) }
  })

  // ---------------------------------------------------------------- 教学 / 练习

  route('GET', /^\/courses\/([^/]+)\/lesson$/, async (ctx) => {
    const taskId = ctx.url.searchParams.get('taskId') || ''
    return { ok: true, ...(await service.lesson(ctx.params[0], taskId)) }
  })

  route('POST', /^\/courses\/([^/]+)\/quiz$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return { ok: true, ...(await service.createQuiz(ctx.params[0], body)) }
  })

  route('POST', /^\/courses\/([^/]+)\/quiz\/answer$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return { ok: true, ...(await service.answerQuestion(ctx.params[0], body)) }
  })

  route('GET', /^\/courses\/([^/]+)\/mistakes$/, async (ctx) => ({ ok: true, ...(await service.mistakes(ctx.params[0])) }))
  route('GET', /^\/courses\/([^/]+)\/reviews$/, async (ctx) => ({ ok: true, ...(await service.reviews(ctx.params[0])) }))

  route('POST', /^\/courses\/([^/]+)\/reviews\/([^/]+)\/grade$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return { ok: true, ...(await service.gradeReview(ctx.params[0], ctx.params[1], body.rating)) }
  })

  // ---------------------------------------------------------------- 检索 / 事件

  route('GET', /^\/courses\/([^/]+)\/search$/, async (ctx) => {
    const query = ctx.url.searchParams.get('q') || ''
    const limit = Number(ctx.url.searchParams.get('limit') || 12)
    return { ok: true, ...(await service.search(ctx.params[0], query, { limit })) }
  })

  route('POST', /^\/courses\/([^/]+)\/events$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return { ok: true, ...(await service.recordEvent(ctx.params[0], body)) }
  })

  // ---------------------------------------------------------------- 档案 / 状态

  route('GET', /^\/profile$/, async () => ({ ok: true, profile: await store.getProfile() }))
  route('PUT', /^\/profile$/, async (ctx) => {
    const body = await readJson(ctx.req)
    return { ok: true, profile: await store.saveProfile(body) }
  })

  route('GET', /^\/state$/, async () => ({ ok: true, state: await store.getState() }))
  route('PUT', /^\/state$/, async (ctx) => {
    const body = await readJson(ctx.req)
    const allowed = ['enabled', 'activeCourseId', 'activeView', 'activeTaskId', 'pendingQuestionId', 'lastQuestionIds']
    const patch = {}
    for (const key of allowed) if (body[key] !== undefined) patch[key] = body[key]
    return { ok: true, state: await store.saveState(patch) }
  })

  // ---------------------------------------------------------------- 分发

  return async function handleApi(req, res) {
    const url = new URL(req.url ?? '/', 'http://dsh.local')
    let pathname = url.pathname
    if (!pathname.startsWith(prefix)) {
      sendJson(res, 404, { ok: false, error: 'not-found', code: 'not-found' })
      return
    }
    pathname = pathname.slice(prefix.length) || '/'
    const method = (req.method ?? 'GET').toUpperCase()
    try {
      for (const entry of routes) {
        if (entry.method !== method) continue
        const match = entry.pattern.exec(pathname)
        if (!match) continue
        const params = match.slice(1).map((value) => decodeURIComponent(value))
        const payload = await entry.handler({ req, res, url, params })
        // 二进制路由自己写响应，返回 null 表示"已发送"。
        if (payload === null) return
        sendJson(res, payload?.status ?? 200, payload)
        return
      }
      sendJson(res, 404, { ok: false, error: `未实现的接口：${method} ${pathname}`, code: 'not-found' })
    } catch (error) {
      if (error instanceof DomainError) {
        sendJson(res, error.status, { ok: false, error: error.message, code: error.code })
        return
      }
      sendJson(res, 500, { ok: false, error: String(error?.message ?? error), code: 'internal-error' })
    }
  }
}
