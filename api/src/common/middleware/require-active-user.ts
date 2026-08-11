import type { RequestHandler } from 'express'
import { AppError } from '../errors/AppError.js'

export const requireActiveUser: RequestHandler = (_req, res, next) => {
  if (res.locals.auth?.status !== 'ACTIVE') {
    next(new AppError(403, 'USER_NOT_ACTIVE', 'User is not active'))
    return
  }
  next()
}
