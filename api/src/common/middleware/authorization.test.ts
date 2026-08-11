import express from 'express'
import request from 'supertest'
import { expect, test } from 'vitest'
import { requireActiveUser } from './require-active-user.js'
import { requireRole } from './authorize.js'
import { errorHandler } from './error-handler.js'

test('requireRole("ADMIN") rejects USER', async () => {
  const app = express()
    .use((_req, res, next) => {
      res.locals.auth = { role: 'USER', status: 'ACTIVE' }
      next()
    })
    .get('/admin', requireRole('ADMIN'), (_req, res) => res.json({ ok: true }))
    .use(errorHandler)

  const response = await request(app).get('/admin')
  expect(response.status).toBe(403)
})

test('requireActiveUser rejects BANNED', async () => {
  const app = express()
    .use((_req, res, next) => {
      res.locals.auth = { role: 'USER', status: 'BANNED' }
      next()
    })
    .post('/interaction', requireActiveUser, (_req, res) => res.json({ ok: true }))
    .use(errorHandler)

  const response = await request(app).post('/interaction')
  expect(response.status).toBe(403)
})
