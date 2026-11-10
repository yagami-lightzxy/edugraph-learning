import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from 'canvas'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const buffer = await readFile(process.argv[2])
const doc = await getDocument({ data: new Uint8Array(buffer), isEvalSupported: false, disableFontFace: true }).promise
const start = Date.now()
const page = await doc.getPage(4)
const viewport = page.getViewport({ scale: 1.5 })
const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#fff'
ctx.fillRect(0, 0, canvas.width, canvas.height)
await page.render({ canvasContext: ctx, viewport }).promise
const png = canvas.toBuffer('image/png')
await mkdir('outputs/shots', { recursive: true }); await writeFile('outputs/shots/render-page4.png', png)
console.log('ok ms:', Date.now() - start, 'size:', canvas.width, 'x', canvas.height, 'bytes:', png.length)
await doc.destroy()
