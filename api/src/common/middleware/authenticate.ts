import type { RequestHandler } from 'express'
import { env } from '../../config/env.js'
import { verifyAccessToken } from '../auth/jwt.js'
import { AppError } from '../errors/AppError.js'

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const accessToken = req.cookies?.[env.ACCESS_TOKEN_COOKIE_NAME]
    if (!accessToken) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')
    const payload = verifyAccessToken(accessToken)
    res.locals.auth = { userId: payload.sub, sessionId: payload.sid, role: payload.role, status: payload.status }
    next()
  } catch (error) {
    next(error)
  }
}
