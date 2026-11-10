/** 右侧「AI 导师」：内嵌当前 DSH 原生会话，并可接收学习视图带着上下文发来的问题。 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../ui'
import { chatFrameUrl } from '../embed'
import type { TutorAsk } from '../tutor'

type ChatStatus = 'loading' | 'ready' | 'slow' | 'error'

function postOrigin(): string {
  const origin = window.location.origin
  return origin && origin !== 'null' ? origin : '*'
}

export function ChatDock({ open, sessionId, askRequest, onAskDone, onNotify, onClose, onExpand }: {
  open: boolean
  sessionId: string | null
  askRequest: TutorAsk | null
  onAskDone: (id: number) => void
  onNotify: (message: string) => void
  onClose: () => void
  onExpand: () => void
}) {
  const [mounted, setMounted] = useState(open)
  const [nonce, setNonce] = useState(0)
  const [status, setStatus] = useState<ChatStatus>('loading')
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const postedAsk = useRef<number | null>(null)
  const src = useMemo(() => chatFrameUrl(sessionId), [sessionId])

  useEffect(() => { if (open) setMounted(true) }, [open])

  useEffect(() => {
    if (!mounted) return undefined
    setStatus('loading')
    const slow = window.setTimeout(() => {
      setStatus((current) => (current === 'loading' ? 'slow' : current))
    }, 12000)
    return () => window.clearTimeout(slow)
  }, [mounted, nonce, sessionId])

  // 父面板把问题交过来；等 iframe 就绪后投递给嵌入实例，再等回执。
  useEffect(() => {
    if (!askRequest || status !== 'ready') return undefined
    if (postedAsk.current === askRequest.id) return undefined
    const target = frameRef.current?.contentWindow
    if (!target) {
      onNotify('导师面板还没准备好，稍后再点一次')
      onAskDone(askRequest.id)
      return undefined
    }
    postedAsk.current = askRequest.id
    try {
      target.postMessage({ type: 'edugraph:ask', id: askRequest.id, text: askRequest.text }, postOrigin())
    } catch {
      onNotify('问题没有发出去，再点一次试试')
      onAskDone(askRequest.id)
      return undefined
    }
    const timer = window.setTimeout(() => {
      if (postedAsk.current === askRequest.id) {
        onNotify('导师没有回应，可能还在接入；稍后再点一次')
        onAskDone(askRequest.id)
      }
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [askRequest, status, onAskDone, onNotify])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const frameWindow = frameRef.current?.contentWindow
      if (frameWindow && event.source !== frameWindow) return
      const data = event.data as { type?: string; id?: number; message?: string } | null
      if (data?.type === 'edugraph:chat-ready') setStatus('ready')
      if (data?.type === 'edugraph:chat-failed') setStatus('error')
      if (data?.type === 'edugraph:ask-sent' && typeof data.id === 'number') onAskDone(data.id)
      if (data?.type === 'edugraph:ask-error') {
        console.warn('[edugraph] ask error', data)
        onNotify('导师没有收到问题：' + (data.message || '未知错误'))
        if (typeof data.id === 'number') onAskDone(data.id)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [onAskDone, onNotify])

  const reload = () => {
    postedAsk.current = null
    setStatus('loading')
    setNonce((value) => value + 1)
  }

  if (!mounted) return null

  return (
    <aside className="eg-chat" data-state={status} aria-label="AI 导师">
      <header className="eg-chat-head">
        <span className="eg-chat-avatar"><Icon name="spark" size={17} /></span>
        <div className="eg-chat-title">
          <b>AI 导师</b>
          <span>
            <i className="eg-live-dot" data-tone={status === 'error' ? 'error' : status === 'ready' ? 'success' : 'warn'} />
            {status === 'ready' ? '与当前对话同步' : status === 'error' ? '连接失败，点刷新重试' : status === 'slow' ? '还在连接对话…' : '正在接入对话…'}
          </span>
        </div>
        <div className="eg-chat-actions">
          <button type="button" className="eg-icon-btn sm" title="重新加载对话" aria-label="重新加载对话" onClick={reload}><Icon name="refresh" size={14} /></button>
          <button type="button" className="eg-icon-btn sm" title="在完整对话中打开" aria-label="在完整对话中打开" onClick={onExpand}><Icon name="panel" size={14} /></button>
          <button type="button" className="eg-icon-btn sm" title="收起导师（对话不中断）" aria-label="收起导师" onClick={onClose}><Icon name="close" size={14} /></button>
        </div>
      </header>

      <div className="eg-chat-body">
        <div className="eg-chat-frame-wrap">
          <iframe
            key={nonce}
            ref={frameRef}
            className="eg-chat-frame"
            title="AI 导师对话"
            src={src}
            onError={() => setStatus('error')}
          />
          {status !== 'ready' ? (
            <div className="eg-chat-cover" data-slow={status === 'slow' || status === 'error'}>
              <div className="eg-chat-skeleton" aria-hidden="true">
                <div className="eg-chat-skel-row"><span className="eg-skel" style={{ width: '42%' }} /><span className="eg-skel" style={{ width: '64%' }} /></div>
                <div className="eg-chat-skel-bubble"><span className="eg-skel" style={{ width: '78%' }} /><span className="eg-skel" style={{ width: '54%' }} /></div>
                <div className="eg-chat-skel-row end"><span className="eg-skel" style={{ width: '38%' }} /></div>
                <div className="eg-chat-skel-bubble"><span className="eg-skel" style={{ width: '70%' }} /><span className="eg-skel" style={{ width: '80%' }} /><span className="eg-skel" style={{ width: '46%' }} /></div>
              </div>
              {status === 'slow' || status === 'error' ? (
                <div className="eg-chat-slow">
                  <b>{status === 'error' ? '对话没有连上' : '对话还在加载'}</b>
                  <span>可以直接回完整对话里继续，学习进度不会丢。</span>
                  <div className="eg-row">
                    <button type="button" className="eg-btn sm" onClick={reload}>重试</button>
                    <button type="button" className="eg-btn primary sm" onClick={onExpand}>回到完整对话</button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <footer className="eg-chat-foot">
        <span className="eg-chat-sync"><i className="eg-live-dot" />{sessionId ? '当前课程与对话已共享' : '先在左侧选一门课'}</span>
        <span className="eg-chat-hint">Enter 发送 · Shift + Enter 换行</span>
      </footer>
    </aside>
  )
}
