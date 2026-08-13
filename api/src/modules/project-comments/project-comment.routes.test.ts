import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { hashPassword } from '../../common/auth/password.js'
import type { prisma as prismaType } from '../../database/prisma.js'

process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.REFRESH_TOKEN_COOKIE_NAME = 'minld_pfl_refresh'

const email = 'project-comment.user@example.com'
const otherEmail = 'project-comment.other@example.com'
const adminEmail = 'project-comment.admin@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType
let userId: string
let projectId: string

async function cleanup() {
  await prisma.projectComment.deleteMany({ where: { project: { slug: { startsWith: 'test-comment-project' } } } })
  await prisma.project.deleteMany({ where: { slug: { startsWith: 'test-comment-project' } } })
  await prisma.authSession.deleteMany({ where: { user: { email: { in: [email, otherEmail, adminEmail] } } } })
  await prisma.accountToken.deleteMany({ where: { user: { email: { in: [email, otherEmail, adminEmail] } } } })
  await prisma.user.deleteMany({ where: { email: { in: [email, otherEmail, adminEmail] } } })
}

async function seed() {
  const user = await prisma.user.create({ data: { email, displayName: 'Comment User', emailVerifiedAt: new Date(), credential: { create: { passwordHash: await hashPassword(password) } } } })
  await prisma.user.create({ data: { email: otherEmail, displayName: 'Other User', emailVerifiedAt: new Date(), credential: { create: { passwordHash: await hashPassword(password) } } } })
  await prisma.user.create({ data: { email: adminEmail, displayName: 'Admin User', role: 'ADMIN', emailVerifiedAt: new Date(), credential: { create: { passwordHash: await hashPassword(password) } } } })
  const project = await prisma.project.create({ data: { title: 'Comment Project', slug: 'test-comment-project', summary: 'Summary', content: 'Content', status: 'PUBLISHED', publishedAt: new Date() } })
  await prisma.project.create({ data: { title: 'Draft Project', slug: 'test-comment-project-draft', summary: 'Summary', content: 'Content', status: 'DRAFT' } })
  userId = user.id
  projectId = project.id
}

async function authCookie() {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password })
  return ([] as string[]).concat(response.headers['set-cookie'] ?? []).join('; ')
}

async function otherAuthCookie() {
  const response = await request(app).post('/api/v1/auth/login').send({ email: otherEmail, password })
  return ([] as string[]).concat(response.headers['set-cookie'] ?? []).join('; ')
}

async function adminAuthCookie() {
  const response = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password })
  return ([] as string[]).concat(response.headers['set-cookie'] ?? []).join('; ')
}

beforeAll(async () => {
  ;({ app } = await import('../../app.js'))
  ;({ prisma } = await import('../../database/prisma.js'))
})

beforeEach(async () => {
  await cleanup()
  await seed()
})

afterAll(async () => {
  await cleanup()
  await prisma.$disconnect()
})

test('anonymous user can create and list visible project comments', async () => {
  const created = await request(app).post('/api/v1/projects/test-comment-project/comments').send({ authorName: 'Guest', content: 'Hello project' })
  expect(created.status).toBe(201)
  expect(created.body.data.comment.content).toBe('Hello project')
  expect(created.body.data.comment.user.displayName).toBe('Guest')

  await prisma.projectComment.create({ data: { projectId, userId, content: 'Hidden', status: 'HIDDEN' } })
  const listed = await request(app).get('/api/v1/projects/test-comment-project/comments')
  expect(listed.status).toBe(200)
  expect(listed.body.data.comments.map((comment: { content: string }) => comment.content)).toEqual(['Hello project'])
})

test('project comment create/list validates input and published project', async () => {
  expect((await request(app).post('/api/v1/projects/test-comment-project/comments').send({ content: 'No name' })).status).toBe(400)
  expect((await request(app).post('/api/v1/projects/test-comment-project/comments').send({ authorName: 'Guest', content: '' })).status).toBe(400)
  expect((await request(app).get('/api/v1/projects/test-comment-project-draft/comments')).status).toBe(404)
  expect((await request(app).post('/api/v1/projects/test-comment-project-draft/comments').send({ authorName: 'Guest', content: 'No draft' })).status).toBe(404)
})

test('authenticated user can update and delete own project comment only', async () => {
  const cookie = await authCookie()
  const otherCookie = await otherAuthCookie()
  const comment = await prisma.projectComment.create({ data: { projectId, userId, content: 'Original' } })

  const forbidden = await request(app).patch(`/api/v1/project-comments/${comment.id}`).set('Cookie', otherCookie).send({ content: 'Hack' })
  expect(forbidden.status).toBe(403)

  const updated = await request(app).patch(`/api/v1/project-comments/${comment.id}`).set('Cookie', cookie).send({ content: 'Updated' })
  expect(updated.status).toBe(200)
  expect(updated.body.data.comment.content).toBe('Updated')

  expect((await request(app).delete(`/api/v1/project-comments/${comment.id}`).set('Cookie', otherCookie)).status).toBe(403)
  expect((await request(app).delete(`/api/v1/project-comments/${comment.id}`).set('Cookie', cookie)).status).toBe(204)
  expect(await prisma.projectComment.findUnique({ where: { id: comment.id } })).toBeNull()
  expect((await request(app).patch('/api/v1/project-comments/00000000-0000-0000-0000-000000000000').set('Cookie', cookie).send({ content: 'Missing' })).status).toBe(404)
})

test('ADMIN can list moderate and delete project comments', async () => {
  const adminCookie = await adminAuthCookie()
  const userCookie = await authCookie()
  const comment = await prisma.projectComment.create({ data: { projectId, userId, content: 'Moderate me' } })

  expect((await request(app).get('/api/v1/admin/project-comments').set('Cookie', userCookie)).status).toBe(403)

  const listed = await request(app).get('/api/v1/admin/project-comments').set('Cookie', adminCookie)
  expect(listed.status).toBe(200)
  expect(listed.body.data.comments.some((item: { id: string }) => item.id === comment.id)).toBe(true)

  const hidden = await request(app).patch(`/api/v1/admin/project-comments/${comment.id}/status`).set('Cookie', adminCookie).send({ status: 'HIDDEN' })
  expect(hidden.status).toBe(200)
  expect(hidden.body.data.comment.status).toBe('HIDDEN')
  expect((await request(app).patch(`/api/v1/admin/project-comments/${comment.id}/status`).set('Cookie', adminCookie).send({ status: 'BAD' })).status).toBe(400)

  expect((await request(app).delete(`/api/v1/admin/project-comments/${comment.id}`).set('Cookie', adminCookie)).status).toBe(204)
  expect(await prisma.projectComment.findUnique({ where: { id: comment.id } })).toBeNull()
})
