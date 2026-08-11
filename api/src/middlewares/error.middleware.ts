import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { httpStatus } from '../utils/http-status.js'

export const notFoundMiddleware: RequestHandler = (_req, res) => {
  res.status(httpStatus.notFound).json({ message: 'Not found' })
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(httpStatus.badRequest).json({ message: 'Validation failed', issues: error.issues })
    return
  }

  console.error(error)
  res.status(httpStatus.internalServerError).json({ message: 'Internal server error' })
}
