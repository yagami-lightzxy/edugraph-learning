/** 校验浏览器 bundle 的合同：能在 __ModuleLoader__ 下注册 factory，并导出 apply/inject/name。 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const code = await readFile(path.join(root, 'lib', 'client.js'), 'utf8')

let registered = null
const sandbox = {
  window: {
    __ModuleLoader__: {
      load(entry) { registered = entry },
    },
    addEventListener() {}, removeEventListener() {},
    setTimeout, clearTimeout, setInterval, clearInterval,
  },
  document: { createElement: () => ({ style: {}, append() {}, remove() {}, addEventListener() {} }), head: { append() {} } },
  console,
}
sandbox.globalThis = sandbox
vm.createContext(sandbox)
vm.runInContext(code, sandbox)

if (!registered) throw new Error('bundle 没有调用 __ModuleLoader__.load')
if (registered.id !== 'edugraph-learning') throw new Error(`bundle id 错误：${registered.id}`)

const reactStub = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  useState: (value) => [value, () => {}],
  useEffect: () => {}, useMemo: (fn) => fn(), useCallback: (fn) => fn, useRef: () => ({ current: null }),
  Fragment: 'Fragment',
}
const runtimeStub = (id) => {
  if (id === 'react') return reactStub
  if (id === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null, Fragment: 'Fragment' }
  throw new Error(`未预期的平台模块：${id}`)
}
const exports = registered.factory(runtimeStub)

const checks = {
  hasApply: typeof exports.apply === 'function',
  hasInject: Array.isArray(exports.inject) && exports.inject.includes('slots'),
  hasName: exports.name === 'edugraph-learning',
}
console.log('exports:', Object.keys(exports).join(','), '| inject:', JSON.stringify(exports.inject))
if (!checks.hasApply || !checks.hasInject || !checks.hasName) {
  throw new Error(`bundle 导出不符合契约：${JSON.stringify(checks)}`)
}

// 用假的 ctx 调一次 apply，确认注册了面板与侧栏入口
const registrations = []
const injected = []
const fakeCtx = {
  slots: {
    inject(key, callback) {
      injected.push(key)
      return callback()
    },
    register(spec, component) {
      registrations.push({ spec, component })
      return () => {}
    },
  },
  layout: { selectPanel() {} },
  effect(fn) { return fn() },
}
exports.apply(fakeCtx)
const kinds = registrations.map((item) => `${item.spec.name}:${item.spec.key ?? item.spec.id}`)
console.log('injected slots:', injected.join(','))
console.log('registered:', kinds.join(','))
if (!registrations.some((item) => item.spec.name === 'main' && item.spec.key === 'learning')) {
  throw new Error('没有注册 main 面板')
}
if (!registrations.some((item) => item.spec.name === 'sidebar.panellist')) {
  throw new Error('没有注册侧栏入口')
}
console.log('OK: client bundle 合同校验通过')
