import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import type { mailOutbox as mailOutboxType } from '../../common/mail/mailer.js'

process.env.NODE_ENV = 'test'
process.env.CORS_ORIGIN = 'http://localhost:5173'

let app: Express
let mailOutbox: typeof mailOutboxType

beforeAll(async () => {
  ;({ app } = await import('../../app.js'))
  ;({ mailOutbox } = await import('../../common/mail/mailer.js'))
})

beforeEach(() => {
  mailOutbox.length = 0
})

describe('contact messages', () => {
  test('accepts a valid public contact message', async () => {
    const response = await request(app).post('/api/v1/contact').send({
      name: 'Luan Do',
      email: 'luan@example.com',
      phone: '+84 123 456 789',
      company: 'MinLD',
      category: 'GENERAL_INQUIRY',
      subject: 'Project collaboration',
      message: 'Hi, I would like to discuss a portfolio project with you.',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ success: true, data: { message: 'Message sent.' } })
    expect(mailOutbox).toHaveLength(1)
    expect(mailOutbox[0]?.subject).toBe('[Portfolio Contact] Project collaboration')
  })

  test('rejects invalid contact messages', async () => {
    const response = await request(app).post('/api/v1/contact').send({
      name: '',
      email: 'bad',
      category: 'BAD',
      subject: '',
      message: 'short',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mailOutbox).toHaveLength(0)
  })
})
