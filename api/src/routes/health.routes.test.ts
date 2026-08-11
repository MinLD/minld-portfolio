import request from 'supertest'
import { expect, test } from 'vitest'
import { app } from '../app.js'

test('GET /health returns ok', async () => {
  const response = await request(app).get('/health')

  expect(response.status).toBe(200)
  expect(response.body).toEqual({ ok: true })
})
