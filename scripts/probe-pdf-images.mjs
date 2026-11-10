import { getDocument, OPS, ImageKind } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { readFile } from 'node:fs/promises'
const buffer = await readFile(process.argv[2])
const doc = await getDocument({ data: new Uint8Array(buffer), isEvalSupported: false, disableFontFace: true }).promise
console.log('OPS keys:', Object.keys(OPS).filter(k => /image/i.test(k)).join(','))
console.log('ImageKind:', JSON.stringify(ImageKind))
const page = await doc.getPage(2)
const ops = await page.getOperatorList()
let count = 0
for (let i = 0; i < ops.fnArray.length && count < 6; i++) {
  const fn = ops.fnArray[i]
  if (fn !== OPS.paintImageXObject && fn !== OPS.paintInlineImageXObject) continue
  const arg = ops.argsArray[i][0]
  let img = null
  if (typeof arg === 'string') {
    img = await new Promise((resolve) => { try { page.objs.get(arg, resolve) } catch { resolve(null) } })
  } else img = arg
  if (!img) { console.log('img: unresolved', typeof arg); continue }
  count += 1
  console.log('img', count, 'w=', img.width, 'h=', img.height, 'kind=', img.kind, 'dataLen=', img.data?.length, 'ctor=', img.data?.constructor?.name)
}
console.log('total image ops:', ops.fnArray.filter(f => f === OPS.paintImageXObject || f === OPS.paintInlineImageXObject).length)
await doc.destroy()
