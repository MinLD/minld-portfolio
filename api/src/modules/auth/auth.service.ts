import { randomBytes, randomUUID, createHash } from 'node:crypto'
import type { AccountTokenPurpose, User, UserCredential } from '@prisma/client'
import { AppError } from '../../common/errors/AppError.js'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../common/auth/jwt.js'
import { hashPassword, verifyPassword } from '../../common/auth/password.js'
import { sendPasswordResetEmail, sendVerificationEmail } from '../../common/mail/mailer.js'
import { env } from '../../config/env.js'
import { runTransaction } from '../../database/transaction.js'
import { toSessionDto, toUserDto } from './auth.mapper.js'
import { authRepository } from './auth.repository.js'

export const refreshTokenCookieName = env.REFRESH_TOKEN_COOKIE_NAME
const genericAuthError = new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials')
const genericMessage = { message: 'If the account exists, instructions have been sent.' }

type RequestMeta = { userAgent?: string; ipAddress?: string }
type UserWithCredential = User & { credential: UserCredential | null }

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function newRawToken() {
  return randomBytes(32).toString('hex')
}

function futureDate(ms: number) {
  return new Date(Date.now() + ms)
}

function accessTokenFor(user: User, sessionId?: string) {
  return signAccessToken({ sub: user.id, sid: sessionId, role: user.role, status: user.status })
}

async function createAccountToken(userId: string, purpose: AccountTokenPurpose, tx?: Parameters<typeof authRepository.createAccountToken>[1]) {
  const rawToken = newRawToken()
  await authRepository.consumeActiveAccountTokens(userId, purpose, tx)
  await authRepository.createAccountToken({ userId, purpose, tokenHash: tokenHash(rawToken), expiresAt: futureDate(60 * 60 * 1000) }, tx)
  return rawToken
}

async function createRefreshSession(user: User, meta: RequestMeta, familyId: string = randomUUID(), rotatedFromSessionId?: string) {
  const sessionId = randomUUID()
  const refreshToken = signRefreshToken({ sub: user.id, sid: sessionId, fid: familyId })
  const expiresAt = futureDate(env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)

  await authRepository.createSession({
    id: sessionId,
    userId: user.id,
    familyId,
    refreshTokenHash: tokenHash(refreshToken),
    expiresAt,
    rotatedFromSessionId,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  })

  return { refreshToken, sessionId }
}

function ensureTokenUsable(token: { consumedAt: Date | null; expiresAt: Date } | null) {
  if (!token || token.consumedAt || token.expiresAt <= new Date()) {
    throw new AppError(400, 'INVALID_TOKEN', 'Invalid token')
  }
}

