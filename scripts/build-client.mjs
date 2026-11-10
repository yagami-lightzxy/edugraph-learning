/**
 * 构建浏览器侧 bundle：src/client/index.tsx -> lib/client.js
 *
 * DSH 的外壳按惰性 CJS 模型加载插件：bundle 只注册 factory，factory 拿到的
 * require 解析平台共享模块（react / react-dom / cordis 等）。因此这里把 React
 * 等平台模块标记为 external，再把 esbuild 的 CJS 产物包进 __ModuleLoader__ 调用。
 */
import { build } from 'esbuild'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const entry = path.join(root, 'src', 'client', 'index.tsx')
const outfile = path.join(root, 'lib', 'client.js')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

const result = await build({
  entryPoints: [entry],
  bundle: true,
  write: false,
  format: 'cjs',
  target: ['es2022'],
  platform: 'browser',
  jsx: 'automatic',
  minify: false,
  legalComments: 'none',
  logLevel: 'warning',
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'react-dom/client',
    '@deepseek-ai/cordis',
    'zod',
    '@tanstack/react-virtual',
    '@deepseek-ai/dsh-client-store',
    '@deepseek-ai/dsh-client-ui-slots',
    '@deepseek-ai/dsh-client-ui-primitives',
  ],
  loader: { '.css': 'text' },
  define: { 'process.env.NODE_ENV': '"production"' },
  banner: { js: '/* EduGraph AI 学习模式 · 浏览器侧 bundle（由 scripts/build-client.mjs 生成，请勿手改） */' },
})

const code = result.outputFiles[0].text
const wrapped = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    ;(function (module, exports, require) {
${code}
    })(module, exports, require);
    return module.exports;
  }
});
`
await mkdir(path.dirname(outfile), { recursive: true })
await writeFile(outfile, wrapped, 'utf8')
console.log(`built ${path.relative(root, outfile)} (${(wrapped.length / 1024).toFixed(1)} KiB)`)
