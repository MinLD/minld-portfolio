import { makeRateLimit } from './rate-limit.factory.js'

export const momentLikeRateLimit = makeRateLimit(60, 60 * 1000)
export const momentCommentCreateRateLimit = makeRateLimit(20)
