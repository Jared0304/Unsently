import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import multer from 'multer'
import { UPLOAD_DIR } from './config.js'

const MAX_BYTES = 8 * 1024 * 1024

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
])

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_BYTES,
    files: 1,
    fields: 20,
    fieldSize: 20_000,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      callback(new Error('UNSUPPORTED_IMAGE'))
      return
    }
    callback(null, true)
  },
})

export async function saveImage(file: Express.Multer.File): Promise<string> {
  const filename = `${crypto.randomUUID()}.webp`
  const destination = path.join(UPLOAD_DIR, filename)

  try {
    await sharp(file.buffer, {
      failOn: 'error',
      limitInputPixels: 30_000_000,
    })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toFile(destination)

    return filename
  } catch {
    await fs.rm(destination, { force: true })
    throw new Error('INVALID_IMAGE')
  }
}

export async function removeImage(filename: string | null | undefined) {
  if (!filename) return
  const safeName = path.basename(filename)
  if (!/^[a-f0-9-]+\.webp$/i.test(safeName)) return
  await fs.rm(path.join(UPLOAD_DIR, safeName), { force: true })
}
