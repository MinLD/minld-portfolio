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

const adminEmail = 'project.admin@example.com'
const userEmail = 'project.user@example.com'
const password = 'valid-password'
let app: Express
let prisma: typeof prismaType
let tagId: string
let technologyId: string

async function cleanup() {
  await prisma.project.deleteMany({ where: { slug: { startsWith: 'test-project' } } })
  await prisma.category.deleteMany({ where: { slug: { startsWith: 'test-project-tag' } } })
  await prisma.technology.deleteMany({ where: { slug: { startsWith: 'test-project-technology' } } })
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

async function seedRelations() {
  const tag = await prisma.category.create({ data: { name: 'Test Project Tag', slug: 'test-project-tag' } })
  const technology = await prisma.technology.create({ data: { name: 'Test Project Technology', slug: 'test-project-technology', type: 'FRAMEWORK' } })
  tagId = tag.id
  technologyId = technology.id
}

function projectBody(title = 'Test Project One', slug?: string) {
  return {
    title,
    slug,
    summary: 'Summary',
    content: 'Content',
    demoUrl: 'https://example.com/demo',
    githubUrl: 'https://example.com/repo',
    sourceUrl: 'https://example.com/source',
    status: 'PUBLISHED',
    featured: true,
    year: 2026,
    publishedAt: '2026-08-12T00:00:00.000Z',
    tagIds: [tagId],
    technologyIds: [technologyId],
  }
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
  await seedRelations()
})

afterAll(async () => {
  await cleanup()
  await prisma.$disconnect()
})

test('ADMIN can create list get update delete project', async () => {
  const cookie = await authCookie(adminEmail)

  const created = await request(app).post('/api/v1/admin/projects').set('Cookie', cookie).send(projectBody())
  expect(created.status).toBe(201)
  expect(created.body.data.project.slug).toBe('test-project-one')
  expect(created.body.data.project.tags).toHaveLength(1)
  expect(created.body.data.project.technologies).toHaveLength(1)

  const listed = await request(app).get('/api/v1/admin/projects').set('Cookie', cookie)
  expect(listed.status).toBe(200)
  expect(listed.body.data.projects.some((project: { slug: string }) => project.slug === 'test-project-one')).toBe(true)

  const id = created.body.data.project.id as string
  expect((await request(app).get(`/api/v1/admin/projects/${id}`).set('Cookie', cookie)).status).toBe(200)

  const updated = await request(app).patch(`/api/v1/admin/projects/${id}`).set('Cookie', cookie).send({ title: 'Test Project Updated', status: 'ARCHIVED', featured: false, tagIds: [], technologyIds: [] })
  expect(updated.status).toBe(200)
  expect(updated.body.data.project.title).toBe('Test Project Updated')
  expect(updated.body.data.project.status).toBe('ARCHIVED')
  expect(updated.body.data.project.tags).toHaveLength(0)
  expect(updated.body.data.project.technologies).toHaveLength(0)

  expect((await request(app).delete(`/api/v1/admin/projects/${id}`).set('Cookie', cookie)).status).toBe(204)
  expect((await request(app).get(`/api/v1/admin/projects/${id}`).set('Cookie', cookie)).status).toBe(404)
})

test('project admin routes require ADMIN', async () => {
  const userCookie = await authCookie(userEmail)
  const noToken = await request(app).post('/api/v1/admin/projects').send(projectBody('Test Project No Token'))
  const user = await request(app).post('/api/v1/admin/projects').set('Cookie', userCookie).send(projectBody('Test Project User'))

  expect(noToken.status).toBe(401)
  expect(user.status).toBe(403)
})

test('project validation uniqueness and relation checks work', async () => {
  const cookie = await authCookie(adminEmail)

  expect((await request(app).post('/api/v1/admin/projects').set('Cookie', cookie).send({ ...projectBody('Bad Project'), title: '', slug: 'bad slug' })).status).toBe(400)
  expect((await request(app).post('/api/v1/admin/projects').set('Cookie', cookie).send({ ...projectBody('Test Project Missing Tag'), tagIds: ['00000000-0000-0000-0000-000000000000'] })).status).toBe(400)
  expect((await request(app).post('/api/v1/admin/projects').set('Cookie', cookie).send(projectBody('Test Project Unique'))).body.data.project.slug).toBe('test-project-unique')
  expect((await request(app).post('/api/v1/admin/projects').set('Cookie', cookie).send(projectBody('Test Project Unique'))).body.data.project.slug).toBe('test-project-unique-2')
  expect((await request(app).post('/api/v1/admin/projects').set('Cookie', cookie).send(projectBody('Explicit Slug One', 'test-project-explicit'))).status).toBe(201)
  expect((await request(app).post('/api/v1/admin/projects').set('Cookie', cookie).send(projectBody('Explicit Slug Two', 'test-project-explicit'))).status).toBe(409)
})

