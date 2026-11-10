# EduGraph AI · DSH 学习模式

把 DeepSeek Harness（DSH）变成一台能真正带人学完一门课的机器：传资料 → 拆章节和知识点 → 排计划 → 讲解、出题、批改 → 错题与复习。**电路图、波形这类"文字里没有"的东西，也能看到。** 学习面板右侧直接就是当前对话，问图、问题、让 AI 讲，都不用离开课程。

![学习面板：左侧课程导航、中间学习内容，AI 导师在右侧随时展开](docs/screenshot-library.png)

| AI 导师（与当前对话同步） | 知识图谱（按章节聚焦） |
|---|---|
| ![AI 导师](docs/screenshot-chat.png) | ![图谱](docs/screenshot-graph.png) |

| 讲解与主动回忆 | 练习批改 |
|---|---|
| ![讲解](docs/screenshot-lesson.png) | ![练习](docs/screenshot-quiz-answer.png) |

| 外部 AI 课程包（导出 / 预览 / 导入） |
|---|
| ![外部 AI 课程包](docs/screenshot-ai-pack.png) |

| 图示（PDF 电路图现渲染） | 课程库首屏 |
|---|---|
| ![图示](docs/screenshot-figure.png) | ![课程库](docs/screenshot-library.png) |

## 用到了哪些技术

| 层 | 技术 | 用来干什么 |
|---|---|---|
| 宿主插件 | Node ESM + Cordis（`export const name/inject/apply`） | 注册 HTTP 路由与 20 个 Agent 工具 |
| 浏览器插件 | React 18 + TypeScript（TSX）+ esbuild | 学习面板 UI，编译成 `window.__ModuleLoader__` 惰性 CJS bundle |
| 面板接入 | `ctx.slots.register({name:'main', key:'learning'})` + `ctx.layout.selectPanel` | 与 DSH 原生会话一键切换 |
| 面板内对话 | 原生 `conversation.content` slot（无 slot 时同源 iframe 兜底） | 消息、模型、工具、权限、审批与历史都是同一套原生组件；桌面 `dsh-app://` 不再受 iframe 鉴权影响 |
| 数据 | 本地 JSON（原子写 + 键锁），无数据库 | 课程知识 / 个人学习状态分离存储 |
| PDF | `pdfjs-dist`（legacy build） | 取文字、字号、页面；判定章节层级 |
| PDF 图示 | `pdfjs-dist` + `canvas`（node-canvas） | 把整页**渲染成 PNG**，矢量画的电路图也能看 |
| Office | 自写 OOXML + ZIP（`node:zlib`），零第三方 | DOCX/PPTX/XLSX 解析与内嵌图片抽取 |
| 结构分析 | 自写规则引擎 | 标题识别、概念抽取、前置/相关关系 |
| 检索 | 自写 BM25 + 中英分词（CJK 1/2-gram） | 资料/概念/题目全文检索，带出处 |
| 复习 | 自写 FSRS-5 | 计算每个知识点的下次复习时间 |
| 出题判分 | 自写（定义句挖空、同章干扰项、关键点覆盖） | 选择题/填空/判断/简答与批改 |
| 图谱可视化 | 自绘 SVG + 自写受力布局 | 概念关系图、章节焦点、悬停高亮、缩放平移 |
| 验证 | `node:test`（64 项）、Playwright、DSH 自带 schema 校验器 | 单测、真实浏览器 12 步验收、工具 schema 校验 |

## 图示与电路图怎么解决

电路图有两种存在形式，方案分别处理：

1. **位图**（扫描件、PPT 里贴的图）：直接从 DOCX/PPTX 的 `word/media`、`ppt/media` 里抽出来。
2. **矢量绘制**（PDF 里用线条画的三极管、波形）：文字层里根本没有它。做法是**把整页渲染成图片**——`pdfjs` 解析 + `canvas` 绘制，1.6 倍分辨率，渲染一次缓存到 `courses/<id>/figures/`。

在界面里：

- 资料页 → 翻原文 → 每页上方「看这一页的图（电路图/波形）」按钮，点开就是整页高清图，**查看器里可以直接 ← → 翻页**；
- Word/PPT 资料在列表里有「看图片」，按顺序翻内嵌图片；
- 讲解页 → 每个知识点卡片右上角「看原文图」，直接跳到它出处的那一页；
- AI → 工具 `get_page_image` 返回图片路径，模型用 DSH 自带的 `read_image` 看一眼，就能照着图讲、照着图出题；
- 图片资料（png/jpg）直接作为整页图显示，不经过解析。

`canvas` 是可选依赖：没装上时功能自动降级为提示「缺少 canvas 依赖」，其它功能不受影响。

## 在学习面板里直接对话（v1.3.1）

右侧的「AI 导师」不是另做的聊天框，而是直接渲染 **DSH 原生会话的 `conversation.content` slot**（和原生对话同一棵 React 树、同一份模型/工具/审批）：

