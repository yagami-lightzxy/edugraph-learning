/**
 * EduGraph AI · Agent 工具。
 *
 * 这些工具让 DSH 原生对话里的模型直接操作学习系统：读大纲与原文、检索资料、
 * 维护概念与关系、生成与更新计划、出题与判分、记录学习证据、查询掌握度与到期复习。
 * 工具只做领域操作，教学策略写在说明里；所有写操作都返回 entity_id / version /
 * updated_at，便于界面刷新与事件追踪。
 */
import { DomainError } from './store.js'

const TEXT = (text) => [{ type: 'text', text }]

/** 输出 schema：对象根 + 开放属性。 */
const objectSchema = (properties = {}, required = []) => ({
  type: 'object',
  properties,
  ...(required.length ? { required } : {}),
  additionalProperties: true,
})

/** 工具定义工厂：补上统一的 output.render。 */
function tool({ name, description, parameters, schema, run }) {
  return {
    name,
    description,
    parameters: { type: 'object', properties: parameters, additionalProperties: false },
    output: {
      schema: schema ?? objectSchema(),
      render: (_args, value) => TEXT(typeof value === 'string' ? value : JSON.stringify(value, null, 2)),
    },
    async execute(args) {
      return run(args ?? {})
    },
  }
}

/** 解析目标课程：显式 id > 界面当前课程 > 索引最后一门 > 唯一课程。 */
async function resolveCourse(service, store, courseId) {
  if (courseId) return { id: String(courseId) }
  const state = await store.getState()
  const candidates = []
  if (state?.activeCourseId) candidates.push(state.activeCourseId)
  const index = await store.getIndex()
  if (index?.lastCourseId && !candidates.includes(index.lastCourseId)) candidates.push(index.lastCourseId)
  for (const id of candidates) {
    try {
      await store.getCourse(id)
      return { id }
    } catch { /* 继续尝试下一个候选 */ }
  }
  const courses = await store.listCourses()
  if (courses.length === 1) return { id: courses[0].id }
  if (!courses.length) throw new DomainError('还没有课程。请先在「学习」面板创建课程并上传资料。', 404, 'no-course')
  throw new DomainError(`有多门课程，请用 courseId 指定：${courses.map((c) => `${c.id}(${c.name})`).join('、')}`, 400, 'course-ambiguous')
}

/**
 * 创建全部工具定义。
 * @param {{ service: import('./service.js').LearningService, store: import('./store.js').LearningStore }} deps
 */
