/**
 * 学习内容 → 右侧 AI 导师的轻量提问总线。
 *
 * 视图不直接碰 iframe：只把带上下文的 prompt 交给总线，面板负责打开对话坞并
 * 通过 postMessage 转给嵌入实例发送。这样讲解、错题、图谱、概览都能复用同一套入口。
 */

export type TutorAsk = { id: number; text: string; label?: string }
type Sender = (text: string, label?: string) => boolean

let sender: Sender | null = null
let nextId = 0

/** 面板挂载时注册发送器；返回取消函数。 */
export function setTutorSender(next: Sender | null): () => void {
  sender = next
  return () => { if (sender === next) sender = null }
}

/** 把一个问题交给面板。返回 false 表示当前没有可用的导师入口。 */
export function askTutor(text: string, label?: string): boolean {
  const value = String(text ?? '').trim()
  if (!value || !sender) return false
  return sender(value.slice(0, 4000), label)
}

/** 单调递增的请求 id，用于父面板和 iframe 对齐回执。 */
export function newAskId(): number {
  nextId += 1
  return nextId
}

function brief(text: string | null | undefined, max = 320): string {
  const value = String(text ?? '').replace(/\s+/g, ' ').trim()
  return value.length > max ? value.slice(0, max) + '…' : value
}

/** 嵌进句子里时去掉句尾标点，避免「材料。。请…」这种双句号。 */
function clause(text: string | null | undefined, max = 320): string {
  return brief(text, max).replace(/[。．.；;，,]+$/u, '')
}

/** 「讲解」卡片上的问法。 */
export function conceptAsk(name: string, definition?: string | null): string {
  return `我在学「${name}」。${definition ? `资料里的定义是：${clause(definition)}。` : ''}
请用更直白的话解释它，并举一个容易出错的例子。`
}

/** 「先别看书，回忆一下」里的问法。 */
export function recallAsk(names: string[], prompt?: string | null): string {
  return `我在回忆这组知识点：${names.join('、')}。${prompt ? `回忆题：${clause(prompt, 500)}。` : ''}
请先别直接给答案，用 1-2 个问题引导我自己想出来。`
}

/** 错题反馈里的问法。 */
export function mistakeAsk(question: { stem: string; conceptName?: string }, myAnswer: string, expected: string): string {
  return `我刚做错了一道题。
题目：${brief(question.stem, 600)}
我的答案：${brief(myAnswer, 320) || '（空）'}
正确答案：${brief(expected, 320) || '（题目没给出）'}
请解释我错在哪，并给我一个记住它的办法。`
}

/** 错题本里按知识点归堆后的问法。 */
export function groupAsk(name: string, definition?: string | null, tags?: string[]): string {
  return `我在「${name}」上反复出错。${definition ? `资料里的定义是：${clause(definition)}。` : ''}
常见错因：${tags?.length ? tags.join('、') : '还没归类'}。请帮我分清容易混淆的地方，再出 2 道小题考我。`
}

/** 图谱节点详情里的问法。 */
export function graphAsk(name: string, definition?: string | null, related?: string[]): string {
  return `我在知识图谱里看「${name}」。${definition ? `资料里的定义是：${clause(definition)}。` : ''}
${related?.length ? `和它相关或前置的知识点：${related.slice(0, 6).join('、')}。` : ''}
请告诉我应该先补哪个，再用一个例子把它们串起来。`
}

/** 概览「哪里还生」里的问法。 */
export function weakAsk(names: string[]): string {
  return `我最近比较薄弱的知识点是：${names.slice(0, 6).join('、')}。请先帮我串讲它们的区别，再出 3 道小题考我。`
}
