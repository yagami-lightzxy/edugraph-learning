/**
 * 面板内对话：把 DSH 原生会话以同源 iframe 嵌进学习面板。
 *
 * 这样模型、工具权限、历史、队列、附件、审批弹窗全部是原生的，不需要在插件里
 * 重写一遍聊天。iframe 里的插件实例只做四件事：注入紧凑样式、强制显示对话、
 * 打开父面板当前所在的会话、接收「问导师」的上下文提问；它不注册学习面板，避免递归。
 */

export const EMBED_HASH = 'eg-chat-embed'
const STYLE_ID = 'edugraph-chat-embed-style'

export function isEmbedMode(): boolean {
  return readHash().embed
}

/**
 * 右侧对话 iframe 的地址。
 *
 * 不直接嵌当前页面：桌面端主页面是 dsh-app://app/，子 frame 拿到的是自定义协议，
 * 启动注入和鉴权都不会跟进去。这里先走插件宿主的 /chat-frame，由宿主 302 到
 * 带启动 token 的 HTTP 地址，再带 hash 进入嵌入模式。
 */
export function chatFrameUrl(sessionId?: string | null): string {
  const session = sessionId ? '?session=' + encodeURIComponent(sessionId) : ''
  return '/plugins/edugraph-learning/api/chat-frame' + session
}

