import type { ErrorRequestHandler } from 'express'
import multer from 'multer'
import { ZodError } from 'zod'
import { AppError } from '../errors/AppError.js'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const requestId = res.locals.requestId

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.issues },
      requestId,
    })
    return
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
      requestId,
    })
    return
  }

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      success: false,
      error: { code: 'MEDIA_TOO_LARGE', message: 'Uploaded file is too large' },
      requestId,
    })
    return
  }

  console.error(error)
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
    requestId,
  })
}
