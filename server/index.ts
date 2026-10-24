import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import { PORT, UPLOAD_DIR, IS_PROD } from './config.js'
import {
  db,
  getAbout,
  getFeed,
  getNote,
  getNotesForOwner,
  toPublicNote,
  updateAbout,
} from './db.js'
import { currentOwnerHash, ensureOwner } from './auth.js'
import {
  adminEnabled,
  adminLoginKey,
  adminLoginRateLimited,
  clearAdminLoginFailures,
  isAdmin,
  loginAdmin,
  logoutAdmin,
  recordAdminLoginFailure,
} from './admin.js'
import {
  ensureDefaultAboutImage,
  removeImage,
  saveImage,
  upload,
} from './uploads.js'
import { sanitizeMusic, searchMusic } from './music.js'

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }

const PAPERS = new Set(['cream', 'blush', 'sage', 'sky', 'lilac', 'white'])
const INKS = new Set(['ink', 'cocoa', 'forest', 'plum', 'blue'])
const FONTS = new Set(['hand', 'serif', 'sans'])
const DOODLES = new Set(['none', 'star', 'heart', 'flower', 'clip'])

const DEFAULT_DESIGN = {
  paper: 'cream',
  ink: 'ink',
  font: 'hand',
  doodle: 'star',
}

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\r\n/g, '\n').trim().slice(0, 5000)
}

function normalizeAboutText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\r\n/g, '\n').trim().slice(0, 2000)
}

function normalizeName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const clean = value.trim().replace(/\s+/g, ' ').slice(0, 80)
  return clean || null
}

function parseDesign(body: Record<string, unknown>) {
  return {
    paper:
      typeof body.paper === 'string' && PAPERS.has(body.paper)
        ? body.paper
        : DEFAULT_DESIGN.paper,
    ink:
      typeof body.ink === 'string' && INKS.has(body.ink)
        ? body.ink
        : DEFAULT_DESIGN.ink,
    font:
      typeof body.font === 'string' && FONTS.has(body.font)
        ? body.font
        : DEFAULT_DESIGN.font,
    doodle:
      typeof body.doodle === 'string' && DOODLES.has(body.doodle)
        ? body.doodle
        : DEFAULT_DESIGN.doodle,
  }
}

function parseMusicField(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('INVALID_MUSIC')
  }
  try {
    return sanitizeMusic(parsed)
  } catch {
    throw new Error('INVALID_MUSIC')
  }
}

function isRemoveRequested(value: unknown): boolean {
  return value === 'true' || value === '1'
}

ensureDefaultAboutImage()

const app = express()

if (IS_PROD) app.set('trust proxy', 1)

app.disable('x-powered-by')
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.mzstatic.com',
          'https://*.apple.com',
        ],
        mediaSrc: ["'self'", 'https://*.apple.com'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  }),
)
app.use(compression())
app.use(cookieParser())
app.use(express.json({ limit: '256kb' }))

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', immutable: true }))

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

app.get(
  '/api/admin/session',
  asyncHandler(async (req, res) => {
    res.json({ enabled: adminEnabled(), isAdmin: isAdmin(req) })
  }),
)

app.post(
  '/api/admin/login',
  asyncHandler(async (req, res) => {
    if (!adminEnabled()) {
      throw new ApiError(503, 'Admin is not configured.')
    }

    const loginKey = adminLoginKey(req)
    if (adminLoginRateLimited(loginKey)) {
      throw new ApiError(429, 'Too many attempts. Try again later.')
    }

    const password =
      typeof req.body?.password === 'string' ? req.body.password : ''

    if (!loginAdmin(req, res, password)) {
      recordAdminLoginFailure(loginKey)
      throw new ApiError(401, 'Incorrect password.')
    }

    clearAdminLoginFailures(loginKey)
    res.json({ isAdmin: true })
  }),
)

app.post(
  '/api/admin/logout',
  asyncHandler(async (_req, res) => {
    logoutAdmin(res)
    res.json({ ok: true })
  }),
)

app.get(
  '/api/notes',
  asyncHandler(async (_req, res) => {
    res.json({ notes: getFeed().map(toPublicNote) })
  }),
)

app.get(
  '/api/notes/mine',
  asyncHandler(async (req, res) => {
    const ownerHash = currentOwnerHash(req)
    const notes = ownerHash
      ? getNotesForOwner(ownerHash).map(toPublicNote)
      : []
    res.json({ notes })
  }),
)

