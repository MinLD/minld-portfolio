import request from 'supertest'
import { expect, test } from 'vitest'
import { app } from '../../app.js'

test('allows configured CORS origin with credentials', async () => {
  const response = await request(app).get('/api/v1/health').set('Origin', 'http://localhost:5173')

  expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  expect(response.headers['access-control-allow-credentials']).toBe('true')
})

test('denies unconfigured CORS origin', async () => {
  const response = await request(app).get('/api/v1/health').set('Origin', 'http://evil.example')

  expect(response.status).toBe(403)
  expect(response.body.error.code).toBe('CORS_ORIGIN_DENIED')
})
