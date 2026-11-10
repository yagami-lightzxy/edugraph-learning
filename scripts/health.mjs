/**
 * 安装自检：确认 DSH 真的能加载这个插件。
 * 用法：node scripts/health.mjs
 */
import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const home = process.env.DSH_HOME || path.join(process.env.USERPROFILE || process.env.HOME || '', '.dsh')
const profile = process.env.DSH_PROFILE || 'desktop'
const profileDir = path.join(home, 'profiles', profile)
const checks = []
const record = (name, ok, detail = '') => { checks.push({ name, ok }); console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`) }

try {
  await access(path.join(root, 'lib', 'client.js'))
  record('客户端 bundle 存在', true, 'lib/client.js')
} catch { record('客户端 bundle 存在', false, '先执行 npm run build') }

try {
  await access(path.join(root, 'lib', 'media.js'))
  record('宿主代码存在', true, 'lib/media.js')
} catch { record('宿主代码存在', false) }

try {
  const canvas = await import('canvas')
  record('canvas 可用（PDF 出图）', typeof canvas.createCanvas === 'function')
} catch (error) {
  record('canvas 可用（PDF 出图）', false, '执行 npm install canvas')
}

try {
  const pkg = JSON.parse(await readFile(path.join(profileDir, 'package.json'), 'utf8'))
  const dep = pkg.dependencies?.['edugraph-learning']
  const inBundles = (pkg.dsh?.profile?.bundles ?? []).includes('edugraph-learning')
  record('profile 依赖已声明', Boolean(dep), dep || '缺失')
  record('profile 已启用插件', inBundles, inBundles ? '' : '在 dsh.profile.bundles 里加 edugraph-learning')
} catch (error) {
  record('读取 profile', false, `${profileDir}: ${error.message}`)
}

try {
  const link = path.join(profileDir, 'node_modules', 'edugraph-learning', 'package.json')
  await access(link)
  record('profile 已链接到本目录', true, link)
} catch {
  record('profile 已链接到本目录', false, '在 profile 目录执行 pnpm install，或手工建 junction')
}

const failed = checks.filter((check) => !check.ok)
console.log('')
console.log(failed.length ? `有 ${failed.length} 项没通过；修完重启 DSH。` : '全部通过。重启 DSH 后侧栏会出现「学习」。')
process.exitCode = failed.length ? 1 : 0
