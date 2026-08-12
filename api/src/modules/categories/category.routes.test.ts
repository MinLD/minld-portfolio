import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { hashPassword } from '../../common/auth/password.js'
import type { prisma as prismaType } from '../../database/prisma.js'

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'

const adminEmail = 'category.admin@example.com'
const userEmail = 'category.user@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType

async function cleanup() {
  await prisma.category.deleteMany({ where: { slug: { startsWith: 'test-category' } } })
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

test('ADMIN can create list get update delete category', async () => {
  const token = await accessToken(adminEmail)

  const created = await request(app)
    .post('/api/v1/admin/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Category One', slug: 'test-category-one', description: 'Desc' })

  expect(created.status).toBe(201)
  expect(created.body.data.category.slug).toBe('test-category-one')

  const listed = await request(app).get('/api/v1/admin/categories').set('Authorization', `Bearer ${token}`)
  expect(listed.status).toBe(200)
  expect(listed.body.data.categories.some((category: { slug: string }) => category.slug === 'test-category-one')).toBe(true)

  const publicList = await request(app).get('/api/v1/categories')
  expect(publicList.status).toBe(200)
  expect(publicList.body.data.categories.some((category: { slug: string }) => category.slug === 'test-category-one')).toBe(true)

  const id = created.body.data.category.id as string
  expect((await request(app).get(`/api/v1/admin/categories/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(200)

  const updated = await request(app)
    .patch(`/api/v1/admin/categories/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Category Updated', description: null })
  expect(updated.status).toBe(200)
  expect(updated.body.data.category.name).toBe('Test Category Updated')
  expect(updated.body.data.category.description).toBeNull()

  expect((await request(app).delete(`/api/v1/admin/categories/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(204)
  expect((await request(app).get(`/api/v1/admin/categories/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(404)
})

test('category admin routes require ADMIN', async () => {
  const userToken = await accessToken(userEmail)
  const noToken = await request(app).post('/api/v1/admin/categories').send({ name: 'Test Category No Token', slug: 'test-category-no-token' })
  const user = await request(app).post('/api/v1/admin/categories').set('Authorization', `Bearer ${userToken}`).send({ name: 'Test Category User', slug: 'test-category-user' })

  expect(noToken.status).toBe(401)
  expect(user.status).toBe(403)
})

test('category validation and uniqueness work', async () => {
  const token = await accessToken(adminEmail)

  expect((await request(app).post('/api/v1/admin/categories').set('Authorization', `Bearer ${token}`).send({ name: '', slug: 'bad slug' })).status).toBe(400)
  expect((await request(app).post('/api/v1/admin/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Test Category Unique', slug: 'test-category-unique' })).status).toBe(201)
  expect((await request(app).post('/api/v1/admin/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Test Category Unique', slug: 'test-category-unique-2' })).status).toBe(409)
  expect((await request(app).post('/api/v1/admin/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Test Category Unique 2', slug: 'test-category-unique' })).status).toBe(409)
})
