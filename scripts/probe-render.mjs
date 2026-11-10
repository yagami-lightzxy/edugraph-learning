import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'
import { readFile, writeFile } from 'node:fs/promises'

const buffer = await readFile(process.argv[2])
const doc = await getDocument({ data: new Uint8Array(buffer), isEvalSupported: false, disableFontFace: true }).promise
const counts = []
for (let p = 1; p <= Math.min(12, doc.numPages); p++) {
  const page = await doc.getPage(p)
  const ops = await page.getOperatorList()
  let paths = 0, images = 0, texts = 0
  for (const fn of ops.fnArray) {
    if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) images += 1
    else if (fn === OPS.constructPath) paths += 1
    else if (fn === OPS.showText) texts += 1
  }
  counts.push({ page: p, paths, images, texts })
}
console.log(JSON.stringify(counts))

// 渲染第 2 页
const page = await doc.getPage(2)
const viewport = page.getViewport({ scale: 1.5 })
const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#ffffff'
ctx.fillRect(0, 0, canvas.width, canvas.height)
const started = Date.now()
await page.render({ canvasContext: ctx, viewport }).promise
const png = await canvas.encode('png')
await writeFile('D:/slaern/outputs/shots/render-page2.png', png)
console.log('render ms:', Date.now() - started, 'size:', canvas.width, 'x', canvas.height, 'png bytes:', png.length)
await doc.destroy()
