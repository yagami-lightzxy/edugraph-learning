/** 课程库：创建课程、进入最近学习、删除课程。 */
import { useState } from 'react'
import { api, formatDate, type CourseListItem } from '../api'
import { Button, EmptyState, Field, Icon, Modal, Progress, Section, useResource } from '../ui'

export function LibraryView({ catalog, onOpen, onChanged, notify }: {
  catalog: CourseListItem[]
  onOpen: (id: string) => void
  onChanged: () => void
  notify: (message: string) => void
}) {
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<CourseListItem | null>(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', goal: '', examDate: '', dailyMinutes: 45 })

  const create = async () => {
    if (!form.name.trim()) { notify('请填写课程名称'); return }
    setBusy(true)
    try {
      const created = await api.createCourse({ name: form.name.trim(), subject: form.subject.trim(), goal: form.goal.trim() })
      if (form.examDate) await api.updateCourse(created.course.id, { examDate: form.examDate })
      if (Number(form.dailyMinutes)) await api.updateCourse(created.course.id, { dailyMinutes: Number(form.dailyMinutes) })
      setCreating(false)
      setForm({ name: '', subject: '', goal: '', examDate: '', dailyMinutes: 45 })
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
      <div className="eg-row between">
        <div>
          <div style={{ fontSize: 20, fontWeight: 680, letterSpacing: '-0.3px' }}>课程库</div>
          <div className="eg-muted">传一份资料，它会整理出章节和知识点，再把讲解、练习、复习排好。</div>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}><Icon name="plus" size={14} />新建课程</Button>
      </div>

      {catalog.length === 0 ? (
        <Section>
          <EmptyState
            title="还没有课程"
            text="新建一门课，把 PDF、Word、PPT、Markdown 或图片拖进来。整理完会自动得到知识点先后的关系图和学习计划。"
            action={<Button variant="primary" onClick={() => setCreating(true)}>创建第一门课程</Button>}
          />
        </Section>
      ) : (
        <div className="eg-grid cols-3">
          {catalog.map((course) => (
            <div key={course.id} className="eg-course-card" onClick={() => onOpen(course.id)} role="button" tabIndex={0}
              onKeyDown={(event) => { if (event.key === 'Enter') onOpen(course.id) }}>
              <div className="eg-row between">
                <div className="eg-course-name eg-ellipsis">{course.name}</div>
                <button type="button" className="eg-btn ghost sm" title="删掉课程"
                  onClick={(event) => { event.stopPropagation(); setPendingDelete(course) }}>
                  <Icon name="trash" size={13} />
                </button>
              </div>
              <div className="eg-course-meta">
                {course.subject ? <span>{course.subject}</span> : null}
                <span>{course.documentCount} 份资料</span>
                <span>{course.conceptCount} 个概念</span>
                {course.examDate ? <span>考试 {course.examDate}</span> : null}
              </div>
              <div className="eg-course-ring">
                <div className="eg-fill"><Progress value={course.progress / 100} /></div>
                <span className="eg-muted eg-nowrap">{course.progress}%</span>
              </div>
              <div className="eg-muted">
                {course.lastStudiedAt ? `上次学到：${formatDate(course.lastStudiedAt)}` : '还没开始'}
              </div>
            </div>
          ))}
        </div>
      )}

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
          <Field label="每天可学习时间（分钟）">
            <input className="eg-input" type="number" min={10} max={480} value={form.dailyMinutes}
              onChange={(event) => setForm({ ...form, dailyMinutes: Number(event.target.value) })} />
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
