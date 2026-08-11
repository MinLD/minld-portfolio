import type { RequestHandler } from 'express'
import { verifyAccessToken } from '../auth/jwt.js'
import { AppError } from '../errors/AppError.js'

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const [scheme, token] = req.header('authorization')?.split(' ') ?? []
    if (scheme !== 'Bearer' || !token) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')
    const payload = verifyAccessToken(token)
    res.locals.auth = { userId: payload.sub, sessionId: payload.sid, role: payload.role, status: payload.status }
    next()
  } catch (error) {
    next(error)
  }
}
