import crypto from 'node:crypto'
import type { Request, Response } from 'express'
import { ADMIN_PASSWORD, IS_PROD } from './config.js'

const COOKIE_NAME = 'unsently_admin'
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 8

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function cookieValue(): string | null {
  if (!ADMIN_PASSWORD) return null
  return crypto
    .createHmac('sha256', ADMIN_PASSWORD)
    .update('unsently-admin-v1')
    .digest('base64url')
}

function safeEqual(left: string, right: string): boolean {
  const leftHash = crypto.createHash('sha256').update(left).digest()
  const rightHash = crypto.createHash('sha256').update(right).digest()
  return crypto.timingSafeEqual(leftHash, rightHash)
}

export function adminEnabled(): boolean {
  return Boolean(ADMIN_PASSWORD)
}

export function isAdmin(req: Request): boolean {
  const expected = cookieValue()
  const raw = req.cookies?.[COOKIE_NAME]
  return Boolean(
    expected && typeof raw === 'string' && safeEqual(raw, expected),
  )
}

export function loginAdmin(
  req: Request,
  res: Response,
  password: unknown,
): boolean {
  if (
    !ADMIN_PASSWORD ||
    typeof password !== 'string' ||
    !safeEqual(password, ADMIN_PASSWORD)
  ) {
    return false
  }

  const value = cookieValue()
  if (!value) return false

  res.cookie(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  })
  return true
}

export function logoutAdmin(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    path: '/',
  })
}

export function adminLoginKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown'
}

export function adminLoginRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(key)
  if (!entry || entry.resetAt <= now) {
    loginAttempts.delete(key)
    return false
  }
  return entry.count >= MAX_LOGIN_ATTEMPTS
}

export function recordAdminLoginFailure(key: string): void {
  const now = Date.now()
  const entry = loginAttempts.get(key)
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return
  }
  entry.count += 1
}

export function clearAdminLoginFailures(key: string): void {
  loginAttempts.delete(key)
}
