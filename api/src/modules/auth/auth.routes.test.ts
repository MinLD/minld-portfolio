import { randomUUID } from 'node:crypto'
import type { Express } from 'express'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import type { prisma as prismaType } from '../../database/prisma.js'
import type { mailOutbox as mailOutboxType } from '../../common/mail/mailer.js'
import { hashPassword } from '../../common/auth/password.js'

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.ACCESS_TOKEN_TTL_MINUTES = '15'
process.env.REFRESH_TOKEN_TTL_DAYS = '7'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'
process.env.CORS_ORIGIN = 'http://localhost:5173'

const userEmail = 'phase2.user@example.com'
const adminEmail = 'phase2.admin@example.com'
const bannedEmail = 'phase2.banned@example.com'
const otherEmail = 'phase2.other@example.com'
const password = 'valid-password'

let app: Express
let prisma: typeof prismaType
let mailOutbox: typeof mailOutboxType

function cookieHeader(response: request.Response) {
  return ([] as string[]).concat(response.headers['set-cookie'] ?? []).join(';')
}

function refreshCookie(response: request.Response) {
  return cookieHeader(response).split(';').find((cookie) => cookie.trim().startsWith('minld_pfl_refresh=')) ?? ''
}

function refreshSessionId(cookie: string) {
  const token = cookie.trim().slice('minld_pfl_refresh='.length)
  return (jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { sid: string }).sid
}

function tokenFromLastMail() {
  const html = mailOutbox.at(-1)?.html ?? ''
  const match = /token=([a-f0-9]+)/.exec(html)
  if (!match) throw new Error('token missing')
  return match[1]
}

async function deleteTestUsers() {
  await prisma.authSession.deleteMany({ where: { user: { email: { in: [userEmail, adminEmail, bannedEmail, otherEmail] } } } })
  await prisma.accountToken.deleteMany({ where: { user: { email: { in: [userEmail, adminEmail, bannedEmail, otherEmail] } } } })
  await prisma.user.deleteMany({ where: { email: { in: [userEmail, adminEmail, bannedEmail, otherEmail] } } })
}

async function createUser(email: string, role: 'USER' | 'ADMIN' = 'USER', status: 'ACTIVE' | 'BANNED' = 'ACTIVE') {
  return prisma.user.create({
    data: {
      email,
      displayName: email,
      emailVerifiedAt: new Date(),
      role,
      status,
      credential: { create: { passwordHash: await hashPassword(password) } },
    },
  })
}

async function login(email = adminEmail) {
  return request(app).post('/api/v1/auth/login').send({ email, password })
}

beforeAll(async () => {
  ;({ app } = await import('../../app.js'))
  ;({ prisma } = await import('../../database/prisma.js'))
  ;({ mailOutbox } = await import('../../common/mail/mailer.js'))
  await prisma.$connect()
})

beforeEach(async () => {
  mailOutbox.length = 0
  await deleteTestUsers()
  await createUser(adminEmail, 'ADMIN')
  await createUser(bannedEmail, 'USER', 'BANNED')
})

afterAll(async () => {
  await deleteTestUsers()
  await prisma.$disconnect()
})

describe('register and verify email', () => {
  test('registers user, sends mail, stores token hash only, safe response', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({ displayName: 'User', email: userEmail, password, role: 'ADMIN' })
    const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail }, include: { credential: true, accountTokens: true } })

    expect(response.status).toBe(201)
    expect(response.body.data.user.role).toBe('USER')
    expect(response.body.data.user.emailVerified).toBe(false)
    expect(response.body.data.user.passwordHash).toBeUndefined()
    expect(mailOutbox).toHaveLength(1)
    expect(user.credential?.passwordHash).not.toBe(password)
    expect(user.accountTokens[0].tokenHash).not.toContain(tokenFromLastMail())
  })

  test('rejects duplicate and bad password', async () => {
    await request(app).post('/api/v1/auth/register').send({ displayName: 'User', email: userEmail, password })
    expect((await request(app).post('/api/v1/auth/register').send({ displayName: 'User', email: userEmail, password })).status).toBe(409)
    expect((await request(app).post('/api/v1/auth/register').send({ displayName: 'User', email: otherEmail, password: 'short' })).status).toBe(400)
  })

  test('verifies email, rejects invalid/used/expired token, resends generically', async () => {
    await request(app).post('/api/v1/auth/register').send({ displayName: 'User', email: userEmail, password })
    const token = tokenFromLastMail()

    expect((await request(app).post('/api/v1/auth/verify-email').send({ token: 'bad-token-that-is-long-enough-000000' })).status).toBe(400)
    expect((await request(app).post('/api/v1/auth/verify-email').send({ token })).status).toBe(200)
    expect((await request(app).post('/api/v1/auth/verify-email').send({ token })).status).toBe(400)
    expect((await request(app).post('/api/v1/auth/resend-verification').send({ email: userEmail })).status).toBe(200)

    await request(app).post('/api/v1/auth/register').send({ displayName: 'Other', email: otherEmail, password })
    const expiredToken = tokenFromLastMail()
    await prisma.accountToken.updateMany({ where: { user: { email: otherEmail } }, data: { expiresAt: new Date(0) } })
    expect((await request(app).post('/api/v1/auth/verify-email').send({ token: expiredToken })).status).toBe(400)
  })
})

