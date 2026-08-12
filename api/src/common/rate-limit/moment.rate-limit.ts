import { makeRateLimit } from './rate-limit.factory.js'

export const momentLikeRateLimit = makeRateLimit(60, 60 * 1000)
