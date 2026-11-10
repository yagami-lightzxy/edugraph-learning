/**
 * EduGraph AI 学习模式 · 浏览器侧插件。
 *
 * 界面分三块：
 *  - 左侧学员导航（课程、学习/练习分组、设置与返回对话）；
 *  - 中间学习内容（原有的课程库、概览、资料、计划、图谱、讲解、练习）；
 *  - 右侧「AI 导师」：同源 iframe 内嵌当前 DSH 原生会话，模型和工具权限不变。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import css from './styles.css'
import { api, type CourseListItem } from './api'
import { BrandMark, Icon, Loading, ProgressRing } from './ui'
import { LibraryView } from './views/Library'
import { OverviewView, DocumentsView, PlanView } from './views/Study'
import { LessonView, QuizView, MistakesView, ReviewView } from './views/Practice'
import { GraphView } from './views/Graph'
import { SettingsView } from './views/Settings'
import { ChatDock } from './views/Chat'
import { PackModal } from './views/Pack'
import { getChatSessionId, subscribeChatSession, trackChatSession } from './session'
import { installChatEmbed } from './embed'
import { newAskId, setTutorSender, type TutorAsk } from './tutor'

export const name = 'edugraph-learning'
/** 依赖的客户端服务：slots 组合 UI，layout 负责在主面板与原生会话之间切换。 */
export const inject = ['slots', 'layout', 'sessions']

export const PANEL_ID = 'learning'

type ViewKey = 'library' | 'overview' | 'documents' | 'plan' | 'graph' | 'lesson' | 'quiz' | 'mistakes' | 'review' | 'settings'
type IconName = any

const NAV: { key: ViewKey; label: string; icon: IconName; group: string }[] = [
  { key: 'overview', label: '概览', icon: 'target', group: '学习' },
  { key: 'documents', label: '资料', icon: 'layers', group: '学习' },
  { key: 'plan', label: '计划', icon: 'book', group: '学习' },
  { key: 'lesson', label: '讲解', icon: 'spark', group: '练习' },
  { key: 'graph', label: '图谱', icon: 'graph', group: '练习' },
  { key: 'quiz', label: '练习', icon: 'quiz', group: '练习' },
  { key: 'mistakes', label: '错题', icon: 'flag', group: '练习' },
  { key: 'review', label: '复习', icon: 'repeat', group: '练习' },
]

const VIEW_LABEL: Record<ViewKey, string> = {
  library: '课程库', overview: '概览', documents: '资料', plan: '计划', graph: '图谱',
  lesson: '讲解', quiz: '练习', mistakes: '错题', review: '复习', settings: '设置',
}

const CHAT_KEY = 'edugraph.chat.open'

function readChatOpen(): boolean {
  try {
    const value = localStorage.getItem(CHAT_KEY)
    if (value === '1' || value === '0') return value === '1'
  } catch { /* ignore */ }
  return typeof window !== 'undefined' && window.innerWidth >= 1180
}

export type QuizRequest = {
  mode: 'practice' | 'review'
  taskId?: string | null
  conceptIds?: string[] | null
  count?: number
}

export type PanelProps = {
  /** 由插件注入：切回 DSH 原生对话。 */
  closePanel?: () => void
  /** iframe 里不显示右侧对话，避免递归。 */
  chatEnabled?: boolean
}

function useChatSession(): string | null {
  const [sessionId, setSessionId] = useState<string | null>(() => getChatSessionId())
  useEffect(() => subscribeChatSession(() => setSessionId(getChatSessionId())), [])
  return sessionId
}

