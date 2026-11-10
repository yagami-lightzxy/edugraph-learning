/** 记住最近一次显示在原生对话里的会话 id，供学习面板的「AI 导师」嵌入视图使用。 */

const KEY = 'edugraph.chat.session'
const listeners = new Set<() => void>()
let last: string | null = null

try {
  if (typeof localStorage !== 'undefined') last = localStorage.getItem(KEY)
} catch {
  last = null
}

/** 最近一次原生会话 id（没有就返回 null，让嵌入视图自己恢复选择）。 */
export function getChatSessionId(): string | null {
  return last
}

/** 订阅会话 id 变化；返回取消函数。 */
export function subscribeChatSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function remember(sessionId: string) {
  if (!sessionId || sessionId === last) return
  last = sessionId
  try { localStorage.setItem(KEY, sessionId) } catch { /* 隐私模式下忽略 */ }
  for (const listener of listeners) {
    try { listener() } catch { /* 单个订阅者失败不影响其它人 */ }
  }
}

/**
 * 跟踪 DSH 的原生会话：主视图里当前保留的会话变化时记下 id。
 * 学习面板本身是 root 作用域，拿不到 session hook，所以从 sessions 服务读。
 */
export function trackChatSession(ctx: any): void {
  const attach = (scope: any) => {
    const sessions = scope?.sessions ?? scope?.get?.('sessions')
    if (!sessions?.list?.subscribe) return undefined
    const update = () => {
      try {
        const state = sessions.list.getSnapshot()
        const row = Object.values(state?.byId ?? {}).find((item: any) => (item?.retainedBy?.mainView ?? 0) > 0) as any
        if (row?.id) remember(String(row.id))
      } catch { /* 列表还没就绪 */ }
    }
    update()
    return sessions.list.subscribe(update)
  }
  if (typeof ctx?.inject === 'function') {
    try { ctx.inject(['sessions'], attach) } catch { /* 没有 sessions 服务时静默降级 */ }
    return
  }
  try { attach(ctx) } catch { /* ignore */ }
}
