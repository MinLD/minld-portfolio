import type { RequestHandler } from 'express'
import { clearRefreshCookie, setRefreshCookie } from '../../common/auth/cookie.js'
import { AppError } from '../../common/errors/AppError.js'
import { sendCreated, sendSuccess } from '../../common/responses/api-response.js'
import { env } from '../../config/env.js'
import { changePassword, forgotPassword, getCurrentUser, listSessions, loginUser, logoutAll, logoutSession, parseAccessTokenHeader, refreshSession, registerUser, resendVerification, resetPassword, revokeOwnSession, verifyEmail } from './auth.service.js'

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
    const { refreshToken, ...body } = await loginUser(req.body, metaFromRequest(req))
    setRefreshCookie(res, refreshToken)
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
    const { refreshToken: nextRefreshToken, ...body } = await refreshSession(refreshToken, metaFromRequest(req))
    setRefreshCookie(res, nextRefreshToken)
    res.setHeader('Cache-Control', 'no-store')
    sendSuccess(res, body)
  } catch (error) {
    next(error)
  }
}

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const body = await logoutSession(req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME])
    clearRefreshCookie(res)
    sendSuccess(res, body)
  } catch (error) {
    next(error)
  }
}

export const meController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, { user: await getCurrentUser(parseAccessTokenHeader(req.header('authorization'))) })
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
    clearRefreshCookie(res)
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
    clearRefreshCookie(res)
    sendSuccess(res, body)
  } catch (error) {
    next(error)
  }
}