/** 学习主面板。 */
export function LearningPanel(props: PanelProps & Record<string, any>) {
  const { closePanel, chatEnabled = true, sendChat } = props
  const [catalog, setCatalog] = useState<CourseListItem[]>([])
  const [courseId, setCourseId] = useState<string | null>(null)
  const [view, setView] = useState<ViewKey>('library')
  const [revision, setRevision] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [booting, setBooting] = useState(true)
  const [chatOpen, setChatOpen] = useState(readChatOpen)
  const [packOpen, setPackOpen] = useState(false)
  const [askRequest, setAskRequest] = useState<TutorAsk | null>(null)
  const [quizRequest, setQuizRequest] = useState<QuizRequest>({ mode: 'practice' })
  const toastTimer = useRef<number | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)
  const chatSession = useChatSession()

  const notify = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const refresh = useCallback(() => setRevision((value) => value + 1), [])

  const setChat = useCallback((next: boolean) => {
    setChatOpen(next)
    try { localStorage.setItem(CHAT_KEY, next ? '1' : '0') } catch { /* ignore */ }
  }, [])

  const askTutor = useCallback((text: string, label?: string) => {
    if (!chatEnabled) return false
    setChat(true)
    // 原生聊天坞直接走父页面的 conversation 服务；iframe 只作为没有原生 slot 时的兜底。
    if (typeof sendChat === 'function' && sendChat(text)) {
      notify(label ? `已把「${label}」发给 AI 导师` : '已把问题发给 AI 导师')
      return true
    }
    setAskRequest({ id: newAskId(), text, label })
    notify(label ? `已把「${label}」发给 AI 导师` : '已把问题发给 AI 导师')
    return true
  }, [chatEnabled, notify, sendChat, setChat])

  const clearAsk = useCallback((id: number) => {
    setAskRequest((current) => (current && current.id === id ? null : current))
  }, [])

  useEffect(() => setTutorSender(askTutor), [askTutor])

  // 样式只注入一次，随组件卸载移除。
  useEffect(() => {
    const style = document.createElement('style')
    style.dataset.edugraph = 'learning'
    style.textContent = css as unknown as string
    document.head.append(style)
    styleRef.current = style
    return () => { style.remove() }
  }, [])

  // 启动：读服务端 UI 状态，恢复上次课程与页面。
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [list, state] = await Promise.all([
          api.listCourses(),
          api.getState().catch(() => null),
        ])
        if (cancelled) return
        setCatalog(list.courses)
        const saved = state?.state ?? {}
        const savedCourse = list.courses.some((course) => course.id === saved.activeCourseId)
        if (savedCourse) {
          setCourseId(saved.activeCourseId)
          const savedView = saved.activeView as ViewKey
          setView(savedView || 'overview')
        } else if (list.courses.length) {
          const fallback = list.lastCourseId && list.courses.some((course) => course.id === list.lastCourseId)
            ? list.lastCourseId
            : list.courses[0].id
          setCourseId(fallback)
          setView(list.courses.length === 1 ? 'overview' : 'library')
        } else {
          setView('library')
        }
      } catch (error: any) {
        notify(error?.message ?? '无法连接学习服务')
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => { cancelled = true }
  }, [notify])

  // 持久化当前课程与页面（刷新后恢复）。
  useEffect(() => {
    if (booting) return
    void api.saveState({ enabled: true, activeCourseId: courseId, activeView: view }).catch(() => undefined)
  }, [courseId, view, booting, revision])

  // 到期复习数量：每次刷新重算，作为「复习」标签角标。
  useEffect(() => {
    if (!courseId) { setDueCount(0); return }
    let cancelled = false
    api.reviews(courseId)
      .then((data) => { if (!cancelled) setDueCount(data.counts?.due ?? 0) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [courseId, revision])

  // 切页面时回到顶部，避免长页面从中间开始。
  useEffect(() => {
    mainRef.current?.scrollTo?.({ top: 0 })
  }, [view, courseId])

  // 学完一轮后，左栏进度和课程卡也要跟着更新；列表接口很轻，顺手同步。
  useEffect(() => {
    if (booting) return undefined
    let cancelled = false
    api.listCourses()
      .then((data) => { if (!cancelled) setCatalog(data.courses) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [revision, booting])

  const course = useMemo(() => catalog.find((item) => item.id === courseId) ?? null, [catalog, courseId])
  const sessionsSnapshot = props.useSessions((snapshot: any) => snapshot)
  const sessionRow = chatSession ? sessionsSnapshot?.byId?.[chatSession] : null
  const sessionBlank = Boolean(sessionRow?.blank)

  const openCourse = useCallback((id: string) => {
    setCourseId(id)
    setView('overview')
    refresh()
  }, [refresh])

  const openLibrary = useCallback(() => {
    setView('library')
    void api.listCourses().then((data) => setCatalog(data.courses)).catch(() => undefined)
  }, [])

  const startQuiz = useCallback((request: QuizRequest) => {
    setQuizRequest(request)
    setView('quiz')
  }, [])

  const leave = useCallback(() => {
    void api.saveState({ enabled: false }).catch(() => undefined)
    closePanel?.()
  }, [closePanel])

  const expandChat = useCallback(() => {
    setChat(false)
    setAskRequest(null)
    leave()
  }, [leave, setChat])

  const toggleChat = useCallback(() => setChat(!chatOpen), [chatOpen, setChat])

  if (booting) {
    return (
      <div className="eg-app eg-boot">
        <div className="eg-boot-card">
          <BrandMark size={46} />
          <div className="eg-boot-title">正在打开学习模式</div>
          <div className="eg-boot-text"><span className="eg-spinner" />正在读取课程与学习记录…</div>
        </div>
      </div>
    )
  }

  const showNav = Boolean(courseId)
  const showChat = Boolean(chatEnabled)
  const dataChat = showChat && chatOpen ? 'true' : 'false'

  return (
    <div className="eg-app" data-chat={dataChat} data-course={courseId ? 'true' : 'false'}>
      <div className="eg-shell">
      <aside className="eg-rail" aria-label="学习导航">
        <button type="button" className="eg-brand eg-brand-button" onClick={openLibrary} title="回到课程库">
          <BrandMark size={40} />
          <div className="eg-brand-text">
            <div className="eg-brand-name">EduGraph</div>
            <div className="eg-brand-sub">AI 学习模式</div>
          </div>
        </button>

        {course ? (
          <div className="eg-rail-course">
            <div className="eg-rail-course-head">
              <span className="eg-rail-course-icon"><Icon name="book" size={16} /></span>
              <div className="eg-rail-course-text">
                <div className="eg-rail-course-name" title={course.name}>{course.name}</div>
                <div className="eg-rail-course-sub">{course.subject || '我的课程'}</div>
              </div>
              <button type="button" className="eg-icon-btn sm" title="打开课程库" onClick={openLibrary}>
                <Icon name="layers" size={14} />
              </button>
            </div>
            <label className="eg-course-picker" title="切换课程">
              <span>切换课程</span>
              <select
                value={courseId ?? ''}
                onChange={(event) => { setCourseId(event.target.value); setView('overview'); refresh() }}
              >
                {catalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="eg-rail-progress">
              <ProgressRing value={(course.progress ?? 0) / 100} size={40} stroke={4} label="整体学习进度" />
              <div className="eg-rail-progress-text">
                <b>{course.progress ?? 0}%</b>
                <span>整体进度</span>
              </div>
              {dueCount > 0 ? <span className="eg-rail-due">{dueCount} 待复习</span> : null}
            </div>
          </div>
        ) : (
          <div className="eg-rail-empty">
            <span className="eg-rail-empty-icon"><Icon name="spark" size={18} /></span>
            <b>从一门课开始</b>
            <span>传份资料，自动拆出章节、知识点和学习计划。</span>
            <button type="button" className="eg-btn sm" onClick={openLibrary}>打开课程库</button>
          </div>
        )}

        {showNav ? (
          <nav className="eg-nav" aria-label="学习导航">
            <button type="button" className="eg-nav-item" data-active={view === 'library'} onClick={openLibrary} title="课程库">
              <span className="eg-nav-icon"><Icon name="layers" size={15} /></span>
              <span className="eg-nav-label">课程库</span>
            </button>
            <div className="eg-nav-group">学习</div>
            {NAV.filter((item) => item.group === '学习').map((item) => (
              <button
                key={item.key}
                type="button"
                className="eg-nav-item"
                data-active={view === item.key}
                onClick={() => setView(item.key)}
                title={item.label}
              >
                <span className="eg-nav-icon"><Icon name={item.icon} size={15} /></span>
                <span className="eg-nav-label">{item.label}</span>
              </button>
            ))}
            <div className="eg-nav-group">练习</div>
            {NAV.filter((item) => item.group === '练习').map((item) => (
              <button
                key={item.key}
                type="button"
                className="eg-nav-item"
                data-active={view === item.key}
                onClick={() => setView(item.key)}
                title={item.label}
              >
                <span className="eg-nav-icon"><Icon name={item.icon} size={15} /></span>
                <span className="eg-nav-label">{item.label}</span>
                {item.key === 'review' && dueCount > 0 ? <span className="eg-nav-badge">{dueCount}</span> : null}
              </button>
            ))}
          </nav>
        ) : (
          <nav className="eg-nav" aria-label="学习导航">
            <div className="eg-nav-group">开始</div>
            <button type="button" className="eg-nav-item" data-active="true" onClick={openLibrary} title="课程库">
              <span className="eg-nav-icon"><Icon name="layers" size={15} /></span>
              <span className="eg-nav-label">课程库</span>
            </button>
            <div className="eg-nav-hint">打开一门课后，这里会出现学习与练习导航。</div>
          </nav>
        )}

        <div className="eg-rail-foot">
          {courseId ? (
            <button type="button" className="eg-nav-item" data-active={view === 'settings'} onClick={() => setView('settings')} title="学习设置">
              <span className="eg-nav-icon"><Icon name="settings" size={15} /></span>
              <span className="eg-nav-label">设置</span>
            </button>
          ) : null}
          <button type="button" className="eg-nav-item eg-rail-back" onClick={leave} title="返回 DSH 原生对话">
            <span className="eg-nav-icon"><Icon name="arrow-left" size={15} /></span>
            <span className="eg-nav-label">返回对话</span>
          </button>
          <div className="eg-rail-note"><i className="eg-live-dot" />课程与记录只保存在本机</div>
        </div>
      </aside>

      <div className="eg-stage">
        <header className="eg-topbar">
          <div className="eg-crumbs">
            <span className="eg-crumb-root">学习模式</span>
            <Icon name="chevron" size={12} className="eg-crumb-sep" />
            {course && view !== 'library' ? (
              <>
                <b title={course.name}>{course.name}</b>
                <Icon name="chevron" size={12} className="eg-crumb-sep" />
                <span>{VIEW_LABEL[view]}</span>
              </>
            ) : <b>课程库</b>}
          </div>
          <div className="eg-top-actions">
            {courseId ? (
              <button type="button" className="eg-btn ghost sm eg-pack-open" title="用 ChatGPT / Claude 生成课程内容" aria-label="用其他 AI 生成课程内容" onClick={() => setPackOpen(true)}>
                <Icon name="spark" size={14} /><span className="eg-hide-sm">AI 内容</span>
              </button>
            ) : null}
            {courseId ? (
              <button type="button" className="eg-icon-btn sm eg-settings-compact" title="学习设置" onClick={() => setView('settings')}>
                <Icon name="settings" size={14} />
              </button>
            ) : null}
            {showChat ? (
              <button type="button" className="eg-chat-toggle" data-open={chatOpen} onClick={toggleChat}
                title={chatOpen ? '收起 AI 导师' : '打开 AI 导师，在本页直接对话'}>
                <Icon name="chat" size={15} />
                <span className="eg-hide-sm">AI 导师</span>
                {!chatOpen ? <i className="eg-live-dot" data-tone="success" /> : null}
              </button>
            ) : null}
            <button type="button" className="eg-btn ghost sm eg-back-desktop" onClick={leave} title="返回 DSH 原生对话">
              <span className="eg-hide-sm">返回对话</span>
              <Icon name="arrow-left" size={14} />
            </button>
          </div>
        </header>

        <main className="eg-main" ref={mainRef}>
          <div className="eg-main-inner">
            {view === 'library' || !courseId ? (
              <LibraryView
                catalog={catalog}
                onOpen={openCourse}
                onChanged={() => { refresh(); void api.listCourses().then((data) => setCatalog(data.courses)).catch(() => undefined) }}
                notify={notify}
              />
            ) : null}
            {courseId && view === 'overview' ? (
              <OverviewView courseId={courseId} revision={revision} onOpenView={setView} notify={notify} />
            ) : null}
            {courseId && view === 'documents' ? (
              <DocumentsView courseId={courseId} revision={revision} onChanged={refresh} notify={notify} />
            ) : null}
            {courseId && view === 'plan' ? (
              <PlanView courseId={courseId} revision={revision} onChanged={refresh} notify={notify} onStartLesson={() => setView('lesson')} />
            ) : null}
            {courseId && view === 'graph' ? (
              <GraphView courseId={courseId} revision={revision} notify={notify} onPractice={(conceptIds) => startQuiz({ mode: 'practice', conceptIds })} />
            ) : null}
            {courseId && view === 'lesson' ? (
              <LessonView courseId={courseId} revision={revision} onChanged={refresh} notify={notify} onPractice={(request) => startQuiz(request)} />
            ) : null}
            {courseId && view === 'quiz' ? (
              <QuizView courseId={courseId} request={quizRequest} onChanged={refresh} notify={notify} onOpenLesson={() => setView('lesson')} onOpenReview={() => setView('review')} />
            ) : null}
            {courseId && view === 'mistakes' ? (
              <MistakesView courseId={courseId} revision={revision} notify={notify} onPractice={(conceptIds) => startQuiz({ mode: 'practice', conceptIds })} />
            ) : null}
            {courseId && view === 'review' ? (
              <ReviewView courseId={courseId} revision={revision} notify={notify} onChanged={refresh} onPractice={(conceptIds) => startQuiz({ mode: 'review', conceptIds })} />
            ) : null}
            {courseId && view === 'settings' ? (
              <SettingsView
                courseId={courseId}
                revision={revision}
                notify={notify}
                onChanged={() => { refresh(); void api.listCourses().then((data) => setCatalog(data.courses)).catch(() => undefined) }}
                onDeleted={() => { setCourseId(null); setView('library'); refresh() }}
              />
            ) : null}
          </div>
        </main>
      </div>

      {showChat ? (
        <ChatDock
          open={chatOpen}
          sessionId={chatSession}
          sessionBlank={sessionBlank}
          renderFactorySlot={props.renderFactorySlot}
          askRequest={askRequest}
          onAskDone={clearAsk}
          onNotify={notify}
          onClose={() => { setChat(false); setAskRequest(null) }}
          onExpand={expandChat}
        />
      ) : null}
      </div>

      {showChat && !chatOpen ? (
        <button type="button" className="eg-chat-fab" onClick={() => setChat(true)} title="打开 AI 导师" aria-label="打开 AI 导师">
          <Icon name="chat" size={15} /> AI 导师
        </button>
      ) : null}
      {courseId && packOpen ? (
        <PackModal
          open={packOpen}
          courseId={courseId}
          courseName={course?.name ?? ''}
          onClose={() => setPackOpen(false)}
          onImported={() => {
            refresh()
            void api.listCourses().then((data) => setCatalog(data.courses)).catch(() => undefined)
          }}
          notify={notify}
        />
      ) : null}
      {toast ? <div className="eg-toast" role="status">{toast}</div> : null}
    </div>
  )
}

/** 侧栏图标。 */
export function LearningIcon() {
  return <Icon name="graph" size={16} />
}

/**
 * 插件入口：注册主面板与侧栏入口。
 * iframe 里的嵌入实例只做样式/会话对齐，不注册任何面板，避免递归。
 * @param ctx 浏览器侧 Cordis 上下文
 */
export function apply(ctx: any) {
  try {
    if (installChatEmbed(ctx)) {
      trackChatSession(ctx)
      return
    }
    trackChatSession(ctx)

    // 原生聊天坞的发送口：不再需要 iframe；上下文「问导师」直接入当前会话。
    const sendChat = (text: string) => {
      const id = getChatSessionId()
      if (!id) return false
      try {
        const conversation = ctx.sessions?.scope?.(id)?.get?.('conversation')
        if (!conversation?.send) return false
        void conversation.send(text).catch((error: any) => console.warn('[edugraph] sendChat failed', error))
        return true
      } catch (error) {
        console.warn('[edugraph] sendChat unavailable', error)
        return false
      }
    }

    const slots = ctx.slots ?? ctx.get?.('slots')
    const layout = ctx.layout ?? ctx.get?.('layout')
    if (!slots) { console.warn('[edugraph] no slots service'); return }

    ctx.effect(
      () => slots.inject('main', () => slots.register({
        name: 'main',
        key: PANEL_ID,
        inject: () => ({
          closePanel: () => { layout?.selectPanel?.(null) },
          chatEnabled: true,
          sendChat,
        }),
      }, LearningPanel)),
      'edugraph-learning: main panel',
    )

    ctx.effect(
      () => slots.inject('sidebar.panellist', () => slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 40,
        label: () => '学习',
      }, LearningIcon)),
      'edugraph-learning: sidebar entry',
    )
  } catch (error) {
    console.error('[edugraph] apply failed', error)
    throw error
  }
}
