import type { UserRole } from '@prisma/client'
import type { RequestHandler } from 'express'
import { AppError } from '../errors/AppError.js'

export function requireRole(role: UserRole): RequestHandler {
  return (_req, res, next) => {
    if (res.locals.auth?.role !== role) {
      next(new AppError(403, 'FORBIDDEN', 'Forbidden'))
      return
    }
    next()
  }
}
