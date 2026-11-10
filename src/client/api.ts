/** EduGraph 浏览器侧数据访问：全部走本机插件的 HTTP 接口。 */

export const API = '/plugins/edugraph-learning/api'

export type Course = {
  id: string; name: string; subject: string; goal: string; status: string
  createdAt?: string; updatedAt?: string
}
export type CourseListItem = Course & {
  documentCount: number; conceptCount: number; masteredCount: number
  taskCount: number; doneCount: number; progress: number; lastStudiedAt: string | null; examDate: string
}
export type DocumentItem = {
  id: string; filename: string; parser: string; status: string; pages: number
  charCount: number; error: string | null; uploadedAt: string; size?: number; warnings?: string[]
}
export type Chapter = {
  id: string; title: string; level: number; order: number; pageFrom: number; pageTo: number
  conceptCount?: number; conceptIds?: string[]; summary?: string; mastery?: number; masteredCount?: number
}
export type Concept = {
  id: string; name: string; definition: string; chapterId: string | null
  confidence: number; sourceRefs?: SourceRef[]; tags?: string[]
}
export type SourceRef = { documentId: string; pageNo: number; blockId?: string; quote: string }
export type Relation = { id: string; sourceId: string; targetId: string; type: string; weight: number }
export type Task = {
  id: string; order: number; key?: string; type: string; title: string; conceptIds: string[]
  chapterId: string | null; estimatedMinutes: number; dueDate: string; status: string
  completedAt?: string | null; startedAt?: string | null; note?: string; round?: number
}
export type Plan = {
  id: string; version: number; goal: string; status: string; startDate: string; targetDate: string
  dailyMinutes: number; horizonDays: number; totalMinutes: number; tasks: Task[]
}
export type Question = {
  id: string; type: string; stem: string; options: string[]; conceptId: string
  conceptName: string; chapterId: string | null; sourceRef?: SourceRef | null; mode?: string
}
export type Overview = {
  course: Course
  profile: { goal: string; level: string; dailyMinutes: number; examDate: string; notes?: string }
  stats: {
    documents: number; pages: number; chapters: number; concepts: number; mastered: number
    familiar: number; weak: number; untouched: number; attempts: number; accuracy: number | null
    dueToday: number; minutesDone: number; minutesTotal: number
  }
  chapters: Chapter[]
  weakConcepts: { id: string; name: string; mastery: number; level: string }[]
  dueReviews: { conceptId: string; name: string; due: number; mastery: number }[]
  planProgress: { total: number; done: number; remaining: number; dueToday: number; percent: number; minutesDone: number; minutesTotal: number }
  nextTasks: { id: string; title: string; type: string; dueDate: string; estimatedMinutes: number; conceptIds: string[]; order: number }[]
  today: { attempts: number; avgScore: number | null }
  events: { id: string; type: string; conceptId: string | null; conceptName: string; createdAt: string; evidence: any }[]
  updatedAt: string
}
export type GraphData = {
  nodes: { id: string; name: string; chapterId: string | null; definition: string; confidence: number; mastery: number; level: string; attempts: number; sourceCount: number }[]
  edges: { id: string; source: string; target: string; type: string; weight: number }[]
  chapters: { id: string; title: string; level: number; order: number; conceptCount: number }[]
}
export type LessonCard = {
  id: string; name: string; definition: string; chapterTitle: string; confidence: number
  mastery: number; level: string; attempts: number; sourceRefs: SourceRef[]
  related: { conceptId: string; name: string; type: string }[]
}
export type LessonData = {
  task: Task | null
  cards: LessonCard[]
  chapterTitle: string
  recallPrompt: string
  dueCount: number
}
export type GradeResult = {
  grade: { score: number; correct: boolean; errorTags: string[]; explanation: string; expected: string; correctAnswer: string; options: string[] }
  attempt: { id: string; score: number; correct: boolean }
  rating: number
  review: { due: number; stability: number; state: string }
  state: { mastery: number; level: string; attempts: number } | null
}

