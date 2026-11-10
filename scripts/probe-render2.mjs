import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas, Path2D as NapiPath2D } from '@napi-rs/canvas'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

// pdfjs 会优先用全局 Path2D/DOMMatrix；与 @napi-rs/canvas 的实现混用会导致 fill 参数错乱，
// 这里让 pdfjs 退回逐点路径构建。
delete globalThis.Path2D
delete globalThis.DOMMatrix

const buffer = await readFile(process.argv[2])
const doc = await getDocument({ data: new Uint8Array(buffer), isEvalSupported: false, disableFontFace: true }).promise

const counts = []
for (let p = 1; p <= Math.min(12, doc.numPages); p++) {
  const page = await doc.getPage(p)
  const ops = await page.getOperatorList()
  let paths = 0, images = 0
  for (const fn of ops.fnArray) {
    if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) images += 1
    else if (fn === OPS.constructPath) paths += 1
  }
  counts.push({ p, paths, images })
}
console.log('op counts:', JSON.stringify(counts))

const page = await doc.getPage(4)
const viewport = page.getViewport({ scale: 1.5 })
const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#fff'
ctx.fillRect(0, 0, canvas.width, canvas.height)
const started = Date.now()
await page.render({ canvasContext: ctx, viewport }).promise
const png = await canvas.encode('png')
await mkdir('outputs/shots', { recursive: true }); await writeFile('outputs/shots/render-page4.png', png)
console.log('render ms:', Date.now() - started, 'size:', canvas.width, 'x', canvas.height, 'bytes:', png.length)
await doc.destroy()
