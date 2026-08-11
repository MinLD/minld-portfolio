import { env } from '../../config/env.js'
import { makeRateLimit } from './rate-limit.factory.js'

export const globalRateLimit = makeRateLimit(env.RATE_LIMIT_MAX)
