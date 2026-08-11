import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { AppError } from '../errors/AppError.js'

type AccessPayload = { sub: string; sid?: string; role: string; status: string }
type RefreshPayload = { sub: string; sid: string; fid: string }

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m` as SignOptions['expiresIn'] })
}

export function signRefreshToken(payload: RefreshPayload) {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` as SignOptions['expiresIn'] })
}

export function verifyAccessToken(token: string) {
  try {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessPayload
    if (!payload.sub) throw new Error('missing sub')
    return payload
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')
  }
}

export function verifyRefreshToken(token: string) {
  try {
    const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshPayload
    if (!payload.sub || !payload.sid || !payload.fid) throw new Error('invalid refresh')
    return payload
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')
  }
}
