/**
 * EduGraph AI 学习模式 · 浏览器侧插件。
 *
 * 注册两处界面：
 *  - root 作用域 keyed slot 「main」的 learning 面板（整页学习界面）；
 *  - 侧栏入口「学习」（点击即切换到该面板）。
 * 面板与 DSH 原生会话共享同一运行时：切回对话不改变会话、模型与工具权限。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import css from './styles.css'
import { api, type CourseListItem } from './api'
import { Icon, Loading } from './ui'
import { LibraryView } from './views/Library'
import { OverviewView, DocumentsView, PlanView } from './views/Study'
import { LessonView, QuizView, MistakesView, ReviewView } from './views/Practice'
import { GraphView } from './views/Graph'
import { SettingsView } from './views/Settings'

export const name = 'edugraph-learning'
/** 依赖的客户端服务：slots 组合 UI，layout 负责在主面板与原生会话之间切换。 */
export const inject = ['slots', 'layout']

export const PANEL_ID = 'learning'

type ViewKey = 'library' | 'overview' | 'documents' | 'plan' | 'graph' | 'lesson' | 'quiz' | 'mistakes' | 'review' | 'settings'

const NAV: { key: ViewKey; label: string; icon: any }[] = [
  { key: 'overview', label: '概览', icon: 'target' },
  { key: 'documents', label: '资料', icon: 'layers' },
  { key: 'plan', label: '计划', icon: 'book' },
  { key: 'graph', label: '图谱', icon: 'graph' },
  { key: 'lesson', label: '讲解', icon: 'spark' },
  { key: 'quiz', label: '练习', icon: 'quiz' },
  { key: 'mistakes', label: '错题', icon: 'flag' },
  { key: 'review', label: '复习', icon: 'repeat' },
]

export type QuizRequest = {
  mode: 'practice' | 'review'
  taskId?: string | null
  conceptIds?: string[] | null
  count?: number
}

export type PanelProps = {
  /** 由插件注入：切回 DSH 原生对话。 */
  closePanel?: () => void
}

/** 学习主面板。 */
export function LearningPanel({ closePanel }: PanelProps) {
  const [catalog, setCatalog] = useState<CourseListItem[]>([])
  const [courseId, setCourseId] = useState<string | null>(null)
  const [view, setView] = useState<ViewKey>('library')
  const [revision, setRevision] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [booting, setBooting] = useState(true)
  const [quizRequest, setQuizRequest] = useState<QuizRequest>({ mode: 'practice' })
  const toastTimer = useRef<number | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  const notify = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const refresh = useCallback(() => setRevision((value) => value + 1), [])

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
        const exists = list.courses.some((course) => course.id === saved.activeCourseId)
        if (exists) {
          setCourseId(saved.activeCourseId)
          const savedView = saved.activeView as ViewKey
          setView(savedView && savedView !== 'library' ? savedView : 'overview')
        } else if (list.courses.length === 1) {
          setCourseId(list.courses[0].id)
          setView('overview')
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

  const course = useMemo(() => catalog.find((item) => item.id === courseId) ?? null, [catalog, courseId])

  const openCourse = useCallback((id: string) => {
    setCourseId(id)
    setView('overview')
    refresh()
  }, [refresh])

  const startQuiz = useCallback((request: QuizRequest) => {
    setQuizRequest(request)
    setView('quiz')
  }, [])

  const leave = useCallback(() => {
    void api.saveState({ enabled: false }).catch(() => undefined)
    closePanel?.()
  }, [closePanel])

  if (booting) {
    return <div className="eg-app"><div className="eg-main"><Loading text="正在打开学习模式…" /></div></div>
  }

  const showNav = Boolean(courseId)
  return (
    <div className="eg-app">
      <header className="eg-header">
        <div className="eg-brand">
          <Icon name="graph" size={22} />
          EduGraph
          <span className="eg-brand-sub">学习模式</span>
        </div>
        {course ? (
          <label className="eg-course-picker" title="切换课程">
            <Icon name="book" size={13} />
            <select
              value={courseId ?? ''}
              onChange={(event) => { setCourseId(event.target.value); setView('overview'); refresh() }}
            >
              {catalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        ) : null}
        <div className="eg-header-spacer" />
        <div className="eg-row">
          <button type="button" className="eg-btn ghost sm" onClick={() => { setCourseId(null); setView('library') }}>
            课程库
          </button>
          {courseId ? (
            <button type="button" className="eg-btn ghost sm" onClick={() => setView('settings')} aria-label="学习设置">
              <Icon name="settings" size={14} />设置
            </button>
          ) : null}
          <button type="button" className="eg-btn sm" onClick={leave}>
            返回对话<Icon name="arrow-right" size={13} />
          </button>
        </div>
      </header>

      {showNav ? (
        <nav className="eg-nav" aria-label="学习导航">
          {NAV.map((item) => (
            <button
              key={item.key}
              type="button"
              className="eg-nav-item"
              data-active={view === item.key}
              onClick={() => setView(item.key)}
            >
              <Icon name={item.icon} size={14} />
              {item.label}
              {item.key === 'review' && dueCount > 0 ? <span className="eg-nav-badge">{dueCount}</span> : null}
            </button>
          ))}
        </nav>
      ) : null}

      <main className="eg-main">
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
 * @param ctx 浏览器侧 Cordis 上下文
 */
export function apply(ctx: any) {
  try {
  const slots = ctx.slots ?? ctx.get?.('slots')
  const layout = ctx.layout ?? ctx.get?.('layout')
  if (!slots) { console.warn('[edugraph] no slots service'); return }

  ctx.effect(
    () => slots.inject('main', () => slots.register({
      name: 'main',
      key: PANEL_ID,
      inject: () => ({
        closePanel: () => { layout?.selectPanel?.(null) },
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

