import type { AccountTokenPurpose, Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import type { TxClient } from '../../database/transaction.js'

const db = (tx?: TxClient) => tx ?? prisma

export const authRepository = {
  findUserByEmail(email: string, tx?: TxClient) {
    return db(tx).user.findUnique({ where: { email }, include: { credential: true } })
  },

  findUserById(userId: string, tx?: TxClient) {
    return db(tx).user.findUnique({ where: { id: userId }, include: { credential: true } })
  },

  createUser(data: { email: string; displayName: string; passwordHash: string }, tx?: TxClient) {
    return db(tx).user.create({
      data: {
        email: data.email,
        displayName: data.displayName,
        role: 'USER',
        status: 'ACTIVE',
        credential: { create: { passwordHash: data.passwordHash } },
      },
      include: { credential: true },
    })
  },

  createAdmin(data: { email: string; displayName: string; passwordHash: string }, tx?: TxClient) {
    return db(tx).user.upsert({
      where: { email: data.email },
      update: {
        displayName: data.displayName,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        credential: { upsert: { update: { passwordHash: data.passwordHash, passwordUpdatedAt: new Date() }, create: { passwordHash: data.passwordHash } } },
      },
      create: {
        email: data.email,
        displayName: data.displayName,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        credential: { create: { passwordHash: data.passwordHash } },
      },
      include: { credential: true },
    })
  },

  updateLastLogin(userId: string, tx?: TxClient) {
    return db(tx).user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } })
  },

  verifyUserEmail(userId: string, tx?: TxClient) {
    return db(tx).user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } })
  },

  updatePassword(userId: string, passwordHash: string, tx?: TxClient) {
    return db(tx).userCredential.update({ where: { userId }, data: { passwordHash, passwordUpdatedAt: new Date() } })
  },

  createAccountToken(data: { userId: string; purpose: AccountTokenPurpose; tokenHash: string; expiresAt: Date }, tx?: TxClient) {
    return db(tx).accountToken.create({ data })
  },

  findAccountToken(tokenHash: string, purpose: AccountTokenPurpose, tx?: TxClient) {
    return db(tx).accountToken.findUnique({ where: { tokenHash }, include: { user: { include: { credential: true } } } }).then((token) => (token?.purpose === purpose ? token : null))
  },

  consumeAccountToken(id: string, tx?: TxClient) {
    return db(tx).accountToken.update({ where: { id }, data: { consumedAt: new Date() } })
  },

  consumeActiveAccountTokens(userId: string, purpose: AccountTokenPurpose, tx?: TxClient) {
    return db(tx).accountToken.updateMany({ where: { userId, purpose, consumedAt: null, expiresAt: { gt: new Date() } }, data: { consumedAt: new Date() } })
  },

  createSession(data: Prisma.AuthSessionUncheckedCreateInput, tx?: TxClient) {
    return db(tx).authSession.create({ data })
  },

  findSessionByRefreshTokenHash(refreshTokenHash: string, tx?: TxClient) {
    return db(tx).authSession.findUnique({ where: { refreshTokenHash }, include: { user: { include: { credential: true } } } })
  },

  revokeSession(sessionId: string, tx?: TxClient) {
    return db(tx).authSession.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: new Date() } })
  },

  revokeAllSessions(userId: string, tx?: TxClient) {
    return db(tx).authSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })
  },

  listSessions(userId: string, tx?: TxClient) {
    return db(tx).authSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  },

  findSessionById(sessionId: string, tx?: TxClient) {
    return db(tx).authSession.findUnique({ where: { id: sessionId } })
  },
}
