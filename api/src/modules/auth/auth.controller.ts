import type { RequestHandler } from 'express'
import { clearAuthCookies, setAuthCookies } from '../../common/auth/cookie.js'
import { AppError } from '../../common/errors/AppError.js'
import { sendCreated, sendSuccess } from '../../common/responses/api-response.js'
import { env } from '../../config/env.js'
import { changePassword, forgotPassword, getCurrentUser, listSessions, loginUser, logoutAll, logoutSession, refreshSession, registerUser, resendVerification, resetPassword, revokeOwnSession, verifyEmail } from './auth.service.js'

const metaFromRequest = (req: Parameters<RequestHandler>[0]) => ({ userAgent: req.header('user-agent') ?? undefined, ipAddress: req.ip })

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await registerUser(req.body))
  } catch (error) {
    next(error)
  }
}

export const verifyEmailController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await verifyEmail(req.body.token))
  } catch (error) {
    next(error)
  }
}

export const resendVerificationController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await resendVerification(req.body.email))
  } catch (error) {
    next(error)
  }
}

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, ...body } = await loginUser(req.body, metaFromRequest(req))
    setAuthCookies(res, { accessToken, refreshToken })
    res.setHeader('Cache-Control', 'no-store')
    sendSuccess(res, body)
  } catch (error) {
    next(error)
  }
}

export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME]
    if (!refreshToken) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')
    const { accessToken, refreshToken: nextRefreshToken, ...body } = await refreshSession(refreshToken, metaFromRequest(req))
    setAuthCookies(res, { accessToken, refreshToken: nextRefreshToken })
    res.setHeader('Cache-Control', 'no-store')
    sendSuccess(res, body)
  } catch (error) {
    clearAuthCookies(res)
    next(error instanceof AppError ? error : new AppError(401, 'UNAUTHORIZED', 'Unauthorized'))
  }
}

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const body = await logoutSession(req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME])
    clearAuthCookies(res)
    sendSuccess(res, body)
  } catch (error) {
    next(error)
  }
}

export const meController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, { user: await getCurrentUser(res.locals.auth.userId) })
  } catch (error) {
    next(error)
  }
}

export const forgotPasswordController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await forgotPassword(req.body.email))
  } catch (error) {
    next(error)
  }
}

export const resetPasswordController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await resetPassword(req.body))
  } catch (error) {
    next(error)
  }
}

export const changePasswordController: RequestHandler = async (req, res, next) => {
  try {
    const body = await changePassword(res.locals.auth.userId, req.body)
    clearAuthCookies(res)
    sendSuccess(res, body)
  } catch (error) {
    next(error)
  }
}

export const sessionsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listSessions(res.locals.auth.userId, res.locals.auth.sessionId))
  } catch (error) {
    next(error)
  }
}

export const revokeSessionController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await revokeOwnSession(res.locals.auth.userId, String(req.params.sessionId)))
  } catch (error) {
    next(error)
  }
}

export const logoutAllController: RequestHandler = async (_req, res, next) => {
  try {
    const body = await logoutAll(res.locals.auth.userId)
    clearAuthCookies(res)
    sendSuccess(res, body)
  } catch (error) {
    next(error)
  }
}
