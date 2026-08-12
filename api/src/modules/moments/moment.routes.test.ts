import type { Express } from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest'
import { hashPassword } from '../../common/auth/password.js'
import type { prisma as prismaType } from '../../database/prisma.js'

const mediaMocks = vi.hoisted(() => ({ uploadImage: vi.fn(), deleteImage: vi.fn() }))

vi.mock('../../common/media/media.service.js', () => ({
  mediaService: { uploadImage: mediaMocks.uploadImage, deleteImage: mediaMocks.deleteImage },
}))

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
  mediaMocks.uploadImage.mockReset()
  mediaMocks.deleteImage.mockReset()
  mediaMocks.deleteImage.mockResolvedValue(undefined)
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

test('ADMIN can upload reorder and delete moment images', async () => {
  const token = await accessToken(adminEmail)
  const moment = await prisma.moment.create({ data: { content: 'Test Moment Images' } })
  mediaMocks.uploadImage.mockResolvedValueOnce({ url: 'https://cdn/one.png', publicId: 'one-id' }).mockResolvedValueOnce({ url: 'https://cdn/two.png', publicId: 'two-id' })

  const uploaded = await request(app)
    .post(`/api/v1/admin/moments/${moment.id}/images`)
    .set('Authorization', `Bearer ${token}`)
    .attach('images', Buffer.from('one'), { filename: 'one.png', contentType: 'image/png' })
    .attach('images', Buffer.from('two'), { filename: 'two.webp', contentType: 'image/webp' })

  expect(uploaded.status).toBe(200)
  expect(uploaded.body.data.moment.images.map((image: { publicId: string }) => image.publicId)).toEqual(['one-id', 'two-id'])

  const [first, second] = uploaded.body.data.moment.images as { id: string }[]
  const reordered = await request(app).patch(`/api/v1/admin/moments/${moment.id}/images/reorder`).set('Authorization', `Bearer ${token}`).send({ images: [{ id: first.id, sortOrder: 1 }, { id: second.id, sortOrder: 0 }] })
  expect(reordered.status).toBe(200)
  expect(reordered.body.data.moment.images.map((image: { publicId: string }) => image.publicId)).toEqual(['two-id', 'one-id'])

  expect((await request(app).delete(`/api/v1/admin/moment-images/${first.id}`).set('Authorization', `Bearer ${token}`)).status).toBe(204)
  expect(mediaMocks.deleteImage).toHaveBeenCalledWith('one-id')
})

test('moment image upload validates auth type and image limit', async () => {
  const token = await accessToken(adminEmail)
  const moment = await prisma.moment.create({ data: { content: 'Test Moment Image Limits', images: { create: Array.from({ length: 10 }, (_, index) => ({ url: `https://cdn/${index}.png`, publicId: `id-${index}`, sortOrder: index })) } } })

  expect((await request(app).post(`/api/v1/admin/moments/${moment.id}/images`).attach('images', Buffer.from('one'), { filename: 'one.png', contentType: 'image/png' })).status).toBe(401)
  expect((await request(app).post(`/api/v1/admin/moments/${moment.id}/images`).set('Authorization', `Bearer ${token}`).attach('images', Buffer.from('bad'), { filename: 'bad.gif', contentType: 'image/gif' })).status).toBe(400)
  expect((await request(app).post(`/api/v1/admin/moments/${moment.id}/images`).set('Authorization', `Bearer ${token}`).attach('images', Buffer.from('one'), { filename: 'one.png', contentType: 'image/png' })).status).toBe(400)
})

test('public moment routes expose only published moments', async () => {
  const published = await prisma.moment.create({ data: { content: 'Test Moment Public', status: 'PUBLISHED', publishedAt: new Date(), tags: { connect: [{ id: tagId }] }, images: { create: { url: 'https://cdn/image.png', publicId: 'public-id', sortOrder: 0 } } } })
  const draft = await prisma.moment.create({ data: { content: 'Test Moment Draft', status: 'DRAFT' } })

  const listed = await request(app).get('/api/v1/moments')
  expect(listed.status).toBe(200)
  expect(listed.body.data.moments.some((moment: { id: string }) => moment.id === published.id)).toBe(true)
  expect(listed.body.data.moments.some((moment: { id: string }) => moment.id === draft.id)).toBe(false)

  const detail = await request(app).get(`/api/v1/moments/${published.id}`)
  expect(detail.status).toBe(200)
  expect(detail.body.data.moment.images).toHaveLength(1)
  expect(detail.body.data.moment.tags).toHaveLength(1)
  expect((await request(app).get(`/api/v1/moments/${draft.id}`)).status).toBe(404)
  expect((await request(app).get('/api/v1/moments/not-a-uuid')).status).toBe(400)
})

