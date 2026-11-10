/** 学习插件的独立导师会话：每门课一条 DSH 原生 session，不占用当前主对话。 */

const MAP_KEY = 'edugraph.tutor.sessions'
const PREV_KEY = 'edugraph.tutor.previous'

export function readTutorSessions(): Record<string, string> {
  try {
    const raw = localStorage.getItem(MAP_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, string> = {}
    for (const [courseId, sessionId] of Object.entries(parsed)) {
      if (typeof sessionId === 'string' && sessionId) out[courseId] = sessionId
    }
    return out
  } catch {
    return {}
  }
}

function writeTutorSessions(map: Record<string, string>): void {
  try { localStorage.setItem(MAP_KEY, JSON.stringify(map)) } catch { /* ignore */ }
}

function readPrevious(): string | null {
  try { return localStorage.getItem(PREV_KEY) } catch { return null }
}

function writePrevious(sessionId: string): void {
  try { localStorage.setItem(PREV_KEY, sessionId) } catch { /* ignore */ }
}

/** 只记录非导师的主会话，避免把上一门课的导师当成“原来的主对话”。 */
function isTutorSession(sessionId: string, map?: Record<string, string>): boolean {
  const sessions = map ?? readTutorSessions()
  return Object.values(sessions).includes(sessionId)
}

function mainSession(sessions: any): any {
  try {
    const snapshot = sessions?.list?.getSnapshot?.()
    const rows = Object.values(snapshot?.byId ?? {}) as any[]
    return rows.find((row) => (row?.retainedBy?.mainView ?? 0) > 0)
  } catch {
    return undefined
  }
}

/**
 * 创建/切换到一门课的独立导师会话，然后立刻把学习面板选回来。
 *
 * DSH 的公开路径是 uiWorkspace.openSession（会把 mainView 切过去并展示原生对话），
 * 紧接着 layout.selectPanel('learning') 留在学习面板；这样右侧的原生 slot 属于
 * 这条导师会话，而不是用户当前的主对话。每门课记住自己的 session id，回来接着聊。
 */
export function createTutorController(ctx: any, layout: any, panelKey: string) {
  let inFlight: Promise<string | null> | null = null

  const ensureTutor = (courseId: string, workspaceId?: string): Promise<string | null> => {
    if (!courseId) return Promise.resolve(null)
    if (inFlight) return inFlight
    inFlight = (async () => {
      try {
        const sessions = ctx.sessions ?? ctx.get?.('sessions')
        if (!sessions) return null
        const snapshot = sessions.list?.getSnapshot?.()
        const current = mainSession(sessions)
        const map = readTutorSessions()
        let target = map[courseId]
        if (target && !snapshot?.byId?.[target]) target = undefined

        // 已经在导师会话里：不再切换，避免无谓的 open/select 循环。
        if (target && current?.id === target) return target

        const workspace = ctx.get?.('uiWorkspace') ?? ctx.uiWorkspace
        if (!workspace) return null

        // 记住进入学习前的主会话，用户点「返回对话」时回到它。
        if (current?.id && !isTutorSession(current.id, map)) writePrevious(current.id)

        if (target) {
          workspace.openSession?.(target)
          layout?.selectPanel?.(panelKey)
          return target
        }

        // 直接 sessions.create 不会挂到工作区，原生会话会显示“选择工作区”。
        // 用 uiWorkspace.openWorkspace 在课程所在工作区创建/复用一个空白会话，再留在学习面板。
        if (!workspaceId || !workspace.openWorkspace) return null
        await workspace.openWorkspace(workspaceId)
        layout?.selectPanel?.(panelKey)
        const created = mainSession(sessions)?.id
        if (!created) return null
        target = String(created)
        map[courseId] = target
        writeTutorSessions(map)
        return target
      } catch (error) {
        console.warn('[edugraph] ensureTutor failed', error)
        return null
      }
    })().finally(() => { inFlight = null })
    return inFlight
  }

  const restoreMain = (): boolean => {
    const previous = readPrevious()
    if (!previous) return false
    const sessions = ctx.sessions ?? ctx.get?.('sessions')
    const snapshot = sessions?.list?.getSnapshot?.()
    if (!snapshot?.byId?.[previous]) return false
    if (isTutorSession(previous)) return false
    const workspace = ctx.get?.('uiWorkspace') ?? ctx.uiWorkspace
    if (!workspace?.openSession) return false
    try {
      workspace.openSession(previous)
      return true
    } catch (error) {
      console.warn('[edugraph] restoreMain failed', error)
      return false
    }
  }

  return { ensureTutor, restoreMain }
}
