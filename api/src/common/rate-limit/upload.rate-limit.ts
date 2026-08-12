import { makeRateLimit } from './rate-limit.factory.js'

export const adminUploadRateLimit = makeRateLimit(30, 60 * 60 * 1000)
export const userUploadRateLimit = makeRateLimit(30, 60 * 60 * 1000)
