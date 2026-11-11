/** 学习设置：课程信息、学习档案、资料重算与危险操作。 */
import { useEffect, useState } from 'react'
import { api } from '../api'
import { Button, Field, Icon, Modal, Section, useResource } from '../ui'

export function SettingsView({ courseId, revision, notify, onChanged, onDeleted }: {
  courseId: string
  revision: number
  notify: (message: string) => void
  onChanged: () => void
  onDeleted: () => void
}) {
  const { data } = useResource(() => api.getCourse(courseId), [courseId, revision])
  const health = useResource(() => api.health(), [])
  const [form, setForm] = useState({ name: '', subject: '', goal: '', level: 'unknown', examDate: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (!data?.course) return
    setForm({
      name: data.course.name ?? '',
      subject: data.course.subject ?? '',
      goal: data.profile?.goal ?? data.course.goal ?? '',
      level: data.profile?.level ?? 'unknown',
      examDate: data.profile?.examDate ?? '',
      notes: data.profile?.notes ?? '',
    })
  }, [data?.course?.id, data?.updatedAt])

  const save = async () => {
    setSaving(true)
    try {
      await api.updateCourse(courseId, {
        name: form.name, subject: form.subject, goal: form.goal,
        level: form.level, examDate: form.examDate,
        notes: form.notes,
      })
      notify('记下了')
      onChanged()
    } catch (error: any) {
      notify(error?.message ?? '保存失败')
    } finally { setSaving(false) }
  }

  const reanalyze = async () => {
    setAnalyzing(true)
    try {
      const result = await api.analyze(courseId)
      notify(`已重新分析：${result.chapters ?? 0} 章节、${result.concepts ?? 0} 概念`)
      onChanged()
    } catch (error: any) {
      notify(error?.message ?? '分析失败')
    } finally { setAnalyzing(false) }
  }

  const remove = async () => {
    try {
      await api.deleteCourse(courseId)
      notify('课程已删除')
      setConfirmDelete(false)
      onDeleted()
    } catch (error: any) {
      notify(error?.message ?? '删除失败')
    }
  }

  return (
    <div className="eg-grid" style={{ gap: 16 }}>
      <Section title="课程信息">
        <div className="eg-grid cols-2">
          <Field label="课程名称">
            <input className="eg-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="学科">
            <input className="eg-input" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="你的学习情况" hint="这些会影响讲解深度和章节顺序">
        <Field label="学习目标">
          <textarea className="eg-textarea" style={{ minHeight: 64 }} value={form.goal}
            onChange={(event) => setForm({ ...form, goal: event.target.value })} />
        </Field>
        <div className="eg-grid cols-2">
          <Field label="基础水平">
            <select className="eg-select" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}>
              <option value="unknown">未说明</option>
              <option value="beginner">零基础</option>
              <option value="intermediate">有些基础</option>
              <option value="advanced">较熟练</option>
            </select>
          </Field>
          <Field label="考试 / 截止日期（可选）">
            <input className="eg-input" type="date" value={form.examDate}
              onChange={(event) => setForm({ ...form, examDate: event.target.value })} />
          </Field>
        </div>
        <Field label="其它说明" hint="例如：只能晚上学、希望多做计算题、需要英文术语对照。">
          <textarea className="eg-textarea" style={{ minHeight: 56 }} value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </Field>
        <div className="eg-row">
          <Button variant="primary" loading={saving} onClick={save}>保存设置</Button>
          <Button onClick={reanalyze} loading={analyzing}><Icon name="refresh" size={13} />重新分析资料</Button>
        </div>
      </Section>

      <Section title="东西存在哪" hint="课程、答题、复习记录都在你自己电脑上，不上传">
        <div className="eg-muted eg-mono" style={{ wordBreak: 'break-all' }}>
          {health.data?.storage ?? '（服务未就绪）'}
        </div>
      </Section>

      <Section title="想重来">
        <div className="eg-row between">
          <div>
            <div className="eg-list-title">删掉这门课</div>
            <div className="eg-muted">章节、知识点、计划和答题记录会一起清空。</div>
          </div>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={13} />删掉课程</Button>
        </div>
      </Section>

      {confirmDelete ? (
        <Modal title="真要删掉这门课？" onClose={() => setConfirmDelete(false)}
          footer={<>
            <Button onClick={() => setConfirmDelete(false)}>取消</Button>
            <Button variant="danger" onClick={remove}>删掉</Button>
          </>}>
          <div>删掉「{form.name}」之后找不回来了。</div>
        </Modal>
      ) : null}
    </div>
  )
}
