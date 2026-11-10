/** EduGraph 面板通用组件与数据钩子（不依赖第三方 UI 库，只依赖 React）。 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type IconName =
  | 'book' | 'layers' | 'target' | 'graph' | 'quiz' | 'flag' | 'repeat' | 'settings'
  | 'plus' | 'upload' | 'trash' | 'close' | 'chevron' | 'spark' | 'check' | 'clock' | 'search' | 'arrow-right' | 'arrow-left' | 'refresh'
  | 'chat' | 'panel'

const PATHS: Record<IconName, string> = {
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14.5H6.5A2.5 2.5 0 0 0 4 20V5.5Zm0 0V20',
  layers: 'M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  graph: 'M6 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm12 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 21.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 19h-3a3 3 0 0 1-3-3V8m0 0 3 3m-3-3L9 11',
  quiz: 'M9 9V4.5h6V9h4.5v6H15v4.5H9V15H4.5V9H9Zm0 0h6v6H9V9Z',
  flag: 'M5 21V4h9l-1 3h7l-2 5 2 5h-7l-1-3H5',
  repeat: 'M4 9a5 5 0 0 1 5-5h8m0 0-3-3m3 3-3 3M20 15a5 5 0 0 1-5 5H7m0 0 3 3m-3-3 3-3',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5c0-.6-.05-1.2-.14-1.76l2.02-1.57-2-3.46-2.38.96A8 8 0 0 0 15.1 4.4L14.7 2h-4l-.4 2.4a8 8 0 0 0-2.4 1.77l-2.38-.96-2 3.46 2.02 1.57A8.4 8.4 0 0 0 5.4 12c0 .6.05 1.2.14 1.76L3.52 15.33l2 3.46 2.38-.96a8 8 0 0 0 2.4 1.77l.4 2.4h4l.4-2.4a8 8 0 0 0 2.4-1.77l2.38.96 2-3.46-2.02-1.57c.09-.56.14-1.16.14-1.76Z',
  plus: 'M12 5v14M5 12h14',
  upload: 'M12 16V4m0 0L7 9m5-5 5 5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  trash: 'M4 7h16M9 7V4h6v3m-7 0 1 13h6l1-13',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'M9 6l6 6-6 6',
  spark: 'M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3Z',
  check: 'M4 12.5 9 18 20 6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3.5 2',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5.2-1.8L21 21',
  'arrow-right': 'M4 12h15m0 0-5-5m5 5-5 5',
  'arrow-left': 'M20 12H5m0 0 5-5m-5 5 5 5',
  refresh: 'M20 11a8 8 0 0 0-14-4.5L4 8m0-4v4h4M4 13a8 8 0 0 0 14 4.5L20 16m0 4v-4h-4',
  chat: 'M20.5 11.6a8.2 8.2 0 0 1-11.9 7.3L4 20l1.2-4.3A8.2 8.2 0 1 1 20.5 11.6ZM8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01',
  panel: 'M4 4h16v16H4V4Zm10 0v16',
}

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Button({ children, variant = 'default', size = 'md', loading, className = '', ...rest }: any) {
  const cls = ['eg-btn', variant === 'primary' ? 'primary' : variant === 'ghost' ? 'ghost' : variant === 'danger' ? 'danger' : '',
    size === 'sm' ? 'sm' : '', className].filter(Boolean).join(' ')
  return (
    <button type="button" className={cls} disabled={rest.disabled || loading} {...rest}>
      {loading ? <span className="eg-spinner" /> : null}
      {children}
    </button>
  )
}

export function Badge({ children, tone }: { children: any; tone?: string }) {
  return <span className="eg-badge" data-tone={tone}>{children}</span>
}

export function Progress({ value, tone = 'brand' }: { value: number; tone?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((Number(value) || 0) * 100)))
  return (
    <div className="eg-progress" data-tone={tone} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pct}%` }} />
    </div>
  )
}

/** 环形进度：侧栏课程卡、概览等地方用。 */
export function ProgressRing({ value, size = 42, stroke = 4, tone = 'brand', label }: {
  value: number
  size?: number
  stroke?: number
  tone?: string
  label?: string
}) {
  const pct = Math.max(0, Math.min(100, Math.round((Number(value) || 0) * 100)))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <svg className="eg-ring" data-tone={tone} width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? '完成度'}>
      <circle className="eg-ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" />
      <circle className="eg-ring-fill" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  )
}

/** 品牌标：用节点连成的小书，和知识图谱呼应。 */
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <span className="eg-brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62} fill="none">
        <path d="M7 10.5 16 6l9 4.5v11L16 26l-9-4.5v-11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity=".55" />
        <path d="M7 10.5 16 15l9-4.5M16 15v11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity=".75" />
        <circle cx="16" cy="15" r="2.6" fill="currentColor" />
        <circle cx="7" cy="10.5" r="1.8" fill="currentColor" opacity=".9" />
        <circle cx="25" cy="10.5" r="1.8" fill="currentColor" opacity=".9" />
        <circle cx="16" cy="26" r="1.8" fill="currentColor" opacity=".9" />
      </svg>
    </span>
  )
}

