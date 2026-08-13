import type { CookieOptions, Response } from 'express'
import { env } from '../../config/env.js'

export function getAccessCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api',
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1000,
  }
}

export function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  }
}

export function setAccessCookie(res: Response, accessToken: string) {
  res.cookie(env.ACCESS_TOKEN_COOKIE_NAME, accessToken, getAccessCookieOptions())
}

export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions())
}

export function clearAccessCookie(res: Response) {
  res.clearCookie(env.ACCESS_TOKEN_COOKIE_NAME, { ...getAccessCookieOptions(), maxAge: undefined })
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, { ...getRefreshCookieOptions(), maxAge: undefined })
}

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  setAccessCookie(res, tokens.accessToken)
  setRefreshCookie(res, tokens.refreshToken)
}

export function clearAuthCookies(res: Response) {
  clearAccessCookie(res)
  clearRefreshCookie(res)
}