export function createToolDefinitions({ service, store }) {
  const list = []

  list.push(tool({
    name: 'list_courses',
    description: '看看有哪些课。返回课程 id、名字、学科、知识点数和完成度。不确定用哪门课时先调它；不传 courseId 时其他工具会自动用界面里打开的那门。',
    parameters: {},
    run: async () => {
      const { courses, lastCourseId } = await service.listCourses()
      return { courses, lastCourseId, count: courses.length }
    },
  }))

  list.push(tool({
    name: 'get_document_outline',
    description: '看这门课讲了什么：几份资料、哪些章节、在第几页。开始讲之前先看一遍，别凭印象讲。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      return service.outline(id)
    },
  }))

  list.push(tool({
    name: 'read_source',
    description: '翻原文。给文档、页码或段落 id，就能拿到那一段的原始文字。讲公式、下定义之前先核对一遍。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      documentId: { type: 'string', description: '文档 id（可省略）' },
      blockId: { type: 'string', description: '块 id（可省略）' },
      pageNo: { type: 'number', description: '页码（可省略）' },
      maxChars: { type: 'number', description: '每个块返回的最大字符数，默认 2000' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      return service.readSource(id, args)
    },
  }))

  list.push(tool({
    name: 'search_materials',
    description: '在资料里搜关键词，返回原句和出处（哪份资料、第几页）。要回答学生的问题，先搜一下，别自己编。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      query: { type: 'string', description: '检索词或问题' },
      limit: { type: 'number', description: '返回条数，默认 8' },
    },
    run: async (args) => {
      if (!String(args.query ?? '').trim()) throw new DomainError('query 不能为空', 400, 'invalid-query')
      const { id } = await resolveCourse(service, store, args.courseId)
      return service.search(id, args.query, { limit: Number(args.limit) || 8 })
    },
  }))

  list.push(tool({
    name: 'upsert_concepts',
    description: '补或改知识点。自动整理漏掉的、名字不对的、定义不准的都可以写进来；手工补的不会被自动整理覆盖掉。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      concepts: {
        type: 'array',
        description: '概念数组',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '概念名' },
            definition: { type: 'string', description: '定义或解释' },
            chapterId: { type: 'string', description: '所属章节 id（可省略）' },
            confidence: { type: 'number', description: '0-1 置信度' },
            sourceRef: {
              type: 'object',
              properties: {
                documentId: { type: 'string' },
                pageNo: { type: 'number' },
                blockId: { type: 'string' },
                quote: { type: 'string' },
              },
              additionalProperties: false,
            },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      if (!Array.isArray(args.concepts) || !args.concepts.length) throw new DomainError('concepts 不能为空数组', 400, 'invalid-concepts')
      return service.upsertConcepts(id, args.concepts)
    },
  }))

  list.push(tool({
    name: 'upsert_relations',
    description: '补知识点之间的关系：谁是前置（prerequisite）、谁相关（related）。学生问「学这个之前要会什么」时靠它。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      relations: {
        type: 'array',
        description: '关系数组，source/target 可传概念 id 或概念名',
        items: {
          type: 'object',
          properties: {
            source: { type: 'string', description: '起点概念（id 或名称）' },
            target: { type: 'string', description: '终点概念（id 或名称）' },
            type: { type: 'string', enum: ['prerequisite', 'related', 'contains', 'applies'] },
            weight: { type: 'number', description: '0-1 权重' },
          },
          required: ['source', 'target'],
          additionalProperties: false,
        },
      },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      if (!Array.isArray(args.relations) || !args.relations.length) throw new DomainError('relations 不能为空数组', 400, 'invalid-relations')
      return service.upsertRelations(id, args.relations)
    },
  }))

  list.push(tool({
    name: 'get_student_profile',
    description: '看学生的学习情况：目标是什么、基础怎样、每天能学多久、什么时候考试。排计划或决定讲多深之前先看。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      const meta = await store.getCourse(id)
      return { courseId: id, profile: meta.profile, globalProfile: await store.getProfile(), goal: meta.course.goal }
    },
  }))

  list.push(tool({
    name: 'save_student_profile',
    description: '把学生说的目标、基础和考试日期记下来。问过一次就存下来，别反复问同一个人同一件事。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      goal: { type: 'string', description: '学习目标' },
      level: { type: 'string', description: '基础水平：beginner / intermediate / advanced / unknown' },
      examDate: { type: 'string', description: '考试或截止日期 YYYY-MM-DD' },
      notes: { type: 'string', description: '其它偏好或限制' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      const { meta } = await store.mutateCourse(id, (draft) => {
        if (args.goal !== undefined) { draft.profile.goal = String(args.goal); draft.course.goal = String(args.goal) }
        if (args.level !== undefined) draft.profile.level = String(args.level)
        if (args.examDate !== undefined) draft.profile.examDate = String(args.examDate).slice(0, 10)
        if (args.notes !== undefined) draft.profile.notes = String(args.notes).slice(0, 4000)
        draft.profile.updatedAt = new Date().toISOString()
        return draft.profile
      })
      return { courseId: id, profile: meta.profile, version: meta.version, updatedAt: meta.updatedAt }
    },
  }))

  list.push(tool({
    name: 'create_study_plan',
    description: '排学习计划：按章节顺序把讲解、练习、复习和小测排成一组，一章学完进下一章，不按天排。重排时已经完成的任务会保留，不会白学。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      goal: { type: 'string', description: '本轮目标（可省略，沿用档案）' },
      examDate: { type: 'string', description: '考试日期 YYYY-MM-DD（可省略）' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      const result = await service.generatePlan(id, args)
      return {
        courseId: id,
        planId: result.plan.id,
        version: result.plan.version,
        targetDate: result.plan.targetDate,
        taskCount: result.plan.tasks.length,
        totalMinutes: result.plan.totalMinutes,
        next: result.next.map((task) => ({ id: task.id, title: task.title, type: task.type, chapterTitle: task.chapterTitle ?? null })),
        progress: result.progress,
      }
    },
  }))

  list.push(tool({
    name: 'update_study_plan',
    description: '把计划里的任务标成进行中、完成或跳过，也能改日期、加备注。学完一组随手标一下，计划才不会越拖越乱。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      taskId: { type: 'string', description: '任务 id' },
      status: { type: 'string', enum: ['todo', 'doing', 'done', 'skipped'], description: '新状态' },
      note: { type: 'string', description: '备注（可省略）' },
      dueDate: { type: 'string', description: '改期 YYYY-MM-DD（可省略）' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      if (!args.taskId) throw new DomainError('taskId 必填', 400, 'missing-task')
      const result = await service.updateTask(id, String(args.taskId), args)
      return { courseId: id, task: result.task, progress: result.progress }
    },
  }))

  list.push(tool({
    name: 'create_quiz',
    description: '出练习题。默认按当前任务的知识点出 5 道，可以选选择题、填空、判断、简答。答案不会给模型，判分用 grade_answer。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      conceptIds: { type: 'array', items: { type: 'string' }, description: '指定概念 id（可省略）' },
      count: { type: 'number', description: '题目数量，默认 5' },
      types: { type: 'array', items: { type: 'string' }, description: '限定题型：choice / choice-reverse / cloze / judge / short' },
      taskId: { type: 'string', description: '按任务的概念出题（可省略）' },
      mode: { type: 'string', description: 'practice / review' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      return service.createQuiz(id, {
        conceptIds: Array.isArray(args.conceptIds) ? args.conceptIds : null,
        count: Number(args.count) || 5,
        types: Array.isArray(args.types) ? args.types : null,
        taskId: args.taskId ?? null,
        mode: args.mode ?? 'practice',
      })
    },
  }))

  list.push(tool({
    name: 'grade_answer',
    description: '批改答案：给分数、对错、少了哪些要点、错在哪，同时更新这个知识点的熟练度和下次复习时间。解释要说人话，别背定义。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      questionId: { type: 'string', description: '题目 id（来自 create_quiz）' },
      answer: { type: 'string', description: '学生答案；选择题传选项下标，判断题传 0/1' },
      mode: { type: 'string', description: 'practice / review / lesson' },
      taskId: { type: 'string', description: '关联任务（可省略）' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      if (!args.questionId) throw new DomainError('questionId 必填', 400, 'missing-question')
      return service.answerQuestion(id, {
        questionId: String(args.questionId),
        answer: args.answer ?? '',
        mode: args.mode ?? 'practice',
        taskId: args.taskId ?? null,
      })
    },
  }))

  list.push(tool({
    name: 'record_learning_event',
    description: '记一笔学习痕迹：讲了什么、学生怎么回忆的、错在哪。以后判断「要不要回头补前置」就靠这些记录。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      type: { type: 'string', description: '事件类型：explain / recall / mistake / note / review' },
      conceptId: { type: 'string', description: '关联概念 id（可省略）' },
      evidence: { type: 'string', description: '证据：学生原话、错误原因或讲解要点' },
      taskId: { type: 'string', description: '关联任务（可省略）' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      return service.recordEvent(id, args)
    },
  }))

  list.push(tool({
    name: 'get_learning_state',
    description: '看每个知识点学到什么程度：0-1 的熟练度、练过几次、什么时候该复习。判断继续讲、回头补前置，还是换下一组。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      conceptIds: { type: 'array', items: { type: 'string' }, description: '限定概念（可省略）' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      return service.learningState(id, { conceptIds: Array.isArray(args.conceptIds) ? args.conceptIds : null })
    },
  }))

  list.push(tool({
    name: 'get_due_reviews',
    description: '今天该复习哪些知识点（含拖了几天、多久没练）。每次开始学习先看一眼，先复习再讲新的，记得更牢。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      return { courseId: id, ...(await service.dueReviews(id)) }
    },
  }))

  list.push(tool({
    name: 'get_page_image',
    description: '把资料某一页渲染成图片，返回本地文件路径。电路图、波形、示意图常是矢量绘制的，文字里没有它们，只有这一步能"看见"图。拿到路径后直接用 read_image 打开看，再讲解或出题。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      documentId: { type: 'string', description: '文档 id（可省略；省略时用课程里的第一份资料）' },
      pageNo: { type: 'number', description: '页码，从 1 开始' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      const meta = await store.getCourse(id)
      const doc = args.documentId
        ? (meta.documents ?? []).find((item) => item.id === args.documentId)
        : (meta.documents ?? [])[0]
      if (!doc) throw new DomainError('这门课还没有资料，先上传一份。', 404, 'no-document')
      const figure = await service.pageImage(id, doc.id, Number(args.pageNo) || 1)
      return {
        courseId: id,
        documentId: doc.id,
        filename: doc.filename,
        pageNo: figure.pageNo,
        path: figure.file,
        cached: Boolean(figure.cached),
        next: '用 read_image 打开这个路径，就能看到这一页的电路图/波形/示意图。',
      }
    },
  }))

  list.push(tool({
    name: 'list_document_images',
    description: '列出 Word / PPT 资料里内嵌的图片（电路图、截图）。PDF 见 get_page_image；图片资料本身就是一整张图。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      documentId: { type: 'string', description: '文档 id（可省略；省略时用第一份资料）' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      const meta = await store.getCourse(id)
      const doc = args.documentId
        ? (meta.documents ?? []).find((item) => item.id === args.documentId)
        : (meta.documents ?? [])[0]
      if (!doc) throw new DomainError('这门课还没有资料。', 404, 'no-document')
      const result = await service.documentMedia(id, doc.id)
      return {
        courseId: id,
        documentId: doc.id,
        filename: doc.filename,
        media: result.media,
        hint: result.media.length
          ? '用 GET /plugins/edugraph-learning/api/courses/<courseId>/documents/<documentId>/media/<index> 取图片，或让面板直接显示。'
          : '这份资料没有内嵌图片；PDF 用 get_page_image 按页渲染。',
      }
    },
  }))

  list.push(tool({
    name: 'get_course_overview',
    description: '这门课的整体情况：学到哪了、哪儿还生、今天该复习什么、下一步做什么。要给用户汇报学习情况时调它。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      const overview = await service.overview(id)
      return {
        courseId: id,
        course: overview.course,
        stats: overview.stats,
        chapters: overview.chapters.map((c) => ({ id: c.id, title: c.title, conceptCount: c.conceptCount, mastery: c.mastery })),
        weakConcepts: overview.weakConcepts,
        dueReviews: overview.dueReviews,
        nextTasks: overview.nextTasks,
        today: overview.today,
      }
    },
  }))

  list.push(tool({
    name: 'export_course_pack',
    description: '把当前课程导出成 edugraph-course-pack v1 JSON，并附一段可直接交给 ChatGPT/Claude 的提示词。外部模型改完后用 import_course_pack 校验入库；不包含作答/复习记录。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      return { courseId: id, ...(await service.exportPack(id)) }
    },
  }))

  list.push(tool({
    name: 'import_course_pack',
    description: '导入外部模型生成或修改过的课程包。只追加/补空，不删除已有内容；会校验概念引用、选项答案和长度，重复题目自动跳过。计划字段不会导入。',
    parameters: {
      courseId: { type: 'string', description: '课程 id；省略时使用当前课程' },
      pack: { type: 'object', description: 'edugraph-course-pack v1 对象（也接受 JSON 字符串）', additionalProperties: true },
      overwriteDefinitions: { type: 'boolean', description: '是否用导入内容覆盖同名概念的已有定义，默认 false' },
    },
    run: async (args) => {
      const { id } = await resolveCourse(service, store, args.courseId)
      return { courseId: id, ...(await service.importPack(id, args.pack, { overwriteDefinitions: Boolean(args.overwriteDefinitions) })) }
    },
  }))

  return list
}

/** 工具到学习的教学策略提示，供宿主注入或 README 参考。 */
export const LEARNING_GUIDANCE = `你是一名耐心的家教，说话像人，不像说明书。

开始前先看资料（get_document_outline / search_materials），再瞄一眼学生的目标、基础和考试时间（get_student_profile）。
要问就问真正影响安排的事，顶多五个；问完立刻 save_student_profile 存下来，别重复问。
排计划用 create_study_plan；每学完一组就 update_study_plan 标完成。

讲的时候一次只讲一两个点：先用大白话讲明白，再举个能想象出来的例子，然后让学生自己说一遍，最后用 create_quiz 出两道题检验、grade_answer 批改。
学生答错别急着说「错了」，先指出他是在哪一步想歪的，再给正确思路。
讲到电路图、波形、示意图这类文字里没有的东西，先用 get_page_image 把那一页渲染出来，再用 read_image 看一眼，然后照着图讲。
每次结束前看一眼 get_due_reviews，把到期的复习掉。
外部模型生成的课程包用 import_course_pack 校验入库，不要直接改 meta.json；导出用 export_course_pack。`
