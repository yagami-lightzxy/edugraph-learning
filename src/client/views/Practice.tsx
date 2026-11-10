/** 讲解 / 练习 / 错题 / 复习 四个学习动作视图。 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  api, figureUrl, formatDue, masteryLabel, type GradeResult, type LessonData, type Question,
} from '../api'
import type { QuizRequest } from '../index'
import {
  Badge, Button, EmptyState, ErrorBox, FigureModal, Icon, Loading, Modal, Progress, Section, useResource,
} from '../ui'
import { askTutor, conceptAsk, groupAsk, mistakeAsk, recallAsk } from '../tutor'

// ---------------------------------------------------------------- 讲解

export function LessonView({ courseId, revision, onChanged, notify, onPractice }: {
  courseId: string
  revision: number
  onChanged: () => void
  notify: (message: string) => void
  onPractice: (request: QuizRequest) => void
}) {
  const [taskId, setTaskId] = useState<string>('')
  const planResource = useResource(() => api.plan(courseId), [courseId, revision])
  const pending = (planResource.data?.plan?.tasks ?? []).filter((task) => task.status !== 'done' && task.status !== 'skipped')
  const { data, error, loading, reload } = useResource(
    () => api.lesson(courseId, taskId || undefined),
    [courseId, revision, taskId],
  )
  const lesson = data as (LessonData & { ok: boolean }) | null
  const [recall, setRecall] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [rating, setRating] = useState(false)
  const [figure, setFigure] = useState<{ src: string; title: string } | null>(null)

  useEffect(() => { setRecall(''); setRevealed(false) }, [data?.task?.id])

  const complete = async () => {
    if (!lesson?.task) { notify('没有可完成的任务'); return }
    try {
      await api.updateTask(courseId, lesson.task.id, { status: 'done' })
      notify('任务已完成，已按计划推进')
      onChanged()
      await reload(true)
    } catch (err: any) { notify(err?.message ?? '更新失败') }
  }

  const selfRate = async (value: number) => {
    if (!lesson?.cards?.length) return
    setRating(true)
    try {
      for (const card of lesson.cards) await api.gradeReview(courseId, card.id, value)
      if (recall.trim()) {
        await api.event(courseId, {
          type: 'recall', conceptId: lesson.cards[0].id,
          evidence: `回忆：${recall.slice(0, 800)}`,
          taskId: lesson.task?.id ?? null,
        })
      }
      notify('已记录本次回忆与复习时间')
      onChanged()
      await reload(true)
    } catch (err: any) { notify(err?.message ?? '记录失败') } finally { setRating(false) }
  }

  if (loading && !lesson) return <Loading />
  if (error) return <ErrorBox error={error} />
  if (!lesson) return null

  if (!lesson.cards.length) {
    return (
      <Section>
        <EmptyState
          title="还没有可讲解的知识点"
          text={pending.length ? '这个任务还没有关联概念——先在「计划」里重新生成，或到「图谱」里选一个知识点。' : '先上传资料并生成计划，讲解页会按计划带出这一组知识点。'}
        />
      </Section>
    )
  }

  const task = lesson.task
  return (
    <div className="eg-grid" style={{ gap: 16 }}>
      <div className="eg-row between">
        <div>
          <div style={{ fontSize: 17, fontWeight: 650 }}>{task?.title ?? '自由学习'}</div>
          <div className="eg-muted">
            {lesson.chapterTitle ? `${lesson.chapterTitle} · ` : ''}
            {lesson.cards.length} 个知识点
            {task ? ` · 计划 ${task.dueDate} · ${task.estimatedMinutes} 分钟` : ''}
          </div>
        </div>
        <div className="eg-row">
          {pending.length > 1 ? (
            <select className="eg-select" style={{ width: 'auto' }} value={taskId} onChange={(event) => setTaskId(event.target.value)}>
              <option value="">下一个任务</option>
              {pending.slice(0, 30).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          ) : null}
          <Button size="sm" onClick={() => onPractice({ mode: 'practice', taskId: task?.id ?? null, conceptIds: lesson.cards.map((card) => card.id) })}>
            <Icon name="quiz" size={13} />练习这一组
          </Button>
          {task ? <Button size="sm" variant="primary" onClick={complete}><Icon name="check" size={13} />标记完成</Button> : null}
        </div>
      </div>

      {lesson.cards.map((card) => (
        <article key={card.id} className="eg-concept-card">
          <div className="eg-row between">
            <div className="eg-concept-name">{card.name}</div>
            <div className="eg-row">
              <Badge tone={masteryLabel(card.level).tone}>{masteryLabel(card.level).text}</Badge>
              <span className="eg-muted">{Math.round(card.mastery * 100)}%</span>
              <Button size="sm" variant="ghost" className="eg-ask" title="带着这个知识点去问右侧 AI 导师"
                onClick={() => askTutor(conceptAsk(card.name, card.definition), card.name)}>
                <Icon name="chat" size={13} />问导师
              </Button>
              {card.sourceRefs[0]?.pageNo ? (
                <Button size="sm" variant="ghost" title="把这一页画出来看"
                  onClick={() => setFigure({
                    src: figureUrl(courseId, card.sourceRefs[0].documentId, card.sourceRefs[0].pageNo),
                    title: `${card.name} · 第 ${card.sourceRefs[0].pageNo} 页`,
                  })}>
                  <Icon name="layers" size={13} />看原文图
                </Button>
              ) : null}
            </div>
          </div>
          {card.definition ? <div className="eg-concept-def">{card.definition}</div> : (
            <div className="eg-muted">资料里没有找到明确定义，请展开下方原文自行确认。</div>
          )}
          {card.sourceRefs.length ? (
            <details>
              <summary className="eg-muted" style={{ cursor: 'pointer' }}>来源原文（{card.sourceRefs.length}）</summary>
              <div className="eg-grid" style={{ gap: 8, marginTop: 8 }}>
                {card.sourceRefs.map((ref, index) => (
                  <div key={index} className="eg-quote">
                    {ref.quote}
                    <div className="eg-quote-source">第 {ref.pageNo ?? '?'} 页</div>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
          {card.related.length ? (
            <div className="eg-related">
              {card.related.map((item) => (
                <Badge key={item.conceptId} tone={item.type === 'prerequisite' ? 'warn' : 'business'}>
                  {item.type === 'prerequisite' ? '前置' : '相关'}：{item.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </article>
      ))}

      <Section title="先别看书，回忆一下" hint="写不出来很正常，这一步就是在帮你记住">
        <div className="eg-quote">{lesson.recallPrompt}</div>
        <textarea className="eg-textarea" value={recall} placeholder="用自己的话写下来（写不出来也没关系，这是记忆检测）"
          onChange={(event) => setRecall(event.target.value)} />
        <div className="eg-row">
          <Button size="sm" onClick={() => setRevealed(true)}>对照答案</Button>
          <Button size="sm" variant="ghost" className="eg-ask" title="让导师用问题引导你回忆"
            onClick={() => askTutor(recallAsk(lesson.cards.map((card) => card.name), lesson.recallPrompt), '这组知识点')}>
            <Icon name="chat" size={13} />问导师
          </Button>
          {revealed ? (
            <>
              <span className="eg-muted">回忆质量：</span>
              <Button size="sm" variant="danger" loading={rating} onClick={() => selfRate(1)}>忘了</Button>
              <Button size="sm" loading={rating} onClick={() => selfRate(2)}>模糊</Button>
              <Button size="sm" variant="primary" loading={rating} onClick={() => selfRate(3)}>记住了</Button>
              <Button size="sm" variant="primary" loading={rating} onClick={() => selfRate(4)}>很熟</Button>
            </>
          ) : null}
        </div>
        {revealed ? (
          <div className="eg-feedback" data-tone="success">
            <div className="eg-feedback-title"><Icon name="check" size={14} />对照参考答案</div>
            {lesson.cards.map((card) => (
              <div key={card.id}><b>{card.name}</b>：{card.definition || '（资料里没给定义，可以翻原文）'}</div>
            ))}
          </div>
        ) : null}
      </Section>
      {figure ? <FigureModal src={figure.src} title={figure.title} hint="电路图、波形这类内容文字里没有，需要看整页渲染图" onClose={() => setFigure(null)} /> : null}
    </div>
  )
}

// ---------------------------------------------------------------- 练习

type QuizState = {
  questions: Question[]
  index: number
  answer: string
  result: GradeResult | null
  results: { question: Question; result: GradeResult }[]
}

export function QuizView({ courseId, request, onChanged, notify, onOpenLesson, onOpenReview }: {
  courseId: string
  request: QuizRequest
  onChanged: () => void
  notify: (message: string) => void
  onOpenLesson: () => void
  onOpenReview: () => void
}) {
  const [state, setState] = useState<QuizState>({ questions: [], index: 0, answer: '', result: null, results: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const startedAt = useRef<number>(Date.now())

  const start = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.createQuiz(courseId, {
        conceptIds: request.conceptIds ?? null,
        taskId: request.taskId ?? null,
        mode: request.mode,
        count: request.count ?? (request.mode === 'review' ? 6 : 5),
        strategy: request.mode === 'review' ? 'weak' : 'auto',
      })
      setState({ questions: data.questions, index: 0, answer: '', result: null, results: [] })
      startedAt.current = Date.now()
      if (!data.questions.length) setError(new Error('这批知识点还生成不出题目，先补充资料或换个知识点试试。'))
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [courseId, request.conceptIds, request.taskId, request.mode, request.count])

  useEffect(() => { void start() }, [start])

  const question = state.questions[state.index] ?? null

  const submit = async (value?: string) => {
    if (!question || state.result) return
    const answer = value ?? state.answer
    if (answer === '' || answer === undefined) { notify('先作答再提交'); return }
    setSubmitting(true)
    try {
      const result = await api.answer(courseId, {
        questionId: question.id,
        answer,
        mode: request.mode,
        taskId: request.taskId ?? undefined,
      })
      setState((prev) => ({ ...prev, result, results: [...prev.results, { question, result }] }))
      onChanged()
    } catch (err: any) {
      notify(err?.message ?? '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const next = () => {
    setState((prev) => ({ ...prev, index: prev.index + 1, answer: '', result: null }))
  }

  // 键盘：1-4 选选项，Enter 提交 / 下一题
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target && ['INPUT', 'TEXTAREA'].includes(target.tagName)
      if (event.key === 'Enter' && !event.shiftKey) {
        if (state.result) { event.preventDefault(); next() }
        else if (!typing) { event.preventDefault(); void submit() }
        return
      }
      if (typing || state.result || !question?.options?.length) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < question.options.length) {
        event.preventDefault()
        void submit(String(index))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (loading) return <Loading text="正在准备题目…" />
  if (error) {
    return (
      <Section>
        <ErrorBox error={error} />
        <div className="eg-row"><Button onClick={() => { void start() }}>重试</Button><Button variant="ghost" onClick={onOpenLesson}>回到讲解</Button></div>
      </Section>
    )
  }

  const done = state.index >= state.questions.length
  if (done) {
    const total = state.results.length
    const correct = state.results.filter((item) => item.result.grade.correct).length
    const avg = total ? state.results.reduce((sum, item) => sum + item.result.grade.score, 0) / total : 0
    const weak = state.results.filter((item) => !item.result.grade.correct).map((item) => item.question.conceptName)
    return (
      <div className="eg-grid" style={{ gap: 16 }}>
        <Section title="这组做完了">
          <div className="eg-grid cols-3">
            <div className="eg-stat"><div className="eg-stat-value">{correct}/{total}</div><div className="eg-stat-label">答对几道</div></div>
            <div className="eg-stat"><div className="eg-stat-value">{Math.round(avg * 100)}%</div><div className="eg-stat-label">平均正确率</div></div>
            <div className="eg-stat"><div className="eg-stat-value">{new Set(weak).size}</div><div className="eg-stat-label">还要再看的知识点</div></div>
          </div>
          {weak.length ? (
            <div className="eg-wrap">
              {[...new Set(weak)].map((name) => <Badge key={name} tone="error">{name}</Badge>)}
            </div>
          ) : <div className="eg-feedback" data-tone="success"><div className="eg-feedback-title"><Icon name="check" size={14} />都答对了，复习时间已经按表现排好</div></div>}
          <div className="eg-row">
            <Button variant="primary" onClick={() => { void start() }}><Icon name="repeat" size={13} />再来一组</Button>
            <Button onClick={onOpenLesson}>回到讲解</Button>
            <Button variant="ghost" onClick={onOpenReview}>查看复习计划</Button>
          </div>
        </Section>
        <Section title="逐题回顾">
          <div className="eg-list">
            {state.results.map((item, index) => (
              <div key={index} className="eg-list-row" style={{ cursor: 'default' }}>
                <span className="eg-dot" data-tone={item.result.grade.correct ? 'success' : 'error'} />
                <span className="eg-list-main">
                  <span className="eg-list-title">{item.question.conceptName} · {typeLabel(item.question.type)}</span>
                  <span className="eg-list-sub">{item.result.grade.explanation}</span>
                </span>
                <span className="eg-list-side eg-muted">{Math.round(item.result.grade.score * 100)}%</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    )
  }

  const result = state.result
  const correctIndex = result ? Number(result.grade.correctAnswer) : -1
  return (
    <div className="eg-grid" style={{ gap: 16 }}>
      <div className="eg-row between">
        <div className="eg-row">
          <Badge tone="brand">{request.mode === 'review' ? '复习' : '练习'}</Badge>
          <span className="eg-muted">{state.index + 1} / {state.questions.length}</span>
        </div>
        <div className="eg-row" style={{ width: 160 }}>
          <Progress value={state.index / state.questions.length} />
        </div>
      </div>

      <Section>
        <div className="eg-row between">
          <div className="eg-muted">{question?.conceptName} · {typeLabel(question?.type ?? '')}</div>
          {result ? <Badge tone={result.grade.correct ? 'success' : 'error'}>{result.grade.correct ? '答对' : '答错'} · {Math.round(result.grade.score * 100)}%</Badge> : null}
        </div>
        <div className="eg-quiz-stem">{question?.stem}</div>

        {question && question.options.length ? (
          <div className="eg-grid" style={{ gap: 8 }}>
            {question.options.map((option, index) => {
              let status: 'correct' | 'wrong' | undefined
              if (result) {
                if (index === correctIndex) status = 'correct'
                else if (String(index) === state.answer) status = 'wrong'
              }
              return (
                <button key={index} type="button" className="eg-option" data-state={status}
                  disabled={Boolean(result)}
                  onClick={() => { setState((prev) => ({ ...prev, answer: String(index) })); void submit(String(index)) }}>
                  <span className="eg-option-key">{index + 1}</span>
                  <span>{option}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <textarea className="eg-textarea" value={state.answer} disabled={Boolean(result)}
            placeholder={question?.type === 'cloze' ? '填空：写下这个术语' : '用自己的话回答'}
            onChange={(event) => setState((prev) => ({ ...prev, answer: event.target.value }))} />
        )}

        {result ? (
          <div className="eg-feedback" data-tone={result.grade.correct ? 'success' : 'error'}>
            <div className="eg-feedback-title">
              <Icon name={result.grade.correct ? 'check' : 'flag'} size={14} />
              {result.grade.correct ? '答对了' : '这题没对，看看为什么'}
            </div>
            {result.grade.correctAnswer
              ? <div><b>参考答案：</b>{answerText(result.grade.correctAnswer, result.grade.options)}</div>
              : null}
            <div>{result.grade.explanation}</div>
            {result.grade.errorTags?.length ? (
              <div className="eg-wrap">{result.grade.errorTags.map((tag) => <Badge key={tag} tone="warn">{tag}</Badge>)}</div>
            ) : null}
            <div className="eg-muted">
              熟练度 {Math.round((result.state?.mastery ?? 0) * 100)}% · 下次安排在今天之后 {formatDue(result.review?.due)}
            </div>
            {question ? (
              <div className="eg-row" style={{ marginTop: 2 }}>
                <Button size="sm" variant="ghost" className="eg-ask"
                  onClick={() => {
                    const myAnswer = question.options.length ? answerText(state.answer, question.options) : state.answer
                    const expected = result.grade.correctAnswer
                      ? answerText(result.grade.correctAnswer, result.grade.options)
                      : result.grade.expected
                    askTutor(
                      result.grade.correct ? conceptAsk(question.conceptName, result.grade.explanation) : mistakeAsk(question, myAnswer, expected),
                      question.conceptName,
                    )
                  }}>
                  <Icon name="chat" size={13} />{result.grade.correct ? '问导师：再讲深一点' : '问导师：为什么错'}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="eg-row">
          {!result ? (
            <>
              <Button variant="primary" loading={submitting} disabled={!state.answer} onClick={() => { void submit() }}>
                提交（Enter）
              </Button>
              <Button variant="ghost" onClick={() => next()}>跳过</Button>
            </>
          ) : (
            <Button variant="primary" onClick={next}>
              {state.index + 1 >= state.questions.length ? '查看结果' : '下一题'}<Icon name="arrow-right" size={13} />
            </Button>
          )}
          <span className="eg-muted eg-right">键盘：1-{question?.options.length || 4} 选择 · Enter 提交 / 下一题</span>
        </div>
      </Section>
    </div>
  )
}

/** 选择题的答案是选项下标，展示时换成选项文本。 */
function answerText(answer: string, options: string[]) {
  const index = Number(answer)
  if (Array.isArray(options) && options.length && Number.isInteger(index) && options[index] !== undefined) {
    return options[index]
  }
  return answer
}

