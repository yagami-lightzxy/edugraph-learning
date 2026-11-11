/** 课程库：漂亮的首屏、创建课程、进入学习、删除课程。 */
import { useState } from 'react'
import { api, formatDate, type CourseListItem } from '../api'
import { Button, Field, Icon, Modal, ProgressRing } from '../ui'

export function LibraryView({ catalog, onOpen, onChanged, notify }: {
  catalog: CourseListItem[]
  onOpen: (id: string) => void
  onChanged: () => void
  notify: (message: string) => void
}) {
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<CourseListItem | null>(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', goal: '', examDate: '' })

  const create = async () => {
    if (!form.name.trim()) { notify('请填写课程名称'); return }
    setBusy(true)
    try {
      const created = await api.createCourse({ name: form.name.trim(), subject: form.subject.trim(), goal: form.goal.trim() })
      if (form.examDate) await api.updateCourse(created.course.id, { examDate: form.examDate })
      setCreating(false)
      setForm({ name: '', subject: '', goal: '', examDate: '' })
      notify('课程建好了，传资料就能开始')
      onChanged()
      onOpen(created.course.id)
    } catch (error: any) {
      notify(error?.message ?? '创建失败')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!pendingDelete) return
    setBusy(true)
    try {
      await api.deleteCourse(pendingDelete.id)
      notify('课程已删除')
      setPendingDelete(null)
      onChanged()
    } catch (error: any) {
      notify(error?.message ?? '删除失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="eg-grid" style={{ gap: 18 }}>
      <section className="eg-hero">
        <div className="eg-hero-copy">
          <div className="eg-hero-eyebrow"><span className="eg-hero-dot" />EduGraph · AI 学习模式</div>
          <h1 className="eg-hero-title">把课件变成<br /><em>一条走得完的学习路径</em></h1>
          <p className="eg-hero-text">
            传一份资料，自动拆出章节和知识点，再按考试日期排好讲解、练习和复习。右侧 AI 导师随时能问，不用离开学习界面。
          </p>
          <div className="eg-hero-actions">
            <button type="button" className="eg-btn eg-hero-primary" onClick={() => setCreating(true)}>
              <Icon name="plus" size={15} />新建课程
            </button>
            {catalog.length ? (
              <a className="eg-hero-link" href="#eg-course-grid" onClick={(event) => {
                event.preventDefault()
                document.getElementById('eg-course-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}>看看我的课程 <Icon name="chevron" size={13} /></a>
            ) : null}
          </div>
          <div className="eg-hero-meta">
            <span><Icon name="upload" size={13} />PDF / Word / PPT / 图片</span>
            <span><Icon name="graph" size={13} />知识图谱</span>
            <span><Icon name="repeat" size={13} />间隔复习</span>
          </div>
        </div>
        <div className="eg-hero-visual" aria-hidden="true"><HeroArt /></div>
      </section>

      {catalog.length === 0 ? (
        <div className="eg-steps">
          <div className="eg-step">
            <span className="eg-step-icon"><Icon name="upload" size={17} /></span>
            <div><b>把资料拖进来</b><p>PDF、Word、PPT、Markdown 或图片，一份就够开始。</p></div>
          </div>
          <div className="eg-step">
            <span className="eg-step-icon"><Icon name="graph" size={17} /></span>
            <div><b>自动拆成知识点</b><p>章节、定义和先后关系一起整理好，不用手动记。</p></div>
          </div>
          <div className="eg-step">
            <span className="eg-step-icon"><Icon name="target" size={17} /></span>
            <div><b>跟着计划学</b><p>按考试日期和每天时长排讲解、练习与复习。</p></div>
          </div>
        </div>
      ) : null}

      <div className="eg-row between">
        <div>
          <div className="eg-section-title">我的课程</div>
          <div className="eg-muted">{catalog.length ? catalog.length + ' 门课 · 随时接着上次的进度' : '还没有课程，从上面新建一门'}</div>
        </div>
        {catalog.length ? (
          <Button variant="primary" onClick={() => setCreating(true)}><Icon name="plus" size={14} />新建课程</Button>
        ) : null}
      </div>

      {catalog.length ? (
        <div id="eg-course-grid" className="eg-grid eg-course-grid">
          {catalog.map((course) => (
            <div key={course.id} className="eg-course-card" onClick={() => onOpen(course.id)} role="button" tabIndex={0}
              onKeyDown={(event) => { if (event.key === 'Enter') onOpen(course.id) }}>
              <div className="eg-course-top">
                <span className="eg-course-icon"><Icon name="book" size={17} /></span>
                <div className="eg-course-heading">
                  <div className="eg-course-name eg-ellipsis" title={course.name}>{course.name}</div>
                  <div className="eg-course-meta">
                    {course.subject ? <span>{course.subject}</span> : null}
                    <span>{course.documentCount} 份资料</span>
                    <span>{course.conceptCount} 个知识点</span>
                  </div>
                </div>
                <button type="button" className="eg-icon-btn sm eg-course-delete" title="删掉课程"
                  onClick={(event) => { event.stopPropagation(); setPendingDelete(course) }}>
                  <Icon name="trash" size={13} />
                </button>
              </div>

              <div className="eg-course-progress">
                <ProgressRing value={(course.progress ?? 0) / 100} size={46} stroke={5} label={course.name + ' 的完成度'} />
                <div className="eg-course-progress-text">
                  <b>{course.progress ?? 0}%</b>
                  <span>计划完成 · 复习稳固 {course.masteredCount ?? 0}/{course.conceptCount ?? 0}</span>
                </div>
              </div>

              <div className="eg-course-foot">
                <span className="eg-muted">
                  {course.lastStudiedAt ? '上次学到 ' + formatDate(course.lastStudiedAt).split(' ')[0] : '还没开始'}
                  {course.examDate ? ' · 考试 ' + course.examDate.slice(5) : ''}
                </span>
                <span className="eg-course-go">继续学习 <Icon name="chevron" size={13} /></span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {creating ? (
        <Modal
          title="新建课程"
          onClose={() => setCreating(false)}
          footer={<>
            <Button onClick={() => setCreating(false)}>取消</Button>
            <Button variant="primary" loading={busy} onClick={create}>创建</Button>
          </>}
        >
          <Field label="课程名称">
            <input className="eg-input" value={form.name} autoFocus placeholder="例如：模拟电子技术"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              onKeyDown={(event) => { if (event.key === 'Enter') void create() }} />
          </Field>
          <div className="eg-grid cols-2">
            <Field label="学科（可选）">
              <input className="eg-input" value={form.subject} placeholder="电子工程 / 数据结构 / 英语…"
                onChange={(event) => setForm({ ...form, subject: event.target.value })} />
            </Field>
            <Field label="考试或截止日期（可选）">
              <input className="eg-input" type="date" value={form.examDate}
                onChange={(event) => setForm({ ...form, examDate: event.target.value })} />
            </Field>
          </div>
          <Field label="学习目标（可选）" hint="例如：两周内掌握二极管与三极管电路分析，能独立做题。">
            <textarea className="eg-textarea" style={{ minHeight: 64 }} value={form.goal}
              onChange={(event) => setForm({ ...form, goal: event.target.value })} />
          </Field>
        </Modal>
      ) : null}

      {pendingDelete ? (
        <Modal
          title="删掉课程"
          onClose={() => setPendingDelete(null)}
          footer={<>
            <Button onClick={() => setPendingDelete(null)}>取消</Button>
            <Button variant="danger" loading={busy} onClick={remove}>确认删除</Button>
          </>}
        >
          <div>删掉「{pendingDelete.name}」会把这个课的章节、知识点、计划和答题记录一起清掉，删了找不回来。</div>
        </Modal>
      ) : null}
    </div>
  )
}

/** 首屏右侧的装饰图：几个知识点连成一张会呼吸的网。 */
function HeroArt() {
  return (
    <svg className="eg-hero-art" viewBox="0 0 320 240" fill="none">
      <defs>
        <linearGradient id="eg-hero-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".12" />
        </linearGradient>
        <radialGradient id="eg-hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="214" cy="112" r="98" fill="url(#eg-hero-glow)" opacity=".5" />
      <g className="eg-hero-lines" stroke="url(#eg-hero-line)" strokeWidth="1.2">
        <path d="M72 158 126 102 192 132 254 70" />
        <path d="M126 102 118 42M126 102 56 88M192 132 234 168M192 132 198 194M254 70 288 124" />
      </g>
      <g className="eg-hero-nodes" fill="#ffffff">
        <circle cx="72" cy="158" r="5" opacity=".85" />
        <circle cx="126" cy="102" r="8" />
        <circle cx="192" cy="132" r="6" />
        <circle cx="254" cy="70" r="4" />
        <circle cx="118" cy="42" r="3.5" opacity=".65" />
        <circle cx="56" cy="88" r="3" opacity=".6" />
        <circle cx="234" cy="168" r="3.5" opacity=".7" />
        <circle cx="198" cy="194" r="3" opacity=".55" />
        <circle cx="288" cy="124" r="2.5" opacity=".5" />
      </g>
      <g className="eg-hero-labels" fill="#ffffff" fontSize="9" opacity=".85">
        <text x="138" y="96">概念</text>
        <text x="202" y="152">关系</text>
        <text x="82" y="178">掌握</text>
      </g>
    </svg>
  )
}
