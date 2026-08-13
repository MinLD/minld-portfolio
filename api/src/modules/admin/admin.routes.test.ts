import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { hashPassword } from '../../common/auth/password.js'
import type { prisma as prismaType } from '../../database/prisma.js'

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'

const adminEmail = 'admin.dashboard@example.com'
const userEmail = 'admin.dashboard.user@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType

async function cleanup() {
  await prisma.momentComment.deleteMany({ where: { moment: { content: { startsWith: 'Test Dashboard' } } } })
  await prisma.moment.deleteMany({ where: { content: { startsWith: 'Test Dashboard' } } })
  await prisma.projectComment.deleteMany({ where: { project: { slug: { startsWith: 'test-dashboard' } } } })
  await prisma.project.deleteMany({ where: { slug: { startsWith: 'test-dashboard' } } })
  await prisma.authSession.deleteMany({ where: { user: { email: { in: [adminEmail, userEmail] } } } })
  await prisma.accountToken.deleteMany({ where: { user: { email: { in: [adminEmail, userEmail] } } } })
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } })
}

async function createUser(email: string, role: 'USER' | 'ADMIN') {
  return prisma.user.create({ data: { email, displayName: email, role, emailVerifiedAt: new Date(), credential: { create: { passwordHash: await hashPassword(password) } } } })
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
  const admin = await createUser(adminEmail, 'ADMIN')
  await createUser(userEmail, 'USER')
  const project = await prisma.project.create({ data: { title: 'Dashboard Project', slug: 'test-dashboard-project', summary: 'Summary', content: 'Content', status: 'PUBLISHED' } })
  const moment = await prisma.moment.create({ data: { content: 'Test Dashboard Moment', status: 'PUBLISHED' } })
  await prisma.projectComment.create({ data: { projectId: project.id, userId: admin.id, content: 'Project comment' } })
  await prisma.momentComment.create({ data: { momentId: moment.id, userId: admin.id, content: 'Moment comment' } })
})

afterAll(async () => {
  await cleanup()
  await prisma.$disconnect()
})

test('ADMIN can read dashboard counts', async () => {
  const response = await request(app).get('/api/v1/admin/dashboard').set('Cookie', await authCookie(adminEmail))

  expect(response.status).toBe(200)
  expect(response.body.data.dashboard.users).toBeGreaterThanOrEqual(2)
  expect(response.body.data.dashboard.publishedProjects).toBeGreaterThanOrEqual(1)
  expect(response.body.data.dashboard.projectComments).toBeGreaterThanOrEqual(1)
  expect(response.body.data.dashboard.publishedMoments).toBeGreaterThanOrEqual(1)
  expect(response.body.data.dashboard.momentComments).toBeGreaterThanOrEqual(1)
})

test('dashboard requires ADMIN', async () => {
  expect((await request(app).get('/api/v1/admin/dashboard')).status).toBe(401)
  expect((await request(app).get('/api/v1/admin/dashboard').set('Cookie', await authCookie(userEmail))).status).toBe(403)
})

test('ADMIN can list search filter and paginate users', async () => {
  const response = await request(app).get('/api/v1/admin/users?search=dashboard.user&role=USER&status=ACTIVE&page=1&limit=1').set('Cookie', await authCookie(adminEmail))

  expect(response.status).toBe(200)
  expect(response.body.data.users).toHaveLength(1)
  expect(response.body.data.users[0].email).toBe(userEmail)
  expect(response.body.data.users[0].passwordHash).toBeUndefined()
  expect(response.body.meta.total).toBeGreaterThanOrEqual(1)
  expect((await request(app).get('/api/v1/admin/users?role=BAD').set('Cookie', await authCookie(adminEmail))).status).toBe(400)
})

test('ADMIN can ban and unban users but not current admin', async () => {
  const cookie = await authCookie(adminEmail)
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } })
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail } })

  const banned = await request(app).patch(`/api/v1/admin/users/${user.id}/status`).set('Cookie', cookie).send({ status: 'BANNED' })
  expect(banned.status).toBe(200)
  expect(banned.body.data.user.status).toBe('BANNED')

  const active = await request(app).patch(`/api/v1/admin/users/${user.id}/status`).set('Cookie', cookie).send({ status: 'ACTIVE' })
  expect(active.status).toBe(200)
  expect(active.body.data.user.status).toBe('ACTIVE')

  expect((await request(app).patch(`/api/v1/admin/users/${admin.id}/status`).set('Cookie', cookie).send({ status: 'BANNED' })).status).toBe(400)
  expect((await request(app).patch(`/api/v1/admin/users/${user.id}/status`).set('Cookie', cookie).send({ status: 'BAD' })).status).toBe(400)
  expect((await request(app).patch('/api/v1/admin/users/00000000-0000-0000-0000-000000000000/status').set('Cookie', cookie).send({ status: 'ACTIVE' })).status).toBe(404)
})
