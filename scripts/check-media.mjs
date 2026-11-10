import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { LearningStore } from '../lib/store.js'
import { LearningService } from '../lib/service.js'
import { parseDocument } from '../lib/parse/index.js'

const pdf = process.argv[2]
const dir = await mkdtemp(path.join(os.tmpdir(), 'edugraph-media-'))
try {
  const store = new LearningStore({ baseDir: dir })
  await store.init()
  const service = new LearningService({ store, parser: { parseDocument } })
  const { course } = await service.createCourse({ name: '图片测试' })
  const buffer = await readFile(pdf)
  const { document } = await service.ingestDocument({ courseId: course.id, filename: path.basename(pdf), buffer })
  for (let i = 0; i < 200; i += 1) {
    const meta = await store.getCourse(course.id)
    const doc = meta.documents.find((d) => d.id === document.id)
    if (doc?.status === 'ready' || doc?.status === 'failed') break
    await new Promise((r) => setTimeout(r, 150))
  }
  const started = Date.now()
  const figure = await service.pageImage(course.id, document.id, 4)
  const info = await stat(figure.file)
  console.log('page image:', path.basename(figure.file), info.size, 'bytes,', Date.now() - started, 'ms')
  const again = await service.pageImage(course.id, document.id, 4)
  console.log('cached:', again.cached)
  const media = await service.documentMedia(course.id, document.id)
  console.log('media count:', media.count)
} finally {
  await rm(dir, { recursive: true, force: true })
}
