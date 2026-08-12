import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { hashPassword } from '../../common/auth/password.js'
import type { prisma as prismaType } from '../../database/prisma.js'

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'

const adminEmail = 'technology.admin@example.com'
const userEmail = 'technology.user@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType

async function cleanup() {
  await prisma.technology.deleteMany({ where: { slug: { startsWith: 'test-technology' } } })
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

async function accessToken(email: string) {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password })
  return response.body.data.accessToken as string
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

test('ADMIN can create list get update delete technology', async () => {
  const token = await accessToken(adminEmail)

  const created = await request(app)
    .post('/api/v1/admin/technologies')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Technology React', slug: 'test-technology-react', type: 'FRAMEWORK', description: 'Desc' })

  expect(created.status).toBe(201)
  expect(created.body.data.technology.slug).toBe('test-technology-react')
  expect(created.body.data.technology.type).toBe('FRAMEWORK')

  const listed = await request(app).get('/api/v1/admin/technologies').set('Authorization', `Bearer ${token}`)
  expect(listed.status).toBe(200)
  expect(listed.body.data.technologies.some((technology: { slug: string }) => technology.slug === 'test-technology-react')).toBe(true)

  const publicList = await request(app).get('/api/v1/technologies')
  expect(publicList.status).toBe(200)
  expect(publicList.body.data.technologies.some((technology: { slug: string }) => technology.slug === 'test-technology-react')).toBe(true)

  const filtered = await request(app).get('/api/v1/technologies?type=FRAMEWORK')
  expect(filtered.status).toBe(200)
  expect(filtered.body.data.technologies.every((technology: { type: string }) => technology.type === 'FRAMEWORK')).toBe(true)

  const id = created.body.data.technology.id as string
  expect((await request(app).get(`/api/v1/admin/technologies/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(200)

  const updated = await request(app)
    .patch(`/api/v1/admin/technologies/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Technology Updated', type: 'LIBRARY', description: null })
  expect(updated.status).toBe(200)
  expect(updated.body.data.technology.name).toBe('Test Technology Updated')
  expect(updated.body.data.technology.type).toBe('LIBRARY')
  expect(updated.body.data.technology.description).toBeNull()

  expect((await request(app).delete(`/api/v1/admin/technologies/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(204)
  expect((await request(app).get(`/api/v1/admin/technologies/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(404)
})

test('technology admin routes require ADMIN', async () => {
  const userToken = await accessToken(userEmail)
  const noToken = await request(app).post('/api/v1/admin/technologies').send({ name: 'Test Technology No Token', slug: 'test-technology-no-token', type: 'TOOL' })
  const user = await request(app).post('/api/v1/admin/technologies').set('Authorization', `Bearer ${userToken}`).send({ name: 'Test Technology User', slug: 'test-technology-user', type: 'TOOL' })

  expect(noToken.status).toBe(401)
  expect(user.status).toBe(403)
})

test('technology validation and uniqueness work', async () => {
  const token = await accessToken(adminEmail)

  expect((await request(app).post('/api/v1/admin/technologies').set('Authorization', `Bearer ${token}`).send({ name: '', slug: 'bad slug', type: 'BAD' })).status).toBe(400)
  expect((await request(app).get('/api/v1/technologies?type=BAD')).status).toBe(400)
  expect((await request(app).post('/api/v1/admin/technologies').set('Authorization', `Bearer ${token}`).send({ name: 'Test Technology Unique', slug: 'test-technology-unique', type: 'TOOL' })).status).toBe(201)
  expect((await request(app).post('/api/v1/admin/technologies').set('Authorization', `Bearer ${token}`).send({ name: 'Test Technology Unique', slug: 'test-technology-unique-2', type: 'TOOL' })).status).toBe(409)
  expect((await request(app).post('/api/v1/admin/technologies').set('Authorization', `Bearer ${token}`).send({ name: 'Test Technology Unique 2', slug: 'test-technology-unique', type: 'TOOL' })).status).toBe(409)
})