function readHash(): { embed: boolean; sessionId: string | null } {
  if (typeof window === 'undefined' || !window.location) return { embed: false, sessionId: null }
  const hash = String(window.location.hash || '').replace(/^#/, '')
  if (!hash.startsWith(EMBED_HASH)) return { embed: false, sessionId: null }
  const rest = hash.slice(EMBED_HASH.length).replace(/^\|/, '')
  let sessionId: string | null = null
  if (rest) {
    try { sessionId = decodeURIComponent(rest) } catch { sessionId = rest }
  }
  return { embed: true, sessionId }
}

const EMBED_CSS = `
html[data-edugraph-embed] {
  --dsh-windows-titlebar-height: 0px !important;
  --dsh-frame-top-clearance: 0px !important;
  --dsh-windows-content-radius: 0px !important;
}
html[data-edugraph-embed] body { background: transparent !important; }
html[data-edugraph-embed] .mP3x-q_frame {
  grid-template-columns: 0 minmax(0, 1fr) 0 !important;
  padding-top: 0 !important;
  border-radius: 0 !important;
}
html[data-edugraph-embed] .mP3x-q_frame::before,
html[data-edugraph-embed] .mP3x-q_sidebarCol,
html[data-edugraph-embed] .mP3x-q_bottomRow,
html[data-edugraph-embed] [data-shell-bottom],
html[data-edugraph-embed] [data-shell-leading],
html[data-edugraph-embed] [data-sidebar-mask] { display: none !important; }
html[data-edugraph-embed] header[data-window-drag] { display: none !important; }
html[data-edugraph-embed] .mP3x-q_centerCol,
html[data-edugraph-embed] .mP3x-q_mainPanel {
  border-radius: 0 !important;
  background: var(--dsw-alias-bg-base) !important;
}
html[data-edugraph-embed] .an3WzG_composerStack { padding-bottom: 2px !important; }
html[data-edugraph-embed] ::-webkit-scrollbar { width: 8px; height: 8px; }
html[data-edugraph-embed] ::-webkit-scrollbar-track { background: transparent; }
html[data-edugraph-embed] ::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsw-alias-label-tertiary) 28%, transparent);
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: content-box;
}
html[data-edugraph-embed] ::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-tertiary) 45%, transparent);
}
`

function installStyle() {
  try {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = EMBED_CSS
    document.head.append(style)
  } catch { /* ignore */ }
}

function announceReady() {
  try {
    if (window.parent === window) return
    let tries = 0
    const tick = () => {
      tries += 1
      const composer = document.querySelector('[data-composer-input="true"]')
      if (composer || tries > 80) {
        try { window.parent.postMessage({ type: 'edugraph:chat-ready' }, '*') } catch { /* ignore */ }
        return
      }
      window.setTimeout(tick, 250)
    }
    window.setTimeout(tick, 300)
  } catch { /* ignore */ }
}

function openRequestedSession(ctx: any, sessionId: string | null) {
  if (!sessionId) return
  let tries = 0
  const tick = () => {
    tries += 1
    try {
      const sessions = ctx?.get?.('sessions')
      const workspace = ctx?.get?.('uiWorkspace')
      const list = sessions?.list?.getSnapshot?.()
      if (sessions && workspace && list?.phase === 'ready') {
        const current = Object.values(list.byId ?? {}).find((row: any) => (row?.retainedBy?.mainView ?? 0) > 0) as any
        if (current?.id === sessionId) return
        try {
          workspace.openSession(sessionId)
          return
        } catch { /* 会话不存在或被归档，交给默认选择 */ }
      }
    } catch { /* 服务未就绪 */ }
    if (tries < 60) window.setTimeout(tick, 400)
  }
  window.setTimeout(tick, 600)
}


const ASK_BRIDGE_FLAG = '__edugraphAskBridge'

/**
 * 接收父面板的上下文提问，直接投递到当前原生会话。
 * 父面板 → postMessage → iframe → ctx.sessions.scope(id).get('conversation').send(text)。
 */
function installAskBridge(ctx: any, hintSessionId: string | null) {
  if (typeof window === 'undefined' || window.parent === window) return
  if ((window as any)[ASK_BRIDGE_FLAG]) return
  ;(window as any)[ASK_BRIDGE_FLAG] = true
  // 父页面现在可能是 dsh-app://、子 frame 是 http://127.0.0.1；跨 origin 时
  // 只能靠 event.source 认父窗口，不能再比 event.origin。
  const post = (payload: any) => {
    try { window.parent.postMessage(payload, '*') } catch { /* ignore */ }
  }

  const resolveConversation = async () => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        const sessions = ctx?.get?.('sessions')
        if (sessions) {
          const list = sessions.list?.getSnapshot?.()
          const current = (Object.values(list?.byId ?? {}).find((row: any) => (row?.retainedBy?.mainView ?? 0) > 0) as any)?.id
            || hintSessionId
          if (current) {
            const scope = sessions.scope?.(current)
            const conversation = scope?.get?.('conversation')
            if (conversation?.send) return conversation
          }
        }
      } catch { /* 服务未就绪 */ }
      await new Promise((resolve) => window.setTimeout(resolve, 300))
    }
    return null
  }

  window.addEventListener('message', async (event: MessageEvent) => {
    if (event.source !== window.parent) return
    const data = event.data as { type?: string; id?: number; text?: string } | null
    if (data?.type !== 'edugraph:ask') return
    const text = typeof data.text === 'string' ? data.text.trim().slice(0, 4000) : ''
    if (!text) {
      post({ type: 'edugraph:ask-error', id: data.id, message: '问题内容为空' })
      return
    }
    try {
      const conversation = await resolveConversation()
      if (!conversation) throw new Error('会话还没有准备好')
      await conversation.send(text)
      post({ type: 'edugraph:ask-sent', id: data.id })
    } catch (error: any) {
      console.warn('[edugraph] ask bridge failed', error)
      post({ type: 'edugraph:ask-error', id: data.id, message: error?.message ? String(error.message) : String(error) })
    }
  })
}

/** 仅在 iframe 的嵌入模式里执行；普通页面调用无副作用。 */
export function installChatEmbed(ctx: any): boolean {
  const { embed, sessionId } = readHash()
  if (!embed) return false
  try { document.documentElement.setAttribute('data-edugraph-embed', 'chat') } catch { /* ignore */ }
  installStyle()
  try { ctx?.layout?.selectPanel?.(null) } catch { /* ignore */ }
  installAskBridge(ctx, sessionId)
  announceReady()
  openRequestedSession(ctx, sessionId)
  return true
}