test('authenticated active user can like and unlike published moment', async () => {
  const token = await accessToken(userEmail)
  const published = await prisma.moment.create({ data: { content: 'Test Moment Like', status: 'PUBLISHED', publishedAt: new Date() } })
  const draft = await prisma.moment.create({ data: { content: 'Test Moment Like Draft', status: 'DRAFT' } })

  const liked = await request(app).post(`/api/v1/moments/${published.id}/like`).set('Authorization', `Bearer ${token}`)
  expect(liked.status).toBe(200)
  expect(liked.body.data).toEqual({ liked: true, likeCount: 1 })

  const unliked = await request(app).post(`/api/v1/moments/${published.id}/like`).set('Authorization', `Bearer ${token}`)
  expect(unliked.status).toBe(200)
  expect(unliked.body.data).toEqual({ liked: false, likeCount: 0 })

  expect((await request(app).post(`/api/v1/moments/${published.id}/like`)).status).toBe(401)
  expect((await request(app).post(`/api/v1/moments/${draft.id}/like`).set('Authorization', `Bearer ${token}`)).status).toBe(404)
})

test('authenticated active user can create and list visible moment comments', async () => {
  const token = await accessToken(userEmail)
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } })
  const published = await prisma.moment.create({ data: { content: 'Test Moment Comments', status: 'PUBLISHED', publishedAt: new Date() } })
  const draft = await prisma.moment.create({ data: { content: 'Test Moment Comments Draft', status: 'DRAFT' } })

  const created = await request(app).post(`/api/v1/moments/${published.id}/comments`).set('Authorization', `Bearer ${token}`).send({ content: 'Nice moment' })
  expect(created.status).toBe(201)
  expect(created.body.data.comment.content).toBe('Nice moment')
  expect(created.body.data.comment.user.id).toBe(user.id)

  await prisma.momentComment.create({ data: { momentId: published.id, userId: user.id, content: 'Hidden', status: 'HIDDEN' } })
  const listed = await request(app).get(`/api/v1/moments/${published.id}/comments`)
  expect(listed.status).toBe(200)
  expect(listed.body.data.comments.map((comment: { content: string }) => comment.content)).toEqual(['Nice moment'])

  expect((await request(app).post(`/api/v1/moments/${published.id}/comments`).send({ content: 'No token' })).status).toBe(401)
  expect((await request(app).post(`/api/v1/moments/${published.id}/comments`).set('Authorization', `Bearer ${token}`).send({ content: '' })).status).toBe(400)
  expect((await request(app).get(`/api/v1/moments/${draft.id}/comments`)).status).toBe(404)
})

test('authenticated user can update and delete own moment comment only', async () => {
  const adminToken = await accessToken(adminEmail)
  const userToken = await accessToken(userEmail)
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail } })
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } })
  const moment = await prisma.moment.create({ data: { content: 'Test Moment Own Comment', status: 'PUBLISHED', publishedAt: new Date() } })
  const comment = await prisma.momentComment.create({ data: { momentId: moment.id, userId: user.id, content: 'Original' } })
  const otherComment = await prisma.momentComment.create({ data: { momentId: moment.id, userId: admin.id, content: 'Other' } })

  expect((await request(app).patch(`/api/v1/moment-comments/${comment.id}`).set('Authorization', `Bearer ${adminToken}`).send({ content: 'Hack' })).status).toBe(403)

  const updated = await request(app).patch(`/api/v1/moment-comments/${comment.id}`).set('Authorization', `Bearer ${userToken}`).send({ content: 'Updated' })
  expect(updated.status).toBe(200)
  expect(updated.body.data.comment.content).toBe('Updated')

  expect((await request(app).delete(`/api/v1/moment-comments/${otherComment.id}`).set('Authorization', `Bearer ${userToken}`)).status).toBe(403)
  expect((await request(app).delete(`/api/v1/moment-comments/${comment.id}`).set('Authorization', `Bearer ${userToken}`)).status).toBe(204)
  expect(await prisma.momentComment.findUnique({ where: { id: comment.id } })).toBeNull()
  expect((await request(app).patch('/api/v1/moment-comments/00000000-0000-0000-0000-000000000000').set('Authorization', `Bearer ${userToken}`).send({ content: 'Missing' })).status).toBe(404)
})

test('ADMIN can list moderate and delete moment comments', async () => {
  const adminToken = await accessToken(adminEmail)
  const userToken = await accessToken(userEmail)
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } })
  const moment = await prisma.moment.create({ data: { content: 'Test Moment Admin Comment', status: 'PUBLISHED', publishedAt: new Date() } })
  const comment = await prisma.momentComment.create({ data: { momentId: moment.id, userId: user.id, content: 'Moderate me' } })

  expect((await request(app).get('/api/v1/admin/moment-comments').set('Authorization', `Bearer ${userToken}`)).status).toBe(403)

  const listed = await request(app).get('/api/v1/admin/moment-comments').set('Authorization', `Bearer ${adminToken}`)
  expect(listed.status).toBe(200)
  expect(listed.body.data.comments.some((item: { id: string }) => item.id === comment.id)).toBe(true)

  const hidden = await request(app).patch(`/api/v1/admin/moment-comments/${comment.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'HIDDEN' })
  expect(hidden.status).toBe(200)
  expect(hidden.body.data.comment.status).toBe('HIDDEN')
  expect((await request(app).patch(`/api/v1/admin/moment-comments/${comment.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'BAD' })).status).toBe(400)

  expect((await request(app).delete(`/api/v1/admin/moment-comments/${comment.id}`).set('Authorization', `Bearer ${adminToken}`)).status).toBe(204)
  expect(await prisma.momentComment.findUnique({ where: { id: comment.id } })).toBeNull()
})
