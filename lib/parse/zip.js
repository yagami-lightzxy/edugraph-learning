import { Buffer } from 'node:buffer'
import { inflateRawSync } from 'node:zlib'

/**
 * Minimal ZIP reader (stored/deflate only), built directly on node:zlib.
 * Office Open XML packages (docx/pptx/xlsx) are ordinary ZIP archives.
 */

const SIG_EOCD = 0x06054b50
const SIG_CENTRAL = 0x02014b50
const SIG_LOCAL = 0x04034b50

function asBuffer(input) {
  if (Buffer.isBuffer(input)) return input
  if (input instanceof ArrayBuffer) return Buffer.from(input)
  if (ArrayBuffer.isView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  }
  throw new TypeError('readZip expects a Buffer, Uint8Array or ArrayBuffer')
}

function findEndOfCentralDirectory(buf) {
  const min = Math.max(0, buf.length - 22 - 0xffff)
  for (let i = buf.length - 22; i >= min; i -= 1) {
    if (buf.readUInt32LE(i) !== SIG_EOCD) continue
    const commentLength = buf.readUInt16LE(i + 20)
    if (i + 22 + commentLength <= buf.length) return i
  }
  throw new Error('Invalid ZIP: end of central directory not found')
}

function assertRange(buf, offset, length, label) {
  if (offset < 0 || length < 0 || offset + length > buf.length) {
    throw new Error('Invalid ZIP: truncated ' + label)
  }
}

/**
 * Read every file entry from a ZIP archive.
 * @param {Buffer|Uint8Array|ArrayBuffer} input
 * @returns {Map<string, Buffer>}
 */
export function readZip(input) {
  const buf = asBuffer(input)
  if (buf.length < 22) throw new Error('Invalid ZIP: file is too small')

  const eocd = findEndOfCentralDirectory(buf)
  const entryCount = buf.readUInt16LE(eocd + 10)
  const centralSize = buf.readUInt32LE(eocd + 12)
  const centralOffset = buf.readUInt32LE(eocd + 16)

  if (entryCount === 0xffff || centralOffset === 0xffffffff || centralSize === 0xffffffff) {
    throw new Error('ZIP64 archives are not supported')
  }
  if (entryCount > 100000) throw new Error('Invalid ZIP: too many entries')
  assertRange(buf, centralOffset, centralSize, 'central directory')

  const files = new Map()
  let pointer = centralOffset

  for (let i = 0; i < entryCount; i += 1) {
    assertRange(buf, pointer, 46, 'central directory entry')
    if (buf.readUInt32LE(pointer) !== SIG_CENTRAL) {
      throw new Error('Invalid ZIP: bad central directory signature at ' + pointer)
    }

    const flags = buf.readUInt16LE(pointer + 8)
    const method = buf.readUInt16LE(pointer + 10)
    const compressedSize = buf.readUInt32LE(pointer + 20)
    const uncompressedSize = buf.readUInt32LE(pointer + 24)
    const nameLength = buf.readUInt16LE(pointer + 28)
    const extraLength = buf.readUInt16LE(pointer + 30)
    const commentLength = buf.readUInt16LE(pointer + 32)
    const localOffset = buf.readUInt32LE(pointer + 42)

    assertRange(buf, pointer + 46, nameLength + extraLength + commentLength, 'central directory name')
    const name = buf.toString('utf8', pointer + 46, pointer + 46 + nameLength).replace(/\\/g, '/')
    pointer += 46 + nameLength + extraLength + commentLength

    if (name.endsWith('/')) continue
    if (flags & 0x0001) throw new Error('Encrypted ZIP entries are not supported: ' + name)
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) {
      throw new Error('ZIP64 entries are not supported: ' + name)
    }

    assertRange(buf, localOffset, 30, 'local header for ' + name)
    if (buf.readUInt32LE(localOffset) !== SIG_LOCAL) {
      throw new Error('Invalid ZIP: bad local header for ' + name)
    }

    const localNameLength = buf.readUInt16LE(localOffset + 26)
    const localExtraLength = buf.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + localNameLength + localExtraLength
    assertRange(buf, dataStart, compressedSize, 'data for ' + name)

    const raw = buf.subarray(dataStart, dataStart + compressedSize)
    let data
    if (method === 0) {
      data = Buffer.from(raw)
    } else if (method === 8) {
      data = inflateRawSync(raw)
    } else {
      throw new Error('Unsupported ZIP compression method ' + method + ' for ' + name)
    }

    if (data.length !== uncompressedSize) {
      throw new Error(
        'Invalid ZIP: size mismatch for ' + name + ' (expected ' + uncompressedSize + ', got ' + data.length + ')'
      )
    }
    files.set(name, data)
  }

  return files
}

/**
 * Convenience wrapper returning UTF-8 text for every entry.
 * @param {Buffer|Uint8Array|ArrayBuffer} input
 * @returns {Map<string, string>}
 */
export function readZipText(input) {
  const out = new Map()
  for (const [name, data] of readZip(input)) {
    const text = data.toString('utf8')
    out.set(name, text.charCodeAt(0) === 0xfeff ? text.slice(1) : text)
  }
  return out
}
