import type { RequestHandler } from 'express'
import { AppError } from '../errors/AppError.js'

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`))
}
