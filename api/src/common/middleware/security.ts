import cors from 'cors'
import type { RequestHandler } from 'express'
import helmet from 'helmet'
import { env } from '../../config/env.js'
import { AppError } from '../errors/AppError.js'
import { globalRateLimit } from '../rate-limit/global.rate-limit.js'

export const helmetMiddleware = helmet()

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || env.CORS_ORIGINS.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'CORS origin denied'))
  },
})

export const securityMiddleware: RequestHandler[] = [helmetMiddleware, corsMiddleware, globalRateLimit]
