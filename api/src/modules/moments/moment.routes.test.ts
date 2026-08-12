import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { hashPassword } from '../../common/auth/password.js'
import type { prisma as prismaType } from '../../database/prisma.js'

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'

const adminEmail = 'moment.admin@example.com'
const userEmail = 'moment.user@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType
let tagId: string

async function cleanup() {
  await prisma.moment.deleteMany({ where: { content: { startsWith: 'Test Moment' } } })
  await prisma.momentTag.deleteMany({ where: { slug: { startsWith: 'test-moment-admin-tag' } } })
  await prisma.authSession.deleteMany({ where: { user: { email: { in: [adminEmail, userEmail] } } } })
  await prisma.accountToken.deleteMany({ where: { user: { email: { in: [adminEmail, userEmail] } } } })
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } })
}

async function createUser(email: string, role: 'USER' | 'ADMIN') {
  await prisma.user.create({ data: { email, displayName: email, role, emailVerifiedAt: new Date(), credential: { create: { passwordHash: await hashPassword(password) } } } })
}

async function accessToken(email: string) {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password })
  return response.body.data.accessToken as string
}

async function seedTag() {
  const tag = await prisma.momentTag.create({ data: { name: 'Test Moment Admin Tag', slug: 'test-moment-admin-tag' } })
  tagId = tag.id
}

function momentBody() {
  return { content: 'Test Moment One', status: 'PUBLISHED', publishedAt: '2026-08-12T00:00:00.000Z', tagIds: [tagId] }
}

beforeAll(async () => {
  ;({ app } = await import('../../app.js'))
  ;({ prisma } = await import('../../database/prisma.js'))
})

beforeEach(async () => {
  await cleanup()
  await createUser(adminEmail, 'ADMIN')
  await createUser(userEmail, 'USER')
  await seedTag()
})

afterAll(async () => {
  await cleanup()
  await prisma.$disconnect()
})

test('ADMIN can create list get update delete moment', async () => {
  const token = await accessToken(adminEmail)

  const created = await request(app).post('/api/v1/admin/moments').set('Authorization', `Bearer ${token}`).send(momentBody())
  expect(created.status).toBe(201)
  expect(created.body.data.moment.content).toBe('Test Moment One')
  expect(created.body.data.moment.tags).toHaveLength(1)

  const listed = await request(app).get('/api/v1/admin/moments').set('Authorization', `Bearer ${token}`)
  expect(listed.status).toBe(200)
  expect(listed.body.data.moments.some((moment: { id: string }) => moment.id === created.body.data.moment.id)).toBe(true)

  const id = created.body.data.moment.id as string
  expect((await request(app).get(`/api/v1/admin/moments/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(200)

  const updated = await request(app).patch(`/api/v1/admin/moments/${id}`).set('Authorization', `Bearer ${token}`).send({ content: 'Test Moment Updated', status: 'ARCHIVED', tagIds: [] })
  expect(updated.status).toBe(200)
  expect(updated.body.data.moment.content).toBe('Test Moment Updated')
  expect(updated.body.data.moment.status).toBe('ARCHIVED')
  expect(updated.body.data.moment.tags).toHaveLength(0)

  expect((await request(app).delete(`/api/v1/admin/moments/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(204)
  expect((await request(app).get(`/api/v1/admin/moments/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(404)
})

test('moment admin routes require ADMIN', async () => {
  const userToken = await accessToken(userEmail)
  const noToken = await request(app).post('/api/v1/admin/moments').send(momentBody())
  const user = await request(app).post('/api/v1/admin/moments').set('Authorization', `Bearer ${userToken}`).send(momentBody())

  expect(noToken.status).toBe(401)
  expect(user.status).toBe(403)
})

test('moment validation and tag checks work', async () => {
  const token = await accessToken(adminEmail)

  expect((await request(app).post('/api/v1/admin/moments').set('Authorization', `Bearer ${token}`).send({ content: '', status: 'BAD' })).status).toBe(400)
  expect((await request(app).post('/api/v1/admin/moments').set('Authorization', `Bearer ${token}`).send({ ...momentBody(), tagIds: ['00000000-0000-0000-0000-000000000000'] })).status).toBe(400)
})