export class ApiError extends Error {
  status: number
  code: string
  constructor(message: string, status = 500, code = 'error') {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const text = await response.text()
  let payload: any = null
  try { payload = text ? JSON.parse(text) : null } catch { payload = null }
  if (!response.ok || payload?.ok === false) {
    throw new ApiError(payload?.error ?? `请求失败（${response.status}）`, response.status, payload?.code ?? 'http-error')
  }
  return payload as T
}

/** 某页渲染成图片的地址（PDF 电路图、波形都靠它显示）。 */
export function figureUrl(courseId: string, documentId: string, pageNo: number) {
  return `${API}/courses/${courseId}/documents/${documentId}/pages/${pageNo}/image`
}

/** Office 内嵌图片地址。 */
export function mediaUrl(courseId: string, documentId: string, index: number) {
  return `${API}/courses/${courseId}/documents/${documentId}/media/${index}`
}

export const api = {
  health: () => request<{ ok: boolean; version: string; storage: string }>('/health'),
  listCourses: () => request<{ courses: CourseListItem[]; lastCourseId: string | null; profile: any }>('/courses'),
  createCourse: (body: { name: string; subject?: string; goal?: string }) =>
    request<any>('/courses', { method: 'POST', body: JSON.stringify(body) }),
  getCourse: (id: string) => request<any>(`/courses/${id}`),
  updateCourse: (id: string, body: any) => request<any>(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCourse: (id: string) => request<any>(`/courses/${id}`, { method: 'DELETE' }),
  overview: (id: string) => request<{ ok: boolean } & Overview>(`/courses/${id}/overview`),
  graph: (id: string) => request<{ ok: boolean } & GraphData>(`/courses/${id}/graph`),
  documents: (id: string) => request<{ ok: boolean; documents: DocumentItem[] }>(`/courses/${id}/documents`),
  uploadDocument: async (id: string, file: File) => {
    const response = await fetch(`${API}/courses/${id}/documents?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || payload?.ok === false) throw new ApiError(payload?.error ?? '上传失败', response.status)
    return payload as { ok: boolean; document: DocumentItem }
  },
  deleteDocument: (id: string, docId: string) => request<any>(`/courses/${id}/documents/${docId}`, { method: 'DELETE' }),
  documentPages: (id: string, docId: string, from: number, count = 2) =>
    request<{ ok: boolean; pages: any[]; totalPages: number; filename: string }>(`/courses/${id}/documents/${docId}/pages?from=${from}&count=${count}`),
  analyze: (id: string) => request<any>(`/courses/${id}/analyze`, { method: 'POST', body: '{}' }),
  plan: (id: string) => request<{ ok: boolean; plan: Plan | null; progress: any; next: Task[]; profile: any }>(`/courses/${id}/plan`),
  generatePlan: (id: string, body: any) => request<any>(`/courses/${id}/plan/generate`, { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: string, taskId: string, body: any) =>
    request<any>(`/courses/${id}/plan/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  lesson: (id: string, taskId?: string) =>
    request<{ ok: boolean } & LessonData>(`/courses/${id}/lesson${taskId ? `?taskId=${encodeURIComponent(taskId)}` : ''}`),
  createQuiz: (id: string, body: any) => request<{ ok: boolean; questions: Question[]; count: number; mode: string }>(`/courses/${id}/quiz`, { method: 'POST', body: JSON.stringify(body) }),
  answer: (id: string, body: { questionId: string; answer: string | number; mode?: string; taskId?: string }) =>
    request<{ ok: boolean } & GradeResult>(`/courses/${id}/quiz/answer`, { method: 'POST', body: JSON.stringify(body) }),
  mistakes: (id: string) => request<{ ok: boolean; groups: any[]; total: number; conceptCount: number }>(`/courses/${id}/mistakes`),
  reviews: (id: string) => request<{ ok: boolean; due: any[]; upcoming: any[]; counts: { due: number; upcoming: number } }>(`/courses/${id}/reviews`),
  gradeReview: (id: string, conceptId: string, rating: number) =>
    request<any>(`/courses/${id}/reviews/${conceptId}/grade`, { method: 'POST', body: JSON.stringify({ rating }) }),
  search: (id: string, q: string, limit = 12) =>
    request<{ ok: boolean; results: { id: string; score: number; snippet: string; meta: any }[] }>(`/courses/${id}/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  event: (id: string, body: any) => request<any>(`/courses/${id}/events`, { method: 'POST', body: JSON.stringify(body) }),
  getState: () => request<{ ok: boolean; state: any }>('/state'),
  saveState: (patch: any) => request<{ ok: boolean; state: any }>('/state', { method: 'PUT', body: JSON.stringify(patch) }),
  getProfile: () => request<{ ok: boolean; profile: any }>('/profile'),
  saveProfile: (patch: any) => request<{ ok: boolean; profile: any }>('/profile', { method: 'PUT', body: JSON.stringify(patch) }),
}

/** 把时间戳格式化成「今天 14:32 / 3 天后」。 */
export function formatDue(due: number | null | undefined): string {
  if (!due) return '未安排'
  const raw = due - Date.now()
  if (raw <= 0 && raw > -3600000) return '现在'
  const minutes = Math.round(raw / 60000)
  if (raw > 0 && minutes < 60) return `${minutes} 分钟后`
  const diff = Math.round(raw / 86400000)
  if (diff < -1) return `逾期 ${Math.abs(diff)} 天`
  if (diff === -1) return '逾期 1 天'
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  return `${diff} 天后`
}

/** 掌握度文字。 */
export function masteryLabel(level: string): { text: string; tone: string } {
  switch (level) {
    case 'mastered': return { text: '已掌握', tone: 'success' }
    case 'familiar': return { text: '熟悉', tone: 'business' }
    case 'learning': return { text: '学习中', tone: 'warn' }
    default: return { text: '薄弱', tone: 'error' }
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getMonth() + 1}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
