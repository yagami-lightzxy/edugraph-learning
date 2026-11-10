/** 用外部 AI（ChatGPT / Claude / Gemini）生成课程内容：导出课程包，粘贴 JSON 回来校验合并。 */
import { useEffect, useRef, useState } from 'react'
import { api, type PackPreview, type PackStats } from '../api'
import { Button, ErrorBox, Field, Icon, Loading, Modal } from '../ui'

type PackData = { pack: any; prompt: string; stats: PackStats }

export function PackModal({ open, courseId, courseName, onClose, onImported, notify }: {
  open: boolean
  courseId: string
  courseName: string
  onClose: () => void
  onImported: () => void
  notify: (message: string) => void
}) {
  const [tab, setTab] = useState<'export' | 'import'>('export')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PackData | null>(null)
  const [loadError, setLoadError] = useState<any>(null)
  const [raw, setRaw] = useState('')
  const [overwrite, setOverwrite] = useState(false)
  const [preview, setPreview] = useState<PackPreview | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<any>(null)
  const promptRef = useRef<HTMLTextAreaElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return undefined
    setTab('export')
    setRaw('')
    setPreview(null)
    setError(null)
    setLoadError(null)
    setData(null)
    setLoading(true)
    let alive = true
    api.coursePack(courseId)
      .then((value) => { if (alive) setData(value) })
      .catch((err) => { if (alive) setLoadError(err) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [open, courseId])

  useEffect(() => { setPreview(null) }, [raw, overwrite])

  if (!open) return null

  const copyPrompt = async () => {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data.prompt)
      notify('提示词已复制，去 GPT 里粘贴')
    } catch {
      promptRef.current?.focus()
      promptRef.current?.select()
      notify('已选中提示词，按 Ctrl+C 复制')
    }
  }

  const downloadPack = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data.pack, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'edugraph-course-pack.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const readFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      setRaw(text)
      notify('已读取 ' + file.name)
    } catch (err: any) {
      setError(new Error('读取文件失败：' + (err?.message ?? err)))
    }
  }

  const runPreview = async () => {
    if (!raw.trim()) { setError(new Error('先粘贴 GPT 返回的 JSON，或者选一个 .json 文件')); return }
    setBusy(true)
    setError(null)
    try {
      const result = await api.previewPack(courseId, raw, overwrite)
      setPreview(result)
      notify(result.warnings?.length ? '校验通过，有 ' + result.warnings.length + ' 条提示' : '校验通过')
    } catch (err) {
      setPreview(null)
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const runImport = async () => {
    if (!preview) return
    setBusy(true)
    setError(null)
    try {
      const result = await api.importPack(courseId, raw, overwrite)
      notify('导入完成：新增 ' + result.counts.conceptsAdded + ' 个概念、' + result.counts.questionsAdded + ' 道题')
      onImported()
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const counts = preview?.counts
  const changed = counts ? counts.chaptersAdded + counts.conceptsAdded + counts.conceptsUpdated + counts.questionsAdded + counts.relationsAdded > 0 : false

  return (
    <Modal title={'用其他 AI 生成内容 · ' + courseName} onClose={onClose} wide
      footer={<><span className="eg-muted" style={{ marginRight: 'auto' }}>导入只追加，不删除已有概念、题目和学习记录。</span><Button onClick={onClose}>关闭</Button></>}>
      <div className="eg-pack-tabs" role="tablist" aria-label="课程包操作">
        <button type="button" role="tab" aria-selected={tab === 'export'} data-active={tab === 'export'} onClick={() => setTab('export')}>
          <Icon name="spark" size={14} /> 复制给 AI
        </button>
        <button type="button" role="tab" aria-selected={tab === 'import'} data-active={tab === 'import'} onClick={() => setTab('import')}>
          <Icon name="layers" size={14} /> 导入 AI 结果
        </button>
      </div>

      {loading ? <Loading text="正在导出课程包…" /> : null}
      {loadError ? <ErrorBox error={loadError} /> : null}

      {tab === 'export' && data ? (
        <div className="eg-pack-panel">
          <div className="eg-pack-stats">
            <span><b>{data.stats.chapters}</b> 章节</span>
            <span><b>{data.stats.concepts}</b> 概念</span>
            <span><b>{data.stats.questions}</b> 题目</span>
            <span><b>{data.stats.relations}</b> 关系</span>
            <span><b>{Math.max(1, Math.round(data.stats.bytes / 1024))}</b> KB</span>
          </div>
          <p className="eg-pack-note">
            把下面整段复制给 ChatGPT / Claude / Gemini。提示词里已经包含课程包和返回格式；让它只返回 JSON。
            改完后回到「导入 AI 结果」粘回来，插件会校验再合并。
          </p>
          <Field label="给外部 AI 的提示词" hint="提示词末尾就是当前课程包，不要删掉这段 JSON。">
            <textarea ref={promptRef} className="eg-textarea eg-pack-prompt" readOnly value={data.prompt} spellCheck={false} />
          </Field>
          <div className="eg-row">
            <Button variant="primary" onClick={copyPrompt}><Icon name="layers" size={14} />复制提示词</Button>
            <Button variant="ghost" onClick={downloadPack}>下载 JSON</Button>
            <Button variant="ghost" onClick={() => setTab('import')}>已生成，去导入</Button>
          </div>
          <div className="eg-pack-tip">
            没有 API key 也能用：GPT 网页版把 JSON 粘回来就行。不要把 API key 写进课程包或聊天里。
          </div>
        </div>
      ) : null}

      {tab === 'import' ? (
        <div className="eg-pack-panel">
          <p className="eg-pack-note">
            把 GPT 返回的 JSON 粘到下面（支持 ```json 代码块）。先预览会告诉你新增多少、跳过多少；确认后再写入。
          </p>
          <Field label="AI 返回的课程包 JSON" hint="同名概念会合并；计划字段只作上下文，不会改动现有计划。">
            <textarea className="eg-textarea eg-pack-import" value={raw} spellCheck={false}
              placeholder={'{\n  "format": "edugraph-course-pack",\n  "version": 1,\n  "chapters": [ ... ],\n  "questions": [ ... ]\n}'}
              onChange={(event) => setRaw(event.target.value)} />
          </Field>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden
            onChange={(event) => { void readFile(event.target.files?.[0]); event.target.value = '' }} />
          <div className="eg-row">
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>选择 JSON 文件</Button>
            <Button onClick={() => void runPreview()} loading={busy && !preview} disabled={busy}>预览校验</Button>
            <Button variant="primary" onClick={() => void runImport()} disabled={!preview || !changed || busy} loading={busy && Boolean(preview)}>
              确认导入
            </Button>
          </div>
          <label className="eg-check">
            <input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} />
            覆盖同名概念的已有定义
          </label>
          {error ? <ErrorBox error={error} /> : null}
          {preview ? (
            <div className="eg-pack-preview" data-empty={!changed}>
              <div className="eg-pack-counts">
                <span>+{counts?.chaptersAdded ?? 0} 章节</span>
                <span>+{counts?.conceptsAdded ?? 0} 概念</span>
                <span>{counts?.conceptsUpdated ?? 0} 个概念补定义</span>
                <span>+{counts?.questionsAdded ?? 0} 题</span>
                <span>{counts?.questionsSkipped ?? 0} 题跳过</span>
                <span>+{counts?.relationsAdded ?? 0} 关系</span>
              </div>
              {changed ? <div className="eg-pack-ok">校验通过，可以导入。</div> : <div className="eg-pack-empty">没有检测到新内容；可能是重复题目或同名概念。</div>}
              {preview.warnings?.length ? (
                <ul className="eg-pack-warnings">
                  {preview.warnings.slice(0, 6).map((warning, index) => <li key={index}>{warning}</li>)}
                  {preview.warnings.length > 6 ? <li>还有 {preview.warnings.length - 6} 条提示…</li> : null}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  )
}