- 模型、工具权限、历史、队列、附件、审批弹窗都是同一份，你在右侧发的消息回到完整对话里同样在；
- 讲解卡片、错题、图谱节点和概览的薄弱知识点旁边都有「问导师」，点一下会带着当前知识点/错题上下文直接发过去，自动打开右侧并发送，不用复制粘贴；
- 插件工具默认打开界面里正在学的那门课，所以可以直接问「这一页的电路图怎么看」「刚才那道题为什么错」；
- 对话坞可收起，也可以点「在完整对话中打开」切回原生会话；窄面板下自动变成右侧浮层；
- 桌面端 `dsh-app://` 不再走 iframe 鉴权；只有拿不到原生 slot 的嵌入环境才回退同源 iframe，失败时提示回完整对话，学习数据与进度不受影响。

实现上，面板从 slot owner 拿到 `renderFactorySlot`，用它渲染原生 `conversation.content`；用 `useSessions` 判断当前会话是空白还是活跃，空白显示原生 hero，活跃显示消息列表与 composer。上下文「问导师」直接调用父页面的 `conversation.send`，不再经过 iframe。面板本身用容器查询按 DSH 主区域的实际宽度收放左侧栏，所以原生侧栏展开时也不会把中间内容挤扁。

![右侧原生 AI 导师：消息、回复和原生 composer 都在面板里](docs/screenshot-chat-native.png)

> 取舍：原生 slot 是当前 DSH 插件 API 下最稳的做法——自写聊天会丢掉工具调用、审批和队列；iframe 只保留给没有 slot 的嵌入环境。桌面端 iframe 走 `dsh-app://` 时拿不到启动鉴权，且跨 origin token 重定向会被第三方 cookie 拦截，所以主路径不要再依赖它。

## 用其他 AI 生成内容（v1.3）

外部模型不需要接进插件，走课程包就行：

1. 打开一门课，点顶部「AI 内容」。
2. 在「复制给 AI」里点「复制提示词」，整段粘给 ChatGPT / Claude / Gemini；提示词里已经包含当前课程结构和题目。
3. 让它按格式补概念、讲解和题目，只返回 JSON（支持 ```json 代码块）。
4. 回到「导入 AI 结果」，粘贴 JSON；先点「预览校验」看新增/跳过多少，再确认导入。
5. 同名概念会合并，已有定义默认不覆盖（可以勾选覆盖）；导入的题目会进入练习，新增概念会进图谱和讲解。**计划字段只给外部 AI 作上下文，导入不会改现有计划**；需要时去计划页重新生成。

这条路不需要 API key，GPT 网页版就能用。DSH 里的 Agent 也可以直接调 `export_course_pack` / `import_course_pack`，不用复制粘贴。导入只追加/补空，不删除已有内容；格式、引用、选项答案和长度都会在服务端校验，坏了会被拒绝，不会写进课程。

## 和同类学习产品有什么不同

- **NotebookLM 一类**强在「资料内问答 + 出处」，但不管学习计划、练习和间隔复习；
- **Quizlet / Knowt 一类**强在题库和测验，但知识来源以手工录入为主，缺少本地资料解析、知识点前后置关系和可执行工具；
- **Anki / RemNote 一类**强在间隔重复和知识组织，但卡片通常要自己整理，AI 对话不是主场；
- **这个插件**把「资料解析 → 图谱 → 计划 → 讲解/练习 → 复习」和当前 DSH 原生会话放在同一个本地工作区里，学习内容和导师共享课程上下文；这是它相对的差异点，不是每个单项的绝对优势。

## 安装

插件是纯 ESM + 一个已构建的浏览器 bundle，不需要构建服务、不需要数据库。

### 方式一：装进 profile（日常使用）

```jsonc
// ~/.dsh/profiles/<profile>/package.json
{
  "dependencies": { "edugraph-learning": "link:<插件绝对路径>" },
  "dsh": { "profile": { "bundles": [ /* … */ , "edugraph-learning" ] } }
}
```

```powershell
cd <插件目录>; npm install                    # 装 pdfjs-dist 与 canvas
cd <profile>; pnpm install --prefer-offline   # 建 link
node <插件目录>\scripts\health.mjs            # 安装自检（依赖/链接/canvas）
# 重启 DSH，侧栏出现「学习」
```

> 装完必须**重启 DSH**：profile 的插件列表在启动时读取，热更新只覆盖插件代码、不覆盖新装插件。重启后跑一次 `scripts/health.mjs`，六项全 OK 就说明装好了。

### 方式二：不动用户 profile，起一个临时实例

```powershell
node <dsh>/lib/bin.js --profile web --patch dev-patch.example.yml --port 3900 --no-open
```

## 使用

1. **新建课程**：填名字、目标、考试日期、每天能学多久。
2. **传资料**：PDF/Word/PPT/Excel/Markdown/TXT/图片，可多选、可拖拽；解析在后台，关页面不中断。
3. **看计划**：系统按章节顺序和"必须先学谁"排好讲解、练习、小测、复习；可以改目标后重排，已完成的不丢。
4. **学**：讲解页看定义和原文，先自己回忆，再对照；然后做题，做完立刻批改并告诉你错在哪。
5. **补**：错题页按知识点归堆，一键重练；复习页按记忆曲线排好到期任务。
6. **看图**：遇到电路图、波形，点「看这一页的图」。
7. **直接问**：右侧「AI 导师」就是当前 DSH 对话本身，模型、工具、历史都在；问图、问概念、让 AI 接着讲都行。不想占屏幕就收起，或点「在完整对话中打开」。
8. **回对话**：右上角「返回对话」回到 DSH 原生会话，模型、工具权限、历史都不变。

界面上的「现在做这个」永远只给一个下一步，不用自己想到底该干嘛。

## 给 Agent 的能力（20 个工具）

| 分类 | 工具 |
|---|---|
| 资料 | `list_courses`、`get_document_outline`、`read_source`、`search_materials` |
| 图示 | `get_page_image`、`list_document_images` |
| 图谱 | `upsert_concepts`、`upsert_relations` |
| 档案 | `get_student_profile`、`save_student_profile` |
| 计划 | `create_study_plan`、`update_study_plan` |
| 练习 | `create_quiz`、`grade_answer` |
| 进度 | `record_learning_event`、`get_learning_state`、`get_due_reviews`、`get_course_overview` |
| 外部 AI | `export_course_pack`、`import_course_pack` |

工具描述全部用大白话写成，模型照着做就像个正常家教；`courseId` 可省略，会自动用界面上打开的那门课。

本地 HTTP 接口与面板共用：`/plugins/edugraph-learning/api` → `/courses`、`/overview|graph|plan|documents|lesson|quiz|mistakes|reviews|search`、`/pack|pack/preview`、`/documents/:id/pages/:n/image`、`/media`、`/state`、`/profile`、`/health`。

## 数据

```
$DSH_HOME/storages/edugraph-learning/
├── index.json                  课程索引
├── profile.json                跨课程学习档案
├── state.json                  界面状态（当前课程/页面，刷新恢复）
└── courses/<courseId>/
    ├── meta.json               课程 + 章节 + 概念 + 进展 + 计划 + 答题 + 复习
    ├── blocks.json             资料原文块
    ├── documents/              原始上传文件（渲染图片、抽图都靠它）
    └── figures/                按页渲染的图片缓存
