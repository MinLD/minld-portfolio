import express from 'express'
import request from 'supertest'
import { expect, test, vi } from 'vitest'
import { sendSuccess } from '../responses/api-response.js'
import { errorHandler } from '../middleware/error-handler.js'
import { requestIdMiddleware } from '../middleware/request-id.js'
import { imageUpload } from './upload.middleware.js'

process.env.NODE_ENV = 'test'

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name]
    return
  }

  process.env[name] = value
}

const app = express()
  .use(requestIdMiddleware)
  .post('/upload', imageUpload.single('image'), (req, res) => sendSuccess(res, { size: req.file?.size, mimetype: req.file?.mimetype }))
  .use(errorHandler)

test('imageUpload accepts jpeg png webp in memory', async () => {
  const response = await request(app).post('/upload').attach('image', Buffer.from('fake'), { filename: 'image.png', contentType: 'image/png' })

  expect(response.status).toBe(200)
  expect(response.body.data).toEqual({ size: 4, mimetype: 'image/png' })
})

test('imageUpload rejects unsupported media types', async () => {
  const response = await request(app).post('/upload').attach('image', Buffer.from('fake'), { filename: 'image.gif', contentType: 'image/gif' })

  expect(response.status).toBe(400)
  expect(response.body.error.code).toBe('INVALID_MEDIA_TYPE')
})

test('mediaService refuses Cloudinary calls without credentials', async () => {
  const previous = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  }

  delete process.env.CLOUDINARY_CLOUD_NAME
  delete process.env.CLOUDINARY_API_KEY
  delete process.env.CLOUDINARY_API_SECRET
  vi.resetModules()

  try {
    const { mediaService } = await import('./media.service.js')
    await expect(mediaService.uploadImage({ buffer: Buffer.from('fake') } as Express.Multer.File, 'tests')).rejects.toMatchObject({ code: 'MEDIA_NOT_CONFIGURED' })
  } finally {
    restoreEnv('CLOUDINARY_CLOUD_NAME', previous.CLOUDINARY_CLOUD_NAME)
    restoreEnv('CLOUDINARY_API_KEY', previous.CLOUDINARY_API_KEY)
    restoreEnv('CLOUDINARY_API_SECRET', previous.CLOUDINARY_API_SECRET)
    vi.resetModules()
  }
})
