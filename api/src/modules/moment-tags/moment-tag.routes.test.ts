import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { hashPassword } from '../../common/auth/password.js'
import type { prisma as prismaType } from '../../database/prisma.js'

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'

const adminEmail = 'moment-tag.admin@example.com'
const userEmail = 'moment-tag.user@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType

async function cleanup() {
  await prisma.momentTag.deleteMany({ where: { slug: { startsWith: 'test-moment-tag' } } })
  await prisma.authSession.deleteMany({ where: { user: { email: { in: [adminEmail, userEmail] } } } })
  await prisma.accountToken.deleteMany({ where: { user: { email: { in: [adminEmail, userEmail] } } } })
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } })
}

async function createUser(email: string, role: 'USER' | 'ADMIN') {
  await prisma.user.create({
    data: {
      email,
      displayName: email,
      role,
      emailVerifiedAt: new Date(),
      credential: { create: { passwordHash: await hashPassword(password) } },
    },
  })
}

async function authCookie(email: string) {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password })
  return ([] as string[]).concat(response.headers['set-cookie'] ?? []).join('; ')
}

beforeAll(async () => {
  ;({ app } = await import('../../app.js'))
  ;({ prisma } = await import('../../database/prisma.js'))
})

beforeEach(async () => {
  await cleanup()
  await createUser(adminEmail, 'ADMIN')
  await createUser(userEmail, 'USER')
})

afterAll(async () => {
  await cleanup()
  await prisma.$disconnect()
})

test('ADMIN can create list get update delete moment tag', async () => {
  const cookie = await authCookie(adminEmail)

  const created = await request(app).post('/api/v1/admin/moment-tags').set('Cookie', cookie).send({ name: 'Test Moment Tag One', slug: 'test-moment-tag-one' })
  expect(created.status).toBe(201)
  expect(created.body.data.tag.name).toBe('#Test Moment Tag One')
  expect(created.body.data.tag.slug).toBe('test-moment-tag-one')

  const listed = await request(app).get('/api/v1/admin/moment-tags').set('Cookie', cookie)
  expect(listed.status).toBe(200)
  expect(listed.body.data.tags.some((tag: { slug: string }) => tag.slug === 'test-moment-tag-one')).toBe(true)

  const publicList = await request(app).get('/api/v1/moment-tags')
  expect(publicList.status).toBe(200)
  expect(publicList.body.data.tags.some((tag: { slug: string }) => tag.slug === 'test-moment-tag-one')).toBe(false)

  const id = created.body.data.tag.id as string
  expect((await request(app).get(`/api/v1/admin/moment-tags/${id}`).set('Cookie', cookie)).status).toBe(200)

  const updated = await request(app).patch(`/api/v1/admin/moment-tags/${id}`).set('Cookie', cookie).send({ name: 'Test Moment Tag Updated' })
  expect(updated.status).toBe(200)
  expect(updated.body.data.tag.name).toBe('#Test Moment Tag Updated')

  expect((await request(app).delete(`/api/v1/admin/moment-tags/${id}`).set('Cookie', cookie)).status).toBe(204)
  expect((await request(app).get(`/api/v1/admin/moment-tags/${id}`).set('Cookie', cookie)).status).toBe(404)
})

test('moment tag admin routes require ADMIN', async () => {
  const userCookie = await authCookie(userEmail)
  const noToken = await request(app).post('/api/v1/admin/moment-tags').send({ name: 'Test Moment Tag No Token', slug: 'test-moment-tag-no-token' })
  const user = await request(app).post('/api/v1/admin/moment-tags').set('Cookie', userCookie).send({ name: 'Test Moment Tag User', slug: 'test-moment-tag-user' })

  expect(noToken.status).toBe(401)
  expect(user.status).toBe(403)
})

test('moment tag validation and uniqueness work', async () => {
  const cookie = await authCookie(adminEmail)

  expect((await request(app).post('/api/v1/admin/moment-tags').set('Cookie', cookie).send({ name: '', slug: 'bad slug' })).status).toBe(400)
  expect((await request(app).post('/api/v1/admin/moment-tags').set('Cookie', cookie).send({ name: 'Test Moment Tag Unique', slug: 'test-moment-tag-unique' })).status).toBe(201)
  expect((await request(app).post('/api/v1/admin/moment-tags').set('Cookie', cookie).send({ name: 'Test Moment Tag Unique', slug: 'test-moment-tag-unique-2' })).status).toBe(409)
  expect((await request(app).post('/api/v1/admin/moment-tags').set('Cookie', cookie).send({ name: 'Test Moment Tag Unique 2', slug: 'test-moment-tag-unique' })).status).toBe(409)
})
