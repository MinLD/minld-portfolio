import express from 'express'
import request from 'supertest'
import { z } from 'zod'
import { describe, expect, test } from 'vitest'
import { AppError } from '../errors/AppError.js'
import { validateRequest } from '../validation/validate-request.js'
import { errorHandler } from './error-handler.js'
import { notFoundMiddleware } from './not-found.js'
import { requestIdMiddleware } from './request-id.js'

describe('shared http middleware', () => {
  test('handles validation failure', async () => {
    const app = express().use(express.json()).use(requestIdMiddleware).post('/', validateRequest(z.object({ body: z.object({ email: z.email() }) })), (_req, res) => res.json({ ok: true })).use(errorHandler)
    const response = await request(app).post('/').send({ email: 'bad' })
    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
  })

  test('handles not found', async () => {
    const app = express().use(requestIdMiddleware).use(notFoundMiddleware).use(errorHandler)
    const response = await request(app).get('/missing')
    expect(response.status).toBe(404)
  })

  test('handles AppError', async () => {
    const app = express().use(requestIdMiddleware).get('/', () => { throw new AppError(409, 'CONFLICT', 'Conflict') }).use(errorHandler)
    const response = await request(app).get('/')
    expect(response.body.error.code).toBe('CONFLICT')
  })

  test('handles unexpected error', async () => {
    const app = express().use(requestIdMiddleware).get('/', () => { throw new Error('boom') }).use(errorHandler)
    const response = await request(app).get('/')
    expect(response.status).toBe(500)
  })
})