```

所有写入是「临时文件 + rename」的原子替换，并用键锁串行化；损坏文件会被识别、备份并报错，不会静默丢数据。

## 开发

```powershell
npm test                       # 64 项；真实 PDF 用例需设置 EDUGRAPH_REAL_PDF
npm run build                  # 重新生成 lib/client.js
node scripts/e2e-real.mjs "<一份真实 PDF>"   # 真实课程全链路
node scripts/verify-bundle.mjs               # 客户端 bundle 合同
node scripts/verify-tools.mjs <dsh-tools 的 json-schema.js>   # 用 DSH 校验器验 20 个工具
```

```
lib/           宿主侧：api / service / store / parse / analyze / plan / quiz / grade / fsrs / search / media / tools
src/client/    浏览器侧：index.tsx（三栏骨架）、ui.tsx、views/*.tsx（含 Chat.tsx 导师坞）、embed.ts、session.ts、tutor.ts、styles.css
scripts/       构建与校验脚本
test/          node:test 套件
docs/          工程说明与截图
```

## 已知限制

- 概念/定义来自确定性规则，不是模型推理：印刷教材效果好，手写笔记、公式密集的资料会抽到公式片段，需要模型用 `upsert_concepts` 修，或在图谱里绕开。
- 图片不做 OCR，也不做电路识图：**图能看、能交给模型看**，但不会自动解析成网表。
- 选项生成依赖定义，没有定义的概念只出填空题。
- 单课程上限：220 概念 / 160 任务 / 单文件 80MB；按页渲染一次约 0.5 秒（之后走缓存）。
- 数据只在本机，不做多设备同步。
- 面板内对话优先走原生 slot；只有没有 slot 的嵌入环境才用 iframe，宿主禁用 iframe 时会提示回完整对话，学习功能不受影响。
- 对话坞展示的是当前原生会话；切换会话仍在原生对话里完成。

## 更新记录

- **v1.3.1**：右侧聊天从 iframe 改为原生 `conversation.content` slot，桌面 `dsh-app://` 下不再卡在“正在接入对话”；上下文「问导师」直接走父页面 `conversation.send`；iframe 仅作为没有 slot 时的兜底。
- **v1.3.0**：外部 AI 课程包——顶部「AI 内容」把课程导出成 JSON + 提示词，交给 ChatGPT/Claude 生成，再粘回校验合并；导入的概念/题目进入图谱、讲解和练习。
- **v1.2.0**：学习面板改成三栏（课程导航 / 学习内容 / AI 导师），首屏、导航、卡片与练习反馈统一视觉；面板内 AI 导师复用当前 DSH 原生会话，可收起或展开；讲解/错题/图谱/概览支持带上下文「问导师」自动发送；修复反向选择题被当成简答题判分的问题。
- **v1.1.1**：PDF 文档缓存、图片查看器翻页、Office 图片画廊、安装自检脚本。
- **v1.1.0**：学习面板、电路图渲染、知识图谱与间隔复习。

## 许可

MIT
