import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest'
import type { prisma as prismaType } from '../../database/prisma.js'
import { hashPassword } from '../../common/auth/password.js'

const mediaMocks = vi.hoisted(() => ({ uploadImage: vi.fn(), deleteImage: vi.fn() }))

vi.mock('../../common/media/media.service.js', () => ({
  mediaService: { uploadImage: mediaMocks.uploadImage, deleteImage: mediaMocks.deleteImage },
}))

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'

const email = 'phase3.profile@example.com'
const bannedEmail = 'phase3.banned@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType

async function cleanup() {
  await prisma.authSession.deleteMany({ where: { user: { email: { in: [email, bannedEmail] } } } })
  await prisma.accountToken.deleteMany({ where: { user: { email: { in: [email, bannedEmail] } } } })
  await prisma.user.deleteMany({ where: { email: { in: [email, bannedEmail] } } })
}

async function createUser(userEmail: string, status: 'ACTIVE' | 'BANNED' = 'ACTIVE') {
  await prisma.user.create({
    data: {
      email: userEmail,
      displayName: userEmail,
      emailVerifiedAt: new Date(),
      status,
      credential: { create: { passwordHash: await hashPassword(password) } },
    },
  })
}

async function accessToken(userEmail = email) {
  const response = await request(app).post('/api/v1/auth/login').send({ email: userEmail, password })
  return response.body.data.accessToken as string
}

beforeAll(async () => {
  ;({ app } = await import('../../app.js'))
  ;({ prisma } = await import('../../database/prisma.js'))
})

beforeEach(async () => {
  mediaMocks.uploadImage.mockReset()
  mediaMocks.deleteImage.mockReset()
  mediaMocks.deleteImage.mockResolvedValue(undefined)
  await cleanup()
  await createUser(email)
  await createUser(bannedEmail, 'BANNED')
})

afterAll(async () => {
  await cleanup()
  await prisma.$disconnect()
})

test('GET /api/v1/users/me returns current profile', async () => {
  const response = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${await accessToken()}`)

  expect(response.status).toBe(200)
  expect(response.body.data.user.email).toBe(email)
  expect(response.body.data.user.passwordHash).toBeUndefined()
})

test('PATCH /api/v1/users/me updates displayName only', async () => {
  const response = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${await accessToken()}`).send({ displayName: 'New Name', role: 'ADMIN' })

  expect(response.status).toBe(200)
  expect(response.body.data.user.displayName).toBe('New Name')
  expect(response.body.data.user.role).toBe('USER')
})

test('BANNED user cannot update profile interaction', async () => {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: bannedEmail } })
  const token = (await import('../../common/auth/jwt.js')).signAccessToken({ sub: user.id, role: user.role, status: user.status })
  const response = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`).send({ displayName: 'Blocked' })

  expect(response.status).toBe(403)
})

test('ACTIVE user can replace and delete own avatar with cleanup', async () => {
  const user = await prisma.user.update({ where: { email }, data: { avatarUrl: 'https://cdn/old.png', avatarPublicId: 'old-avatar' } })
  const token = await accessToken()
  mediaMocks.uploadImage.mockResolvedValueOnce({ url: 'https://cdn/new.png', publicId: 'new-avatar' })

  const replaced = await request(app)
    .post('/api/v1/users/me/avatar')
    .set('Authorization', `Bearer ${token}`)
    .attach('avatar', Buffer.from('fake'), { filename: 'avatar.webp', contentType: 'image/webp' })

  expect(replaced.status).toBe(200)
  expect(replaced.body.data.user.avatarUrl).toBe('https://cdn/new.png')
  expect(mediaMocks.deleteImage).toHaveBeenCalledWith(user.avatarPublicId)

  expect((await request(app).delete('/api/v1/users/me/avatar').set('Authorization', `Bearer ${token}`)).status).toBe(204)
  expect(mediaMocks.deleteImage).toHaveBeenCalledWith('new-avatar')
  expect((await prisma.user.findUniqueOrThrow({ where: { email } })).avatarPublicId).toBeNull()
})

test('avatar upload requires active user and valid image', async () => {
  expect((await request(app).post('/api/v1/users/me/avatar').attach('avatar', Buffer.from('fake'), { filename: 'avatar.png', contentType: 'image/png' })).status).toBe(401)
  expect((await request(app).post('/api/v1/users/me/avatar').set('Authorization', `Bearer ${await accessToken()}`).attach('avatar', Buffer.from('fake'), { filename: 'avatar.gif', contentType: 'image/gif' })).status).toBe(400)

  const banned = await prisma.user.findUniqueOrThrow({ where: { email: bannedEmail } })
  const token = (await import('../../common/auth/jwt.js')).signAccessToken({ sub: banned.id, role: banned.role, status: banned.status })
  expect((await request(app).post('/api/v1/users/me/avatar').set('Authorization', `Bearer ${token}`).attach('avatar', Buffer.from('fake'), { filename: 'avatar.png', contentType: 'image/png' })).status).toBe(403)
})
