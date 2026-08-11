import rateLimit from 'express-rate-limit'
import { env } from '../../config/env.js'

export function makeRateLimit(max: number, windowMs = env.RATE_LIMIT_WINDOW_MS) {
  return rateLimit({
    windowMs,
    limit: max,
    skip: () => env.NODE_ENV === 'test',
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
  })
}