function typeLabel(type: string) {
  return { choice: '选择题', 'choice-reverse': '反向选择', cloze: '填空题', judge: '判断题', short: '简答题' }[type] ?? type
}

// ---------------------------------------------------------------- 错题

export function MistakesView({ courseId, revision, notify, onPractice }: {
  courseId: string
  revision: number
  notify: (message: string) => void
  onPractice: (conceptIds: string[]) => void
}) {
  const { data, error, loading } = useResource(() => api.mistakes(courseId), [courseId, revision])
  if (loading && !data) return <Loading />
  if (error) return <ErrorBox error={error} />
  const groups = data?.groups ?? []
  if (!groups.length) {
    return <Section><EmptyState title="还没有错题" text="练习里答错的知识点会自动收到这里，还会告诉你错在哪一步。" /></Section>
  }
  return (
    <div className="eg-grid" style={{ gap: 16 }}>
      <div className="eg-row between">
        <div>
          <div style={{ fontSize: 17, fontWeight: 650 }}>错题本</div>
          <div className="eg-muted">错了 {data.total} 次，涉及 {data.conceptCount} 个知识点</div>
        </div>
        <Button size="sm" variant="primary" onClick={() => onPractice(groups.slice(0, 6).map((group: any) => group.conceptId))}>
          <Icon name="repeat" size={13} />把这些再练一遍
        </Button>
      </div>
      <div className="eg-grid" style={{ gap: 12 }}>
        {groups.map((group: any) => (
          <Section key={group.conceptId}
            title={group.conceptName}
            hint={`错 ${group.wrongCount} 次 · 最近 ${formatDue(new Date(group.lastAt).getTime())}`}
            actions={<>
              <Button size="sm" variant="ghost" className="eg-ask"
                onClick={() => askTutor(groupAsk(group.conceptName, group.definition, (group.errorTags ?? []).map((tag: any) => tag.tag)), group.conceptName)}>
                <Icon name="chat" size={13} />问导师
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onPractice([group.conceptId])}>重做</Button>
            </>}>
            {group.definition ? <div className="eg-concept-def" style={{ fontSize: 12 }}>{group.definition}</div> : null}
            <div className="eg-wrap">
              {group.errorTags.map((tag: any) => <Badge key={tag.tag} tone="warn">{tag.tag} ×{tag.count}</Badge>)}
            </div>
            <div className="eg-list">
              {group.attempts.map((attempt: any) => (
                <div key={attempt.id} className="eg-list-row" style={{ cursor: 'default' }}>
                  <span className="eg-list-main">
                    <span className="eg-list-title eg-ellipsis">我的答案：{attempt.answer || '（空）'}</span>
                    <span className="eg-list-sub">{attempt.errorTags?.join(' · ') || '—'}</span>
                  </span>
                  <span className="eg-list-side eg-muted">{Math.round((attempt.score ?? 0) * 100)}%</span>
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- 复习

export function ReviewView({ courseId, revision, notify, onChanged, onPractice }: {
  courseId: string
  revision: number
  notify: (message: string) => void
  onChanged: () => void
  onPractice: (conceptIds: string[]) => void
}) {
  const { data, error, loading, reload } = useResource(() => api.reviews(courseId), [courseId, revision])
  const [grading, setGrading] = useState<string | null>(null)

  const rate = async (conceptId: string, value: number) => {
    setGrading(conceptId)
    try {
      await api.gradeReview(courseId, conceptId, value)
      notify('已更新下次复习时间')
      onChanged()
      await reload(true)
    } catch (err: any) { notify(err?.message ?? '更新失败') } finally { setGrading(null) }
  }

  if (loading && !data) return <Loading />
  if (error) return <ErrorBox error={error} />
  const due = data?.due ?? []
  const upcoming = data?.upcoming ?? []

  return (
    <div className="eg-grid" style={{ gap: 16 }}>
      <div className="eg-row between">
        <div>
          <div style={{ fontSize: 17, fontWeight: 650 }}>复习</div>
          <div className="eg-muted">{due.length} 个今天该复习 · {upcoming.length} 个以后再说（按记忆曲线排的）</div>
        </div>
        {due.length ? (
          <div className="eg-row">
            <Button size="sm" variant="ghost" className="eg-ask"
              onClick={() => askTutor(recallAsk(due.slice(0, 8).map((item: any) => item.name), '我今天要复习这些到期知识点，请先各用一个问题考我，别先给答案。'), '复习')}>
              <Icon name="chat" size={13} />问导师
            </Button>
            <Button size="sm" variant="primary" onClick={() => onPractice(due.slice(0, 10).map((item: any) => item.conceptId))}>
              <Icon name="repeat" size={13} />开始复习（{Math.min(10, due.length)}）
            </Button>
          </div>
        ) : null}
      </div>

      {due.length === 0 ? (
        <Section><EmptyState title="今天没有该复习的" text="做完练习或标记「记住了」，系统会自己安排下次复习时间。" /></Section>
      ) : (
        <div className="eg-list">
          {due.map((item: any) => (
            <div key={item.conceptId} className="eg-list-row" style={{ cursor: 'default' }}>
              <span className="eg-dot" data-tone={item.overdueDays > 2 ? 'error' : 'warn'} />
              <span className="eg-list-main">
                <span className="eg-list-title">{item.name}</span>
                <span className="eg-list-sub">{item.overdueDays > 0 ? `逾期 ${item.overdueDays} 天` : '今天到期'} · 掌握度 {Math.round(item.mastery * 100)}%</span>
              </span>
              <span className="eg-list-side">
                <Button size="sm" variant="danger" loading={grading === item.conceptId} onClick={() => rate(item.conceptId, 1)}>忘了</Button>
                <Button size="sm" loading={grading === item.conceptId} onClick={() => rate(item.conceptId, 2)}>困难</Button>
                <Button size="sm" variant="primary" loading={grading === item.conceptId} onClick={() => rate(item.conceptId, 3)}>记住了</Button>
              </span>
            </div>
          ))}
        </div>
      )}

      <Section title="后面要复习的" hint="按时间排">
        {upcoming.length ? (
          <div className="eg-list">
            {upcoming.map((item: any) => (
              <div key={item.conceptId} className="eg-list-row" style={{ cursor: 'default' }}>
                <span className="eg-dot" data-tone="brand" />
                <span className="eg-list-main">
                  <span className="eg-list-title">{item.name}</span>
                  <span className="eg-list-sub">掌握度 {Math.round(item.mastery * 100)}% · 稳定性 {item.stability?.toFixed?.(1) ?? item.stability} 天</span>
                </span>
                <span className="eg-list-side eg-muted">{formatDue(item.due)}</span>
              </div>
            ))}
          </div>
        ) : <div className="eg-muted">还没有排期，先做几道题。</div>}
      </Section>
    </div>
  )
}
