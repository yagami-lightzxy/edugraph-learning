import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { readFile } from 'node:fs/promises'

const file = process.argv[2]
const data = new Uint8Array(await readFile(file))
const t0 = Date.now()
const doc = await getDocument({ data, useSystemFonts: false, isEvalSupported: false, disableFontFace: true }).promise
console.log('pages:', doc.numPages, 'load ms:', Date.now() - t0)
for (const p of [1, 2, 3]) {
  const page = await doc.getPage(p)
  const tc = await page.getTextContent()
  const items = tc.items.filter(i => typeof i.str === 'string' && i.str.trim())
  console.log('--- page', p, 'items:', items.length)
  console.log(items.slice(0, 25).map(i => `[${i.str} h=${Math.round((i.height ?? 0) * 10) / 10}]`).join(' '))
  const h = items.map(i => i.height ?? 0).filter(Boolean)
  console.log('heights min/max:', Math.min(...h).toFixed(2), Math.max(...h).toFixed(2))
}
const t1 = Date.now()
let chars = 0
for (let p = 1; p <= doc.numPages; p++) { const pg = await doc.getPage(p); const tc = await pg.getTextContent(); chars += tc.items.reduce((s, i) => s + (i.str ?? '').length, 0) }
console.log('all pages text chars:', chars, 'ms:', Date.now() - t1)
await doc.destroy()
