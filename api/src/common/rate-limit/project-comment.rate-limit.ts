import { makeRateLimit } from './rate-limit.factory.js'

export const projectCommentCreateRateLimit = makeRateLimit(20)
