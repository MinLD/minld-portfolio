import express from 'express'
import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from './api-response.js'

describe('api response helper', () => {
  test('sends success envelopes', async () => {
    const app = express().get('/', (_req, res) => sendSuccess(res, { ok: true }))
    const response = await request(app).get('/')
    expect(response.body).toEqual({ success: true, data: { ok: true } })
  })

  test('sends created envelopes', async () => {
    const app = express().post('/', (_req, res) => sendCreated(res, { id: 1 }))
    const response = await request(app).post('/')
    expect(response.status).toBe(201)
  })

  test('sends paginated envelopes', async () => {
    const app = express().get('/', (_req, res) => sendPaginated(res, [1], { page: 1 }))
    const response = await request(app).get('/')
    expect(response.body.meta).toEqual({ page: 1 })
  })

  test('sends no content', async () => {
    const app = express().delete('/', (_req, res) => sendNoContent(res))
    const response = await request(app).delete('/')
    expect(response.status).toBe(204)
  })
})
