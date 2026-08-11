import type { RequestHandler } from 'express'
import { env } from '../../config/env.js'
import { AppError } from '../errors/AppError.js'

export const requireTrustedOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.header('origin')
  const fetchSite = req.header('sec-fetch-site')

  if (origin && !env.CORS_ORIGINS.includes(origin)) {
    next(new AppError(403, 'UNTRUSTED_ORIGIN', 'Untrusted origin'))
    return
  }

  if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) {
    next(new AppError(403, 'UNTRUSTED_ORIGIN', 'Untrusted origin'))
    return
  }

  next()
}
