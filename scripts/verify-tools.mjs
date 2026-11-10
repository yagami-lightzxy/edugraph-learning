/**
 * 用 DSH 自身的 JSON Schema 校验器检查工具定义能否被注册。
 * 用法：node scripts/verify-tools.mjs [dsh-tools 的 json-schema.js 路径]
 */
import { pathToFileURL } from 'node:url'
import { LearningStore } from '../lib/store.js'
import { LearningService } from '../lib/service.js'
import { createToolDefinitions } from '../lib/tools.js'

const validatorPath = process.argv[2]
let assertSupportedJsonSchema = null
if (validatorPath) {
  const mod = await import(pathToFileURL(validatorPath).href)
  assertSupportedJsonSchema = mod.assertSupportedJsonSchema
}

const dir = process.env.TEMP + '/edugraph-tool-check-' + Date.now()
const store = new LearningStore({ baseDir: dir })
await store.init()
const service = new LearningService({ store, parser: { async parseDocument() { throw new Error('n/a') } } })
const definitions = createToolDefinitions({ service, store })

let failed = 0
for (const definition of definitions) {
  try {
    if (!definition.name || typeof definition.description !== 'string') throw new Error('缺少 name/description')
    if (typeof definition.output?.render !== 'function') throw new Error('缺少 output.render')
    if (assertSupportedJsonSchema) {
      assertSupportedJsonSchema(definition.parameters)
      assertSupportedJsonSchema(definition.output.schema)
    }
    console.log('OK   ' + definition.name)
  } catch (error) {
    failed += 1
    console.log('FAIL ' + definition.name + ' — ' + (error.message || error))
  }
}
console.log('\n共 ' + definitions.length + ' 个工具，失败 ' + failed + ' 个' + (assertSupportedJsonSchema ? '（已用 DSH 校验器）' : '（仅结构检查）'))
process.exitCode = failed ? 1 : 0
