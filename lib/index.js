/**
 * EduGraph AI 学习模式 · DSH 宿主侧插件入口。
 *
 * 挂载三件事：
 *  1. /plugins/edugraph-learning/api —— 学习面板用的本地 HTTP 接口；
 *  2. 一组 Agent 工具（edugraph 系列）—— 让原生对话能读资料、建计划、出题判分；
 *  3. 本地 JSON 存储与后台解析任务。
 *
 * 浏览器侧（学习面板、侧栏入口）在 lib/client.js 里通过 slots 注册，不依赖本文件。
 */
import { createApiHandler } from './api.js'
import { LearningStore, resolveBaseDir } from './store.js'
import { LearningService } from './service.js'
import { createToolDefinitions } from './tools.js'

export const name = 'edugraph-learning'
export const inject = ['webServer', 'tools', 'connection']

const API_PREFIX = '/plugins/edugraph-learning/api'

/** 解析器懒加载：解析模块独立演进，缺失时给出可读错误而不是让插件加载失败。 */
function createLazyParser() {
  let loading = null
  const fallback = {
    async parseDocument({ buffer, filename }) {
      const text = buffer.toString('utf8')
      const isMarkdown = /\.(md|markdown|txt|text)$/i.test(filename)
      if (!isMarkdown) {
        return {
          parser: 'unknown', status: 'failed', title: filename, pages: [], charCount: 0,
          warnings: [], error: '解析模块未加载：目前只支持文本与 Markdown，请检查插件安装是否完整（lib/parse/index.js）。',
        }
      }
      const paragraphs = text.split(/\n{2,}/).map((value) => value.trim()).filter(Boolean)
      return {
        parser: 'text', status: 'parsed', title: filename, charCount: text.length, warnings: [],
        pages: [{ pageNo: 1, blocks: paragraphs.map((value, index) => ({ id: `p${index}`, kind: 'paragraph', text: value, pageNo: 1, order: index })) }],
      }
    },
  }
  return {
    async parseDocument(args) {
      if (!loading) {
        loading = import('./parse/index.js')
          .then((mod) => (typeof mod.parseDocument === 'function' ? mod : fallback))
          .catch(() => fallback)
      }
      const parser = await loading
      return parser.parseDocument(args)
    },
  }
}

/**
 * 插件入口。
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{storageDir?: string}} [config]
 */
export function apply(ctx, config = {}) {
  const baseDir = resolveBaseDir(config?.storageDir ?? '')
  const store = new LearningStore({ baseDir })
  const service = new LearningService({ store, parser: createLazyParser(), config })

  // 预热：尽早建目录、读索引，首个请求不必等初始化。
  ctx.effect(() => {
    void store.init().catch((error) => {
      ctx.logger?.('edugraph-learning')?.warn?.(`存储初始化失败：${error?.message ?? error}`)
    })
    return () => undefined
  }, 'edugraph-learning: storage warmup')

  // 桌面端主页面是 dsh-app://app/，子 frame 直接嵌自定义协议拿不到启动注入；
  // 由宿主给出 HTTP origin + 启动 token，iframe 走这条地址完成鉴权和 boot。
  const webOrigin = () => `${ctx.webServer.protocol}//127.0.0.1:${String(ctx.webServer.port)}`
  const chatOrigin = () => webOrigin()
  const chatFrameUrl = (sessionId = '') => {
    let target = webOrigin() + '/'
    try { target = ctx.connection.authenticatedUrl(target) } catch { /* web profile 可能有 cookie，退回干净地址 */ }
    return target + '#eg-chat-embed' + (sessionId ? '|' + encodeURIComponent(sessionId) : '')
  }

  // HTTP 接口（前缀路由，内部再分派；面板与本地脚本共用）。
  const handler = createApiHandler({
    service, store, config, version: '1.6.0', prefix: API_PREFIX, chatOrigin, chatFrameUrl,
  })
  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: API_PREFIX, handler }),
    'edugraph-learning: learning api',
  )

  // Agent 工具：注入 tools 服务后注册，插件卸载时自动注销。
  try {
    for (const definition of createToolDefinitions({ service, store })) {
      ctx.effect(() => ctx.tools.register(definition), `edugraph-learning: tool ${definition.name}`)
    }
  } catch (error) {
    ctx.logger?.('edugraph-learning')?.warn?.(`工具注册失败：${error?.message ?? error}`)
  }

  return { service, store, baseDir }
}

export { LearningService, LearningStore, createApiHandler }