test('public project routes expose only published projects', async () => {
  await prisma.project.create({ data: { title: 'Published', slug: 'test-project-public', summary: 'Summary', content: 'Content', status: 'PUBLISHED', publishedAt: new Date() } })
  await prisma.project.create({ data: { title: 'Draft', slug: 'test-project-draft', summary: 'Summary', content: 'Content', status: 'DRAFT' } })

  const listed = await request(app).get('/api/v1/projects')
  expect(listed.status).toBe(200)
  expect(listed.body.data.projects.some((project: { slug: string }) => project.slug === 'test-project-public')).toBe(true)
  expect(listed.body.data.projects.some((project: { slug: string }) => project.slug === 'test-project-draft')).toBe(false)

  const published = await request(app).get('/api/v1/projects/test-project-public')
  expect(published.status).toBe(200)
  expect(published.body.data.project.slug).toBe('test-project-public')
  expect((await request(app).get('/api/v1/projects/test-project-draft')).status).toBe(404)
  expect((await request(app).get('/api/v1/projects/bad slug')).status).toBe(400)
})

test('public project filters and paginates in database', async () => {
  await prisma.project.create({
    data: {
      title: 'React Portfolio',
      slug: 'test-project-react-filter',
      summary: 'Frontend portfolio',
      content: 'React content',
      status: 'PUBLISHED',
      featured: true,
      year: 2026,
      publishedAt: new Date('2026-08-12T00:00:00.000Z'),
      categories: { connect: [{ id: tagId }] },
      technologies: { connect: [{ id: technologyId }] },
    },
  })
  await prisma.project.create({ data: { title: 'API Draft', slug: 'test-project-api-filter', summary: 'Backend', content: 'Node', status: 'PUBLISHED', featured: false, year: 2025, publishedAt: new Date('2025-01-01T00:00:00.000Z') } })

  const filtered = await request(app).get('/api/v1/projects?search=react&tag=test-project-tag&technology=test-project-technology&technologyType=FRAMEWORK&featured=true&year=2026&page=1&limit=1')
  expect(filtered.status).toBe(200)
  expect(filtered.body.data.projects).toHaveLength(1)
  expect(filtered.body.data.projects[0].slug).toBe('test-project-react-filter')
  expect(filtered.body.meta).toEqual({ page: 1, limit: 1, total: 1, totalPages: 1 })
  expect((await request(app).get('/api/v1/projects?technologyType=BAD')).status).toBe(400)
})

test('ADMIN can create and update project with multipart thumbnail', async () => {
  const cookie = await authCookie(adminEmail)
  mediaMocks.uploadImage.mockResolvedValueOnce({ url: 'https://cdn/create.png', publicId: 'create-id' }).mockResolvedValueOnce({ url: 'https://cdn/update.png', publicId: 'update-id' })

  const created = await request(app)
    .post('/api/v1/admin/projects')
    .set('Cookie', cookie)
    .field('title', 'Test Project Multipart')
    .field('summary', 'Summary')
    .field('content', 'Content')
    .field('status', 'PUBLISHED')
    .field('featured', 'true')
    .field('year', '2026')
    .field('tagIds', tagId)
    .field('technologyIds', technologyId)
    .attach('thumbnail', Buffer.from('fake'), { filename: 'thumbnail.png', contentType: 'image/png' })

  expect(created.status).toBe(201)
  expect(created.body.data.project.slug).toBe('test-project-multipart')
  expect(created.body.data.project.thumbnailUrl).toBe('https://cdn/create.png')
  expect(created.body.data.project.tags).toHaveLength(1)

  const updated = await request(app)
    .patch(`/api/v1/admin/projects/${created.body.data.project.id}`)
    .set('Cookie', cookie)
    .field('title', 'Test Project Multipart Updated')
    .field('tagIds', '')
    .attach('thumbnail', Buffer.from('fake'), { filename: 'thumbnail.png', contentType: 'image/png' })

  expect(updated.status).toBe(200)
  expect(updated.body.data.project.thumbnailUrl).toBe('https://cdn/update.png')
  expect(updated.body.data.project.tags).toHaveLength(0)
  expect(mediaMocks.deleteImage).toHaveBeenCalledWith('create-id')
})

test('ADMIN can replace and delete project thumbnail with cleanup', async () => {
  const cookie = await authCookie(adminEmail)
  const project = await prisma.project.create({ data: { title: 'Thumb Project', slug: 'test-project-thumbnail', summary: 'Summary', content: 'Content', thumbnailUrl: 'https://cdn/old.png', thumbnailPublicId: 'old-id' } })
  mediaMocks.uploadImage.mockResolvedValueOnce({ url: 'https://cdn/new.png', publicId: 'new-id' })

  const replaced = await request(app)
    .post(`/api/v1/admin/projects/${project.id}/thumbnail`)
    .set('Cookie', cookie)
    .attach('thumbnail', Buffer.from('fake'), { filename: 'thumbnail.png', contentType: 'image/png' })

  expect(replaced.status).toBe(200)
  expect(replaced.body.data.project.thumbnailUrl).toBe('https://cdn/new.png')
  expect(replaced.body.data.project.thumbnailPublicId).toBeUndefined()
  expect((await prisma.project.findUniqueOrThrow({ where: { id: project.id } })).thumbnailPublicId).toBe('new-id')
  expect(mediaMocks.deleteImage).toHaveBeenCalledWith('old-id')

  expect((await request(app).delete(`/api/v1/admin/projects/${project.id}/thumbnail`).set('Cookie', cookie)).status).toBe(204)
  expect(mediaMocks.deleteImage).toHaveBeenCalledWith('new-id')
  expect((await prisma.project.findUniqueOrThrow({ where: { id: project.id } })).thumbnailPublicId).toBeNull()
})