export async function registerUser(input: { displayName: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase()
  const existingUser = await authRepository.findUserByEmail(email)
  if (existingUser) throw new AppError(409, 'EMAIL_EXISTS', 'Email already exists')

  const { user, rawToken } = await runTransaction(async (tx) => {
    const user = await authRepository.createUser({ email, displayName: input.displayName.trim(), passwordHash: await hashPassword(input.password) }, tx)
    const rawToken = await createAccountToken(user.id, 'EMAIL_VERIFICATION', tx)
    return { user, rawToken }
  })

  await sendVerificationEmail(user.email, rawToken)
  return { user: toUserDto(user) }
}

export async function verifyEmail(rawToken: string) {
  const token = await authRepository.findAccountToken(tokenHash(rawToken), 'EMAIL_VERIFICATION')
  ensureTokenUsable(token)

  await runTransaction(async (tx) => {
    await authRepository.verifyUserEmail(token!.userId, tx)
    await authRepository.consumeAccountToken(token!.id, tx)
  })

  return { message: 'Email verified.' }
}

export async function resendVerification(email: string) {
  const user = await authRepository.findUserByEmail(email.trim().toLowerCase())

  if (user && !user.emailVerifiedAt) {
    const rawToken = await runTransaction((tx) => createAccountToken(user.id, 'EMAIL_VERIFICATION', tx))
    await sendVerificationEmail(user.email, rawToken)
  }

  return genericMessage
}

export async function loginUser(input: { email: string; password: string }, meta: RequestMeta) {
  const user = await authRepository.findUserByEmail(input.email.trim().toLowerCase())
  if (!user?.credential || !(await verifyPassword(input.password, user.credential.passwordHash))) throw genericAuthError
  if (user.status !== 'ACTIVE' || !user.emailVerifiedAt) throw genericAuthError

  await authRepository.updateLastLogin(user.id)
  const session = await createRefreshSession(user, meta)

  return { user: toUserDto(user), accessToken: accessTokenFor(user, session.sessionId), refreshToken: session.refreshToken }
}

export async function refreshSession(rawRefreshToken: string, meta: RequestMeta) {
  verifyRefreshToken(rawRefreshToken)
  const session = await authRepository.findSessionByRefreshTokenHash(tokenHash(rawRefreshToken))

  if (!session || session.revokedAt || session.expiresAt <= new Date()) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')
  if (session.user.status !== 'ACTIVE') throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')

  await authRepository.revokeSession(session.id)
  const nextSession = await createRefreshSession(session.user, meta, session.familyId, session.id)

  return { user: toUserDto(session.user), accessToken: accessTokenFor(session.user, nextSession.sessionId), refreshToken: nextSession.refreshToken }
}

export async function logoutSession(rawRefreshToken: string | undefined) {
  if (!rawRefreshToken) return { message: 'Logged out.' }
  try {
    const session = await authRepository.findSessionByRefreshTokenHash(tokenHash(rawRefreshToken))
    if (session) await authRepository.revokeSession(session.id)
  } catch {
    return { message: 'Logged out.' }
  }
  return { message: 'Logged out.' }
}

export async function getCurrentUser(accessToken: string) {
  const payload = verifyAccessToken(accessToken)
  const user = await authRepository.findUserById(payload.sub)
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')
  return toUserDto(user)
}

export async function forgotPassword(email: string) {
  const user = await authRepository.findUserByEmail(email.trim().toLowerCase())
  if (user) {
    const rawToken = await runTransaction((tx) => createAccountToken(user.id, 'PASSWORD_RESET', tx))
    await sendPasswordResetEmail(user.email, rawToken)
  }
  return genericMessage
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  const token = await authRepository.findAccountToken(tokenHash(input.token), 'PASSWORD_RESET')
  ensureTokenUsable(token)

  await runTransaction(async (tx) => {
    await authRepository.updatePassword(token!.userId, await hashPassword(input.newPassword), tx)
    await authRepository.consumeAccountToken(token!.id, tx)
    await authRepository.revokeAllSessions(token!.userId, tx)
  })

  return { message: 'Password reset.' }
}

export async function changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
  const user = await authRepository.findUserById(userId)
  if (!user?.credential || !(await verifyPassword(input.currentPassword, user.credential.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials')
  }

  await runTransaction(async (tx) => {
    await authRepository.updatePassword(userId, await hashPassword(input.newPassword), tx)
    await authRepository.revokeAllSessions(userId, tx)
  })

  return { message: 'Password changed. Please sign in again.' }
}

export async function listSessions(userId: string, currentSessionId?: string) {
  const sessions = await authRepository.listSessions(userId)
  return { sessions: sessions.map((session) => toSessionDto(session, currentSessionId)) }
}

export async function revokeOwnSession(userId: string, sessionId: string) {
  const session = await authRepository.findSessionById(sessionId)
  if (!session || session.userId !== userId) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found')
  await authRepository.revokeSession(session.id)
  return { message: 'Session revoked.' }
}

export async function logoutAll(userId: string) {
  await authRepository.revokeAllSessions(userId)
  return { message: 'Logged out from all sessions.' }
}

export function parseAccessTokenHeader(authorization: string | undefined) {
  const [scheme, token] = authorization?.split(' ') ?? []
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized')
  return token
}