app.post(
  '/api/notes',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const text = normalizeText(req.body.text)
    const senderName = normalizeName(req.body.senderName)
    const recipientName = normalizeName(req.body.recipientName)
    const design = parseDesign(req.body)
    const music = parseMusicField(req.body.music)

    if (!text && !req.file && !music) {
      throw new ApiError(400, 'Add something first.')
    }

    const ownerHash = ensureOwner(req, res)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    let imageFile: string | null = null

    try {
      if (req.file) imageFile = await saveImage(req.file)

      db.prepare(
        `INSERT INTO notes (
          id, text, sender_name, recipient_name, image_file, music_json,
          paper, ink, font, doodle, owner_hash, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        text,
        senderName,
        recipientName,
        imageFile,
        music ? JSON.stringify(music) : null,
        design.paper,
        design.ink,
        design.font,
        design.doodle,
        ownerHash,
        now,
        now,
      )

      const row = getNote(id)
      if (!row) throw new ApiError(500, 'Could not publish the note.')
      res.status(201).json({ note: toPublicNote(row) })
    } catch (error) {
      if (imageFile) await removeImage(imageFile)
      throw error
    }
  }),
)

app.patch(
  '/api/notes/:id',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const existing = getNote(req.params.id)
    if (!existing) throw new ApiError(404, 'Note not found.')

    const ownerHash = currentOwnerHash(req)
    if (
      !isAdmin(req) &&
      (!ownerHash || existing.owner_hash !== ownerHash)
    ) {
      throw new ApiError(403, 'You can only edit your own notes.')
    }

    const text = normalizeText(req.body.text)
    const senderName = normalizeName(req.body.senderName)
    const recipientName = normalizeName(req.body.recipientName)
    const design = parseDesign(req.body)
    const music = parseMusicField(req.body.music)
    const remove = isRemoveRequested(req.body.removeImage)

    let imageFile = existing.image_file
    let newImage: string | null = null

    try {
      if (req.file) {
        newImage = await saveImage(req.file)
        imageFile = newImage
      } else if (remove) {
        imageFile = null
      }

      if (!text && !imageFile && !music) {
        throw new ApiError(400, 'Add something first.')
      }

      db.prepare(
        `UPDATE notes SET
          text = ?, sender_name = ?, recipient_name = ?, image_file = ?,
          music_json = ?, paper = ?, ink = ?, font = ?, doodle = ?,
          updated_at = ?
        WHERE id = ?`,
      ).run(
        text,
        senderName,
        recipientName,
        imageFile,
        music ? JSON.stringify(music) : null,
        design.paper,
        design.ink,
        design.font,
        design.doodle,
        new Date().toISOString(),
        existing.id,
      )
    } catch (error) {
      if (newImage) await removeImage(newImage)
      throw error
    }

    if (existing.image_file && existing.image_file !== imageFile) {
      await removeImage(existing.image_file)
    }

    const row = getNote(existing.id)
    if (!row) throw new ApiError(500, 'Could not save the note.')
    res.json({ note: toPublicNote(row) })
  }),
)

app.delete(
  '/api/notes/:id',
  asyncHandler(async (req, res) => {
    const existing = getNote(req.params.id)
    if (!existing) throw new ApiError(404, 'Note not found.')

    const ownerHash = currentOwnerHash(req)
    if (
      !isAdmin(req) &&
      (!ownerHash || existing.owner_hash !== ownerHash)
    ) {
      throw new ApiError(403, 'You can only delete your own notes.')
    }

    db.prepare('DELETE FROM notes WHERE id = ?').run(existing.id)
    if (existing.image_file) await removeImage(existing.image_file)
    res.json({ ok: true })
  }),
)

app.get(
  '/api/music/search',
  asyncHandler(async (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    if (query.length < 2) {
      res.json({ results: [] })
      return
    }

    try {
      const results = await searchMusic(query)
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.json({ results })
    } catch {
      throw new ApiError(502, 'Music search is unavailable.')
    }
  }),
)

app.get(
  '/api/about',
  asyncHandler(async (req, res) => {
    const row = getAbout()
    const ownerHash = currentOwnerHash(req)
    const canEdit =
      isAdmin(req) ||
      !row.owner_hash ||
      (!!ownerHash && row.owner_hash === ownerHash)

    res.json({
      about: {
        text: row.text,
        imageUrl: row.image_file ? `/uploads/${row.image_file}` : null,
        canEdit,
        updatedAt: row.updated_at,
      },
    })
  }),
)

app.put(
  '/api/about',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const row = getAbout()
    const ownerHash = currentOwnerHash(req)

    if (row.owner_hash && row.owner_hash !== ownerHash && !isAdmin(req)) {
      throw new ApiError(403, 'This About page is not yours to edit.')
    }

    const effectiveOwner = row.owner_hash ?? ensureOwner(req, res)
    const text = normalizeAboutText(req.body.text)
    const remove = isRemoveRequested(req.body.removeImage)

    let imageFile = row.image_file
    let newImage: string | null = null

    try {
      if (req.file) {
        newImage = await saveImage(req.file)
        imageFile = newImage
      } else if (remove) {
        imageFile = null
      }

      if (!text && !imageFile) {
        throw new ApiError(400, 'Add something first.')
      }

      updateAbout(text, imageFile, effectiveOwner)
    } catch (error) {
      if (newImage) await removeImage(newImage)
      throw error
    }

    if (row.image_file && row.image_file !== imageFile) {
      await removeImage(row.image_file)
    }

    res.json({
      about: {
        text,
        imageUrl: imageFile ? `/uploads/${imageFile}` : null,
        canEdit: true,
        updatedAt: new Date().toISOString(),
      } satisfies {
        text: string
        imageUrl: string | null
        canEdit: boolean
        updatedAt: string
      },
    })
  }),
)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

const distDir = path.resolve(process.cwd(), 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      next()
      return
    }
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (res.headersSent) {
      next(error)
      return
    }

    if (error instanceof ApiError) {
      res.status(error.status).json({ error: error.message })
      return
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Image is too large.'
          : 'Upload failed.'
      res.status(400).json({ error: message })
      return
    }

    if (error instanceof Error) {
      if (error.message === 'UNSUPPORTED_IMAGE') {
        res.status(400).json({ error: 'Unsupported image.' })
        return
      }
      if (error.message === 'INVALID_IMAGE') {
        res.status(400).json({ error: "Couldn't read that image." })
        return
      }
      if (error.message === 'INVALID_MUSIC') {
        res.status(400).json({ error: 'Invalid music attachment.' })
        return
      }
    }

    console.error(error)
    res.status(500).json({ error: 'Something went wrong.' })
  },
)

app.listen(PORT, () => {
  console.log(`Unsently API listening on http://localhost:${PORT}`)
})
