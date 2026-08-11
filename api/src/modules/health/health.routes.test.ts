import request from 'supertest'
import { expect, test } from 'vitest'
import { app } from '../../app.js'

test('GET /api/v1/health returns standard envelope', async () => {
  const response = await request(app).get('/api/v1/health')

  expect(response.status).toBe(200)
  expect(response.body).toEqual({ success: true, data: { status: 'ok' } })
})

test('GET /api/v1/ready checks database', async () => {
  const response = await request(app).get('/api/v1/ready')

  expect(response.status).toBe(200)
  expect(response.body).toEqual({ success: true, data: { status: 'ok', database: 'ok' } })
})
