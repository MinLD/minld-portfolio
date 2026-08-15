import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { hashPassword } from '../../common/auth/password.js'
import type { prisma as prismaType } from '../../database/prisma.js'

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'

const adminEmail = 'project-tag.admin@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType

async function cleanup() {
  await prisma.category.deleteMany({ where: { slug: { startsWith: 'test-project-tag-route' } } })
  await prisma.authSession.deleteMany({ where: { user: { email: adminEmail } } })
  await prisma.accountToken.deleteMany({ where: { user: { email: adminEmail } } })
  await prisma.user.deleteMany({ where: { email: adminEmail } })
}

async function authCookie() {
  await prisma.user.create({ data: { email: adminEmail, displayName: adminEmail, role: 'ADMIN', emailVerifiedAt: new Date(), credential: { create: { passwordHash: await hashPassword(password) } } } })
  const response = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password })
  return ([] as string[]).concat(response.headers['set-cookie'] ?? []).join('; ')
}

beforeAll(async () => {
  ;({ app } = await import('../../app.js'))
  ;({ prisma } = await import('../../database/prisma.js'))
})

beforeEach(cleanup)

afterAll(async () => {
  await cleanup()
  await prisma.$disconnect()
})

test('ADMIN manages project tags and public route lists them', async () => {
  const cookie = await authCookie()
  const created = await request(app).post('/api/v1/admin/project-tags').set('Cookie', cookie).send({ name: 'Test Project Tag Route' })

  expect(created.status).toBe(201)
  expect(created.body.data.tag.slug).toBe('test-project-tag-route')

  const listed = await request(app).get('/api/v1/project-tags')
  expect(listed.status).toBe(200)
  expect(listed.body.data.tags.some((tag: { slug: string }) => tag.slug === 'test-project-tag-route')).toBe(true)
})
