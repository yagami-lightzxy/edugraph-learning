import { readFile } from 'node:fs/promises'
import { parseDocument } from '../lib/parse/index.js'
const buffer = await readFile(process.argv[2])
const parsed = await parseDocument({ buffer, filename: process.argv[2] })
const needle = process.argv[3] ?? '二极管导通'
let shown = 0
for (const page of parsed.pages) {
  for (const block of page.blocks) {
    if (!block.text.includes(needle)) continue
    console.log('p' + page.pageNo, '|', block.kind, '|', JSON.stringify(block.text.slice(0, 160)))
    if (++shown >= 6) process.exit(0)
  }
}
console.log('no match')
