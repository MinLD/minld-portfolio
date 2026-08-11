import type { Response } from 'express'
import { env } from '../../config/env.js'

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax' as const,
    path: '/api/v1/auth',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  }
}

export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions())
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, { ...getRefreshCookieOptions(), maxAge: undefined })
}