describe('login refresh logout me password sessions', () => {
  test('login requires verified active user and sets httpOnly refresh cookie', async () => {
    const good = await login(adminEmail)
    expect(good.status).toBe(200)
    expect(good.body.data.accessToken).toEqual(expect.any(String))
    expect(good.body.data.refreshToken).toBeUndefined()
    expect(cookieHeader(good)).toContain('HttpOnly')
    expect(await prisma.authSession.count({ where: { user: { email: adminEmail }, refreshTokenHash: { not: '' } } })).toBe(1)
    expect((await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: 'bad-password' })).status).toBe(401)
    expect((await request(app).post('/api/v1/auth/login').send({ email: 'missing@example.com', password })).status).toBe(401)
    expect((await request(app).post('/api/v1/auth/login').send({ email: bannedEmail, password })).status).toBe(401)
  })

  test('refresh rotates and rejects missing invalid expired revoked reused cookies', async () => {
    const loginResponse = await login(adminEmail)
    const cookie = refreshCookie(loginResponse)
    const oldSessionId = refreshSessionId(cookie)

    expect((await request(app).post('/api/v1/auth/refresh').set('Origin', 'http://evil.example').set('Cookie', cookie)).status).toBe(403)
    expect((await request(app).post('/api/v1/auth/refresh')).status).toBe(401)
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', 'minld_pfl_refresh=invalid')).status).toBe(401)

    const rotated = await request(app).post('/api/v1/auth/refresh').set('Origin', 'http://localhost:5173').set('Cookie', cookie)
    expect(rotated.status).toBe(200)
    expect((await prisma.authSession.findUniqueOrThrow({ where: { id: oldSessionId } })).revokedAt).toBeTruthy()
    expect((await request(app).post('/api/v1/auth/refresh').set('Origin', 'http://localhost:5173').set('Cookie', cookie)).status).toBe(401)

    const expiredLogin = await login(adminEmail)
    const expiredCookie = refreshCookie(expiredLogin)
    await prisma.authSession.update({ where: { id: refreshSessionId(expiredCookie) }, data: { expiresAt: new Date(0) } })
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', expiredCookie)).status).toBe(401)

    const revokedLogin = await login(adminEmail)
    const revokedCookie = refreshCookie(revokedLogin)
    await prisma.authSession.update({ where: { id: refreshSessionId(revokedCookie) }, data: { revokedAt: new Date() } })
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', revokedCookie)).status).toBe(401)
  })

  test('me logout forgot reset change password and sessions work safely', async () => {
    const loginResponse = await login(adminEmail)
    const accessToken = loginResponse.body.data.accessToken
    const cookie = refreshCookie(loginResponse)

    expect((await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`)).body.data.user.email).toBe(adminEmail)
    expect((await request(app).get('/api/v1/auth/me')).status).toBe(401)

    const sessions = await request(app).get('/api/v1/auth/sessions').set('Authorization', `Bearer ${accessToken}`)
    expect(sessions.status).toBe(200)
    expect(sessions.body.data.sessions[0].refreshTokenHash).toBeUndefined()

    expect((await request(app).delete(`/api/v1/auth/sessions/${randomUUID()}`).set('Authorization', `Bearer ${accessToken}`).set('Origin', 'http://localhost:5173')).status).toBe(404)
    expect((await request(app).post('/api/v1/auth/forgot-password').send({ email: 'missing@example.com' })).body).toEqual((await request(app).post('/api/v1/auth/forgot-password').send({ email: adminEmail })).body)
    const resetToken = tokenFromLastMail()
    expect((await request(app).post('/api/v1/auth/reset-password').send({ token: resetToken, newPassword: 'new-valid-password' })).status).toBe(200)
    expect((await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: 'new-valid-password' })).status).toBe(200)

    const changeLogin = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: 'new-valid-password' })
    expect((await request(app).post('/api/v1/auth/change-password').set('Authorization', `Bearer ${changeLogin.body.data.accessToken}`).send({ currentPassword: 'wrong', newPassword: 'another-valid-password' })).status).toBe(401)
    expect((await request(app).post('/api/v1/auth/change-password').set('Authorization', `Bearer ${changeLogin.body.data.accessToken}`).send({ currentPassword: 'new-valid-password', newPassword: 'another-valid-password' })).status).toBe(200)

    const logoutLogin = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: 'another-valid-password' })
    const logoutCookie = refreshCookie(logoutLogin)
    const logout = await request(app).post('/api/v1/auth/logout').set('Origin', 'http://localhost:5173').set('Cookie', logoutCookie)
    expect(logout.status).toBe(200)
    expect(cookieHeader(logout)).toContain('minld_pfl_refresh=;')
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', logoutCookie)).status).toBe(401)

    const allLogin = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: 'another-valid-password' })
    expect((await request(app).post('/api/v1/auth/logout-all').set('Authorization', `Bearer ${allLogin.body.data.accessToken}`).set('Origin', 'http://localhost:5173')).status).toBe(200)
  })
})
