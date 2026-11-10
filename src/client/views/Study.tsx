/** 概览 / 资料 / 计划：先告诉人"现在该干什么"，再给数据。 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  api, figureUrl, formatDate, formatDue, masteryLabel, mediaUrl,
  type DocumentItem, type Overview, type Plan, type Task,
} from '../api'
import {
  Badge, Button, EmptyState, ErrorBox, Field, FigureModal, Icon, Loading, Modal,
  Progress, Section, Stat, useFileDrop, useResource,
} from '../ui'

const TASK_TEXT: Record<string, string> = {
  lesson: '讲解', practice: '练习', quiz: '小测', review: '复习', recap: '总复习',
}
const TASK_TONE: Record<string, string> = {
  lesson: 'brand', practice: 'business', quiz: 'warn', review: 'success', recap: 'error',
}

// ---------------------------------------------------------------- 概览

export function OverviewView({ courseId, revision, onOpenView, notify }: {
  courseId: string
  revision: number
  onOpenView: (view: any) => void
  notify: (message: string) => void
}) {
  const { data, error, loading } = useResource(() => api.overview(courseId), [courseId, revision])
  const overview = data as (Overview & { ok: boolean }) | null
  if (loading && !overview) return <Loading />
  if (error) return <ErrorBox error={error} />
  if (!overview) return null

  const { stats, chapters, nextTasks, weakConcepts, dueReviews, events, planProgress, profile } = overview
  const hasDocs = stats.documents > 0
  const hasPlan = planProgress.total > 0
  const hasGoal = Boolean(profile.goal || profile.examDate)
  const accuracy = stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`

  // 下一步只给一个，别让人选。
  const action = !hasDocs
    ? { title: '先上传一份课程资料', why: 'PDF、Word、PPT 都行。系统会拆出章节和知识点，之后才有得学。', label: '去上传', view: 'documents', icon: 'upload' as const }
    : !hasPlan
      ? { title: '生成一份学习计划', why: '告诉我考试日期和每天能学多久，我按知识点顺序排好讲解、练习和复习。', label: '去排计划', view: 'plan', icon: 'target' as const }
      : dueReviews.length > 0
        ? { title: `先复习 ${dueReviews.length} 个快忘掉的知识点`, why: '这几个今天到期。先复习再学新的，记得更牢。', label: '开始复习', view: 'review', icon: 'repeat' as const }
        : nextTasks.length
          ? { title: `接着学「${nextTasks[0].title}」`, why: `大约 ${nextTasks[0].estimatedMinutes} 分钟。学完这一组就完成今天的任务了。`, label: '开始学习', view: nextTasks[0].type === 'practice' || nextTasks[0].type === 'quiz' ? 'quiz' : 'lesson', icon: 'spark' as const }
          : { title: '今天的任务都完成了', why: '想多学一点可以再来一组练习，或者去图谱看看哪块还不熟。', label: '再练一组', view: 'quiz', icon: 'check' as const }

  return (
    <div className="eg-grid" style={{ gap: 16 }}>
      {/* 今天先做这个 */}
      <section className="eg-card" style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--eg-brand) 10%, var(--eg-layer)) 0%, var(--eg-layer) 62%)',
        borderColor: 'color-mix(in srgb, var(--eg-brand) 24%, transparent)',
        padding: '20px 22px', gap: 14,
      }}>
        <div className="eg-row between" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 720 }}>
            <span className="eg-muted" style={{ fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase' }}>现在做这个</span>
            <span style={{ fontSize: 20, fontWeight: 680, letterSpacing: '-0.3px', lineHeight: 1.35 }}>{action.title}</span>
            <span className="eg-muted" style={{ fontSize: 13 }}>{action.why}</span>
          </div>
          <Button variant="primary" onClick={() => onOpenView(action.view)} style={{ padding: '10px 18px', fontSize: 14 }}>
            <Icon name={action.icon} size={15} />{action.label}
          </Button>
        </div>
        <div className="eg-wrap">
          <span className="eg-badge"><Icon name="clock" size={12} />今天已练 {overview.today.attempts} 题</span>
          <span className="eg-badge"><Icon name="repeat" size={12} />{stats.dueToday} 个待复习</span>
          <span className="eg-badge"><Icon name="target" size={12} />计划完成 {planProgress.done}/{planProgress.total || 0}</span>
          {profile.examDate ? <span className="eg-badge"><Icon name="flag" size={12} />考试 {profile.examDate}</span> : null}
        </div>
      </section>

      {/* 新手三步 */}
      {(!hasDocs || !hasGoal || !hasPlan) ? (
        <Section title="三步就能开始" hint="做完这三件事，剩下的交给系统安排">
          <div className="eg-grid cols-3">
            <StepCard index={1} done={hasDocs} title="上传资料" text={hasDocs ? `已上传 ${stats.documents} 份` : '课程 PDF、课件或笔记，一份就够开始'}
              action={hasDocs ? null : { label: '去上传', onClick: () => onOpenView('documents') }} />
            <StepCard index={2} done={hasGoal} title="说一下目标" text={hasGoal ? `目标：${profile.goal || '已记录'}` : '考试时间、每天能学多久，决定计划强度'}
              action={hasGoal ? null : { label: '去设置', onClick: () => onOpenView('settings') }} />
            <StepCard index={3} done={hasPlan} title="生成计划" text={hasPlan ? `${planProgress.total} 个任务已排好` : '按知识点顺序排讲解、练习和复习'}
              action={hasPlan ? null : { label: '去排计划', onClick: () => onOpenView('plan') }} />
          </div>
        </Section>
      ) : null}

      <div className="eg-grid cols-4">
        <Stat value={stats.concepts} label="知识点" sub={`${stats.chapters} 个章节`} />
        <Stat value={stats.mastered} label="已经掌握" sub={`半熟 ${stats.familiar} · 还生 ${stats.weak}`} />
        <Stat value={stats.dueToday} label="今天该复习" sub={stats.dueToday > 0 ? '先复习，事半功倍' : '今天没有到期的'} />
        <Stat value={accuracy} label="答题正确率" sub={`共答 ${stats.attempts} 题`} />
      </div>

      {!hasDocs ? (
        <Section>
          <EmptyState title="这门课还空着" text="上传一份资料，我就能把章节、知识点和它们的先后关系整理出来，再帮你排计划。"
            action={<Button variant="primary" onClick={() => onOpenView('documents')}>上传资料</Button>} />
        </Section>
      ) : (
        <div className="eg-split">
          <div className="eg-grid" style={{ gap: 16 }}>
            <Section title="接下来做的事" hint={hasPlan ? `整体完成 ${planProgress.done}/${planProgress.total}` : '还没有计划'}
              actions={<Button size="sm" onClick={() => onOpenView('plan')}>看全部</Button>}>
              {nextTasks.length ? (
                <div className="eg-list">
                  {nextTasks.map((task) => (
                    <button key={task.id} type="button" className="eg-list-row"
                      onClick={() => onOpenView(task.type === 'review' ? 'review' : task.type === 'practice' || task.type === 'quiz' ? 'quiz' : 'lesson')}>
                      <span className="eg-dot" data-tone={TASK_TONE[task.type] ?? 'brand'} />
                      <span className="eg-list-main">
                        <span className="eg-list-title">{task.title}</span>
                        <span className="eg-list-sub">{TASK_TEXT[task.type] ?? task.type} · 约 {task.estimatedMinutes} 分钟 · 排在 {task.dueDate}</span>
                      </span>
                      <span className="eg-list-side"><Icon name="chevron" size={14} /></span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="eg-row">
                  <span className="eg-muted">还没排任务。</span>
                  <Button size="sm" variant="primary" onClick={() => onOpenView('plan')}>生成计划</Button>
                </div>
              )}
            </Section>

            <Section title="每章学得怎么样" hint="条越长，这一章越熟">
              <div>
                {chapters.slice(0, 40).map((chapter) => {
                  const conceptCount = chapter.conceptCount ?? 0
                  const mastery = chapter.mastery ?? 0
                  return (
                    <div key={chapter.id} className="eg-chapter-row">
                      <span className="eg-chapter-title" data-level={Math.min(3, chapter.level)} title={chapter.title}>{chapter.title}</span>
                      <span className="eg-muted eg-nowrap">{chapter.masteredCount ?? 0}/{conceptCount}</span>
                      <span className="eg-chapter-bar"><Progress value={mastery} tone={mastery >= 0.8 ? 'success' : mastery >= 0.4 ? 'warn' : 'error'} /></span>
                    </div>
                  )
                })}
                {chapters.length === 0 ? <div className="eg-muted">还没有章节</div> : null}
              </div>
            </Section>
          </div>

          <div className="eg-grid" style={{ gap: 16 }}>
            <Section title="哪里还生" hint="按熟练度从低到高" actions={<Button size="sm" variant="ghost" onClick={() => onOpenView('graph')}>看图谱</Button>}>
              {weakConcepts.length ? (
                <div className="eg-wrap">
                  {weakConcepts.map((concept) => (
                    <span key={concept.id} className="eg-badge" title={`熟练度 ${Math.round(concept.mastery * 100)}%`}>
                      <span className="eg-dot" data-tone={concept.mastery >= 0.6 ? 'warn' : 'error'} />{concept.name}
                    </span>
                  ))}
                </div>
              ) : <div className="eg-muted">目前没有明显薄弱的地方，继续练就行。</div>}
            </Section>

            <Section title="今天到期" hint={dueReviews.length ? '忘得差不多了，先过一遍' : '今天没有到期的'}
              actions={dueReviews.length ? <Button size="sm" onClick={() => onOpenView('review')}>去复习</Button> : null}>
              {dueReviews.length ? (
                <div className="eg-list">
                  {dueReviews.slice(0, 8).map((item) => (
                    <div key={item.conceptId} className="eg-list-row" style={{ cursor: 'default' }}>
                      <span className="eg-list-main"><span className="eg-list-title">{item.name}</span></span>
                      <span className="eg-list-side eg-muted">{formatDue(item.due)}</span>
                    </div>
                  ))}
                </div>
              ) : <div className="eg-muted">做完练习会自动安排下次复习时间。</div>}
            </Section>

            <Section title="最近在做什么">
              {events.length ? (
                <div className="eg-list">
                  {events.slice(0, 8).map((event) => (
                    <div key={event.id} className="eg-list-row" style={{ cursor: 'default' }}>
                      <span className="eg-list-main">
                        <span className="eg-list-title">{describeEvent(event)}</span>
                        <span className="eg-list-sub">{formatDate(event.createdAt)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : <div className="eg-muted">还没有学习记录。</div>}
            </Section>
          </div>
        </div>
      )}
    </div>
  )
}

function StepCard({ index, done, title, text, action }: {
  index: number; done: boolean; title: string; text: string
  action: { label: string; onClick: () => void } | null
}) {
  return (
    <div style={{
      border: '1px solid var(--eg-border)', borderRadius: 'var(--eg-radius)', padding: '14px 16px',
      background: done ? 'color-mix(in srgb, var(--eg-success) 7%, transparent)' : 'var(--eg-bg)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div className="eg-row" style={{ gap: 8 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
          background: done ? 'var(--eg-success)' : 'var(--eg-layer3)',
          color: done ? '#fff' : 'var(--eg-text-2)',
        }}>{done ? '✓' : index}</span>
        <span style={{ fontWeight: 620, fontSize: 13.5 }}>{title}</span>
      </div>
      <div className="eg-muted" style={{ fontSize: 12 }}>{text}</div>
      {action ? <Button size="sm" onClick={action.onClick} style={{ alignSelf: 'flex-start' }}>{action.label}</Button> : null}
    </div>
  )
}

function describeEvent(event: Overview['events'][number]) {
  const name = event.conceptName || '课程'
  switch (event.type) {
    case 'answer': return `做了「${name}」的题`
    case 'review': return `复习了「${name}」`
    case 'explain': return `讲了「${name}」`
    case 'recall': return `回忆了「${name}」`
    case 'mistake': return `记下「${name}」的错因`
    default: return name
  }
}

// ---------------------------------------------------------------- 资料

const STATUS_TEXT: Record<string, string> = {
  parsing: '正在读', analyzing: '正在整理', ready: '可以用', failed: '读失败了',
}
const STATUS_TONE: Record<string, string> = {
  parsing: 'warn', analyzing: 'business', ready: 'success', failed: 'error',
}

export function DocumentsView({ courseId, revision, onChanged, notify }: {
  courseId: string
  revision: number
  onChanged: () => void
  notify: (message: string) => void
}) {
  const { data, error, loading, reload } = useResource(() => api.documents(courseId), [courseId, revision])
  const [uploading, setUploading] = useState(false)
  const [reading, setReading] = useState<DocumentItem | null>(null)
  const [galleryDoc, setGalleryDoc] = useState<DocumentItem | null>(null)
  const [pendingDelete, setPendingDelete] = useState<DocumentItem | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const documents = data?.documents ?? []
  const busy = documents.some((doc) => doc.status === 'parsing' || doc.status === 'analyzing')

  useEffect(() => {
    if (!busy) return undefined
    const timer = window.setInterval(() => { void reload(true) }, 1800)
    return () => window.clearInterval(timer)
  }, [busy, reload])

  const upload = async (files: File[]) => {
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        if (file.size > 80 * 1024 * 1024) { notify(`${file.name} 太大了（超过 80MB），换个小一点的`); continue }
        await api.uploadDocument(courseId, file)
      }
      notify(`收到 ${files.length} 份资料，正在后台整理`)
      onChanged()
      await reload(true)
    } catch (err: any) {
      notify(err?.message ?? '上传没成功，再试一次')
    } finally {
      setUploading(false)
    }
  }

  const drop = useFileDrop((files) => { void upload(files) }, !uploading)

  const reanalyze = async () => {
    setAnalyzing(true)
    try {
      const result = await api.analyze(courseId)
      notify(`重新整理完了：${result.chapters ?? 0} 个章节、${result.concepts ?? 0} 个知识点`)
      onChanged()
    } catch (err: any) {
      notify(err?.message ?? '整理失败')
    } finally {
      setAnalyzing(false)
    }
  }

  const remove = async () => {
    if (!pendingDelete) return
    try {
      await api.deleteDocument(courseId, pendingDelete.id)
      notify('资料删掉了，知识点已重新整理')
      setPendingDelete(null)
      onChanged()
      await reload(true)
    } catch (err: any) {
      notify(err?.message ?? '删除失败')
    }
  }

  if (loading && !data) return <Loading />

  return (
    <div className="eg-grid" style={{ gap: 16 }}>
      <div className="eg-row between">
        <div>
          <div style={{ fontSize: 17, fontWeight: 650 }}>课程资料</div>
          <div className="eg-muted">PDF、Word、PPT、Excel、Markdown、TXT、图片都行。上传后不用等，整理完会自己出现在详情里。</div>
        </div>
        <div className="eg-row">
          <Button size="sm" loading={analyzing} onClick={reanalyze}><Icon name="refresh" size={13} />重新整理</Button>
          <Button size="sm" variant="primary" loading={uploading} onClick={() => inputRef.current?.click()}>
            <Icon name="upload" size={13} />上传资料
          </Button>
        </div>
      </div>

      <input ref={inputRef} type="file" multiple hidden accept=".pdf,.docx,.pptx,.xlsx,.md,.markdown,.txt,.png,.jpg,.jpeg,.webp"
        onChange={(event) => { void upload(Array.from(event.target.files ?? [])); event.target.value = '' }} />

      <div
        {...drop.handlers}
        style={{
          border: `1.5px dashed ${drop.dragging ? 'var(--eg-brand)' : 'var(--eg-border-strong)'}`,
          borderRadius: 'var(--eg-radius)', padding: '26px 18px', textAlign: 'center', cursor: 'pointer',
          background: drop.dragging ? 'color-mix(in srgb, var(--eg-brand) 6%, transparent)' : 'transparent',
          transition: 'all 140ms ease',
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="eg-muted" style={{ fontSize: 13 }}>{uploading ? '正在上传…' : '把文件拖到这里，或点一下选文件'}</div>
        <div className="eg-muted" style={{ fontSize: 11, marginTop: 4 }}>支持一次选多个。关掉页面也不影响后台整理。</div>
      </div>

      {error ? <ErrorBox error={error} /> : null}

      {documents.length === 0 ? (
        <Section><EmptyState title="还没有资料" text="先传一份，我才有东西可教。" /></Section>
      ) : (
        <div className="eg-list">
          {documents.map((doc) => (
            <div key={doc.id} className="eg-list-row" style={{ cursor: 'default' }}>
              <span className="eg-dot" data-tone={STATUS_TONE[doc.status] ?? 'brand'} />
              <span className="eg-list-main">
                <span className="eg-list-title eg-ellipsis" title={doc.filename}>{doc.filename}</span>
                <span className="eg-list-sub">
                  {doc.pages} 页 · {(doc.charCount / 1000).toFixed(1)}k 字
                  {doc.error ? ` · ${doc.error}` : ''}
                </span>
              </span>
              <span className="eg-list-side">
                {doc.status === 'parsing' || doc.status === 'analyzing' ? <span className="eg-spinner" /> : null}
                <Badge tone={STATUS_TONE[doc.status]}>{STATUS_TEXT[doc.status] ?? doc.status}</Badge>
                {doc.status === 'ready' ? <Button size="sm" variant="ghost" onClick={() => setReading(doc)}>翻原文</Button> : null}
                {doc.status === 'ready' && /\.(docx|pptx)$/i.test(doc.filename)
                  ? <Button size="sm" variant="ghost" onClick={() => setGalleryDoc(doc)}>看图片</Button>
                  : null}
                <Button size="sm" variant="ghost" onClick={() => setPendingDelete(doc)} aria-label="删除资料"><Icon name="trash" size={13} /></Button>
              </span>
            </div>
          ))}
        </div>
      )}

      {reading ? <ReaderModal courseId={courseId} doc={reading} onClose={() => setReading(null)} /> : null}
      {galleryDoc ? <MediaGalleryModal courseId={courseId} doc={galleryDoc} onClose={() => setGalleryDoc(null)} /> : null}

      {pendingDelete ? (
        <Modal title="删掉这份资料？" onClose={() => setPendingDelete(null)}
          footer={<>
            <Button onClick={() => setPendingDelete(null)}>先留着</Button>
            <Button variant="danger" onClick={remove}>删掉</Button>
          </>}>
          <div>删掉「{pendingDelete.filename}」会一起清掉它的文字和图片，知识点会重新整理。已经做过的题和复习记录不会丢。</div>
        </Modal>
      ) : null}
    </div>
  )
}

/** 原文阅读器：文字 + 插画（PDF 电路图在这里渲染出来）。 */
function ReaderModal({ courseId, doc, onClose }: { courseId: string; doc: DocumentItem; onClose: () => void }) {
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [figurePage, setFigurePage] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.documentPages(courseId, doc.id, page, 1)
      .then((data) => { if (!cancelled) { setPages(data.pages); setError(null) } })
      .catch((err) => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [courseId, doc.id, page])

  const showFigure = (pageNo: number) => setFigurePage(Math.max(1, Math.min(doc.pages || 1, pageNo)))

  return (
    <Modal wide title={doc.filename} onClose={onClose}
      footer={<>
        <Button size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</Button>
        <span className="eg-muted" style={{ alignSelf: 'center' }}>{page} / {doc.pages}</span>
        <Button size="sm" disabled={page >= doc.pages} onClick={() => setPage((value) => Math.min(doc.pages, value + 1))}>下一页</Button>
      </>}>
      <div className="eg-row" style={{ marginBottom: 6 }}>
        <Button size="sm" onClick={() => showFigure(page)}><Icon name="layers" size={13} />看这一页的图（电路图/波形）</Button>
        <span className="eg-muted" style={{ fontSize: 11 }}>文字里看不到的图，从这里看</span>
      </div>
      {loading ? <Loading /> : null}
      {error ? <ErrorBox error={error} /> : null}
      {pages.map((item) => (
        <div key={item.pageNo} className="eg-reader-page">
          <div className="eg-reader-page-no">第 {item.pageNo} 页</div>
          {(item.blocks ?? []).map((block: any) => (
            <div key={block.id} className="eg-reader-block" data-kind={block.kind}>{block.text}</div>
          ))}
        </div>
      ))}
      {!loading && !pages.length ? <div className="eg-muted">这一页没有可显示的文字。</div> : null}
      {figurePage ? (
        <FigureModal
          src={figureUrl(courseId, doc.id, figurePage)}
          title={`${doc.filename} · 第 ${figurePage} 页`}
          hint="PDF 里的电路图是矢量画的，所以这里把整页渲染成图片"
          onPrev={figurePage > 1 ? () => setFigurePage(figurePage - 1) : undefined}
          onNext={figurePage < doc.pages ? () => setFigurePage(figurePage + 1) : undefined}
          onClose={() => setFigurePage(null)}
        />
      ) : null}
    </Modal>
  )
}

/** Word/PPT 内嵌图片画廊。 */
function MediaGalleryModal({ courseId, doc, onClose }: { courseId: string; doc: DocumentItem; onClose: () => void }) {
  const [media, setMedia] = useState<{ index: number; name: string; bytes: number }[] | null>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    let cancelled = false
    api.documentMedia(courseId, doc.id)
      .then((data) => { if (!cancelled) setMedia(data.media) })
      .catch(() => { if (!cancelled) setMedia([]) })
    return () => { cancelled = true }
  }, [courseId, doc.id])

  if (!media) return <Modal title={`${doc.filename} · 图片`} onClose={onClose}><Loading /></Modal>
  if (!media.length) {
    return (
      <Modal title={`${doc.filename} · 图片`} onClose={onClose}>
        <div className="eg-muted">这份资料里没有内嵌图片。PDF 的话用「翻原文 → 看这一页的图」。</div>
      </Modal>
    )
  }
  const current = media[Math.min(active, media.length - 1)]
  return (
    <FigureModal
      src={mediaUrl(courseId, doc.id, current.index)}
      title={`${doc.filename} · ${current.name}`}
      hint={`第 ${active + 1} / ${media.length} 张`}
      onPrev={active > 0 ? () => setActive(active - 1) : undefined}
      onNext={active < media.length - 1 ? () => setActive(active + 1) : undefined}
      onClose={onClose}
    />
  )
}

// ---------------------------------------------------------------- 计划

export function PlanView({ courseId, revision, onChanged, notify, onStartLesson }: {
  courseId: string
  revision: number
  onChanged: () => void
  notify: (message: string) => void
  onStartLesson: () => void
}) {
  const { data, error, loading, reload } = useResource(() => api.plan(courseId), [courseId, revision])
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState<'todo' | 'all'>('todo')
  const [form, setForm] = useState({ goal: '', examDate: '', dailyMinutes: 45 })

  useEffect(() => {
    if (!data?.plan) return
    setForm({ goal: data.plan.goal ?? '', examDate: data.profile?.examDate ?? '', dailyMinutes: data.plan.dailyMinutes ?? 45 })
  }, [data?.plan?.id, data?.plan?.version])

  const generate = async () => {
    setGenerating(true)
    try {
      const result = await api.generatePlan(courseId, { goal: form.goal, examDate: form.examDate, dailyMinutes: Number(form.dailyMinutes) || 45 })
      notify(`排好了：${result.plan.tasks.length} 个任务，到 ${result.plan.targetDate}`)
      onChanged()
      await reload(true)
    } catch (err: any) {
      notify(err?.message ?? '生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const setTaskStatus = async (task: Task, status: string) => {
    try {
      await api.updateTask(courseId, task.id, { status })
      onChanged()
      await reload(true)
    } catch (err: any) {
      notify(err?.message ?? '更新失败')
    }
  }

  const plan = (data?.plan ?? null) as Plan | null
  const progress = data?.progress ?? { total: 0, done: 0, percent: 0 }
  const grouped = useMemo(() => {
    const tasks = (plan?.tasks ?? []).filter((task) => filter === 'all' || task.status !== 'done')
    const byDate = new Map<string, Task[]>()
    for (const task of tasks) byDate.set(task.dueDate || '未排期', [...(byDate.get(task.dueDate || '未排期') ?? []), task])
    return [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [plan, filter])

  if (loading && !data) return <Loading />
  if (error) return <ErrorBox error={error} />

  return (
    <div className="eg-grid" style={{ gap: 16 }}>
      <div className="eg-row between">
        <div>
          <div style={{ fontSize: 17, fontWeight: 650 }}>学习计划</div>
          <div className="eg-muted">
            {plan ? `到 ${plan.targetDate} 学完 · 每天 ${plan.dailyMinutes} 分钟 · 共 ${plan.tasks.length} 个任务` : '还没排'}
          </div>
        </div>
        <div className="eg-row">
          <Button size="sm" variant={filter === 'todo' ? 'primary' : 'default'} onClick={() => setFilter('todo')}>没做完的</Button>
          <Button size="sm" variant={filter === 'all' ? 'primary' : 'default'} onClick={() => setFilter('all')}>全部</Button>
        </div>
      </div>

      <Section title={plan ? '改一改再排' : '排一份计划'} hint="改完重排时，已经完成的任务不会被清掉">
        <div className="eg-grid cols-3">
          <Field label="这次想达到什么">
            <input className="eg-input" value={form.goal} placeholder="比如：两周内会做二极管电路题"
              onChange={(event) => setForm({ ...form, goal: event.target.value })} />
          </Field>
          <Field label="考试或截止日期">
            <input className="eg-input" type="date" value={form.examDate}
              onChange={(event) => setForm({ ...form, examDate: event.target.value })} />
          </Field>
          <Field label="每天能学多久（分钟）">
            <input className="eg-input" type="number" min={10} max={480} value={form.dailyMinutes}
              onChange={(event) => setForm({ ...form, dailyMinutes: Number(event.target.value) })} />
          </Field>
        </div>
        <div className="eg-row">
          <Button variant="primary" loading={generating} onClick={generate}>
            <Icon name="spark" size={14} />{plan ? '重新排' : '排计划'}
          </Button>
          {plan ? <Button size="sm" onClick={onStartLesson}><Icon name="book" size={13} />开始学第一课</Button> : null}
          <span className="eg-muted eg-right">{progress.done}/{progress.total} 完成 · {progress.percent}%</span>
        </div>
        {progress.total ? <Progress value={progress.percent / 100} /> : null}
        <div className="eg-muted" style={{ fontSize: 11.5 }}>
          排序逻辑：先按资料里的章节顺序，再按"必须先学谁"，每个单元配一次讲解和一次练习，学完在 1、3、7 天后各复习一次。
        </div>
      </Section>

      {!plan ? (
        <Section>
          <EmptyState title="还没排计划" text="排好之后，每天打开就能看到今天该学什么，不用自己想去哪一步。"
            action={<Button variant="primary" loading={generating} onClick={generate}>排计划</Button>} />
        </Section>
      ) : (
        <div className="eg-grid" style={{ gap: 14 }}>
          {grouped.map(([date, tasks]) => (
            <Section key={date} title={date === '未排期' ? '没排日期' : `${date} · ${tasks.length} 项`}>
              <div className="eg-list">
                {tasks.map((task) => (
                  <div key={task.id} className="eg-list-row" style={{ cursor: 'default' }} data-active={task.status === 'doing'}>
                    <span className="eg-dot" data-tone={task.status === 'done' ? 'success' : TASK_TONE[task.type] ?? 'brand'} />
                    <span className="eg-list-main">
                      <span className="eg-list-title" style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</span>
                      <span className="eg-list-sub">{TASK_TEXT[task.type] ?? task.type} · 约 {task.estimatedMinutes} 分钟 · {task.conceptIds.length} 个知识点</span>
                    </span>
                    <span className="eg-list-side">
                      {task.status !== 'done' ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => { void setTaskStatus(task, 'done') }} title="标记完成"><Icon name="check" size={13} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { void setTaskStatus(task, 'skipped') }}>跳过</Button>
                        </>
                      ) : <Badge tone="success">已完成</Badge>}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          ))}
          {!grouped.length ? <Section><EmptyState title="都做完了" text="换个筛选看看全部，或者去练一组新题。" /></Section> : null}
        </div>
      )}
    </div>
  )
}
