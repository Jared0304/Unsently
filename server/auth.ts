import crypto from 'node:crypto'
import type { Request, Response } from 'express'

const COOKIE_NAME = 'unsently_owner'
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{40,100}$/
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function hashOwnerToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function tokenFromRequest(req: Request): string | null {
  const raw = req.cookies?.[COOKIE_NAME]
  if (typeof raw !== 'string' || !TOKEN_PATTERN.test(raw)) return null
  return raw
}

export function currentOwnerHash(req: Request): string | null {
  const token = tokenFromRequest(req)
  return token ? hashOwnerToken(token) : null
}

export function ensureOwner(req: Request, res: Response): string {
  const existing = tokenFromRequest(req)
  if (existing) return hashOwnerToken(existing)

  const token = crypto.randomBytes(32).toString('base64url')
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_YEAR_MS,
    path: '/',
  })
  return hashOwnerToken(token)
}