export function Section({ title, hint, actions, children, className = '' }: any) {
  return (
    <section className={`eg-card ${className}`}>
      {(title || actions) ? (
        <div className="eg-card-head">
          <div>
            <div className="eg-card-title">{title}</div>
            {hint ? <div className="eg-card-hint">{hint}</div> : null}
          </div>
          {actions ? <div className="eg-row">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Stat({ value, label, sub }: { value: any; label: string; sub?: string }) {
  return (
    <div className="eg-stat">
      <div className="eg-stat-value">{value}</div>
      <div className="eg-stat-label">{label}</div>
      {sub ? <div className="eg-stat-sub">{sub}</div> : null}
    </div>
  )
}

export function Field({ label, hint, children }: any) {
  return (
    <div className="eg-field">
      {label ? <label>{label}</label> : null}
      {children}
      {hint ? <div className="eg-field-hint">{hint}</div> : null}
    </div>
  )
}

export function EmptyState({ title, text, action }: any) {
  return (
    <div className="eg-empty">
      <Icon name="spark" size={38} />
      <div className="eg-empty-title">{title}</div>
      {text ? <div className="eg-empty-text">{text}</div> : null}
      {action}
    </div>
  )
}

export function Loading({ text = '加载中…' }: { text?: string }) {
  return <div className="eg-loading"><span className="eg-spinner" />{text}</div>
}

export function ErrorBox({ error }: { error: any }) {
  if (!error) return null
  const message = error?.message ?? String(error)
  return <div className="eg-error-box">出错了：{message}</div>
}

export function Modal({ title, children, onClose, footer, wide }: any) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="eg-modal-mask" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.() }}>
      <div className={`eg-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="eg-modal-head">
          <div className="eg-modal-title">{title}</div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="关闭"><Icon name="close" size={14} /></Button>
        </div>
        <div className="eg-modal-body">{children}</div>
        {footer ? <div className="eg-modal-foot">{footer}</div> : null}
      </div>
    </div>
  )
}

/** 图片查看器：电路图、波形、示意图都在这里放大看。 */
export function FigureModal({ src, title, hint, onClose, onPrev, onNext, busy }: {
  src: string
  title: string
  hint?: string
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  busy?: boolean
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => { setState('loading') }, [src])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && onPrev) { event.preventDefault(); onPrev() }
      if (event.key === 'ArrowRight' && onNext) { event.preventDefault(); onNext() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrev, onNext])
  return (
    <div className="eg-modal-mask" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="eg-modal wide" role="dialog" aria-modal="true" aria-label={title} style={{ width: 'min(1100px, 96vw)' }}>
        <div className="eg-modal-head">
          <div>
            <div className="eg-modal-title">{title}</div>
            {hint ? <div className="eg-card-hint">{hint}</div> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="关闭"><Icon name="close" size={14} /></Button>
        </div>
        <div className="eg-modal-body" style={{ padding: 10, background: 'var(--eg-layer2)', minHeight: 220, position: 'relative' }}>
          {state === 'loading' ? <div className="eg-loading"><span className="eg-spinner" />正在把这一页画成图片…</div> : null}
          {state === 'error' ? (
            <div className="eg-empty" style={{ padding: 30 }}>
              <div className="eg-empty-title">这张图没出来</div>
              <div className="eg-empty-text">可能是缺 canvas 依赖或文件太大。在插件目录执行 <code>npm install canvas</code> 后重启 DSH 再试。</div>
            </div>
          ) : null}
          <img src={src} alt={title} hidden={state !== 'ready'}
            onLoad={() => setState('ready')} onError={() => setState('error')}
            style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#fff' }} />
        </div>
        <div className="eg-modal-foot">
          <span className="eg-muted" style={{ marginRight: 'auto' }}>
            {onPrev || onNext ? '← → 翻页 · ' : ''}看不清可以右键图片另存
          </span>
          {onPrev ? <Button size="sm" onClick={onPrev} disabled={busy}>上一页</Button> : null}
          {onNext ? <Button size="sm" onClick={onNext} disabled={busy}>下一页</Button> : null}
          <Button onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  )
}

/** 简易数据钩子：path 变化或 revision 变化时重新拉取。 */
export function useResource<T>(loader: () => Promise<T>, deps: any[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const depsKey = JSON.stringify(deps)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const value = await loaderRef.current()
      setData(value)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { void load() }, [depsKey, load])
  return { data, error, loading, reload: load }
}

/** 轮询钩子：active 为 true 时按间隔执行。 */
export function usePolling(callback: () => void, intervalMs: number, active: boolean) {
  const ref = useRef(callback)
  ref.current = callback
  useEffect(() => {
    if (!active) return undefined
    const timer = window.setInterval(() => ref.current(), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs, active])
}

/** 上传进度与拖拽状态。 */
export function useFileDrop(onFiles: (files: File[]) => void, enabled = true) {
  const [dragging, setDragging] = useState(false)
  const handlers = useMemo(() => ({
    onDragOver: (event: any) => { if (!enabled) return; event.preventDefault(); setDragging(true) },
    onDragLeave: () => setDragging(false),
    onDrop: (event: any) => {
      if (!enabled) return
      event.preventDefault()
      setDragging(false)
      const files = Array.from(event.dataTransfer?.files ?? []) as File[]
      if (files.length) onFiles(files)
    },
  }), [enabled, onFiles])
  return { dragging, handlers }
}

export { Icon as EgIcon }
