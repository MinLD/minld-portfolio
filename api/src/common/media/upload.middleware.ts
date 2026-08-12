import multer from 'multer'
import { env } from '../../config/env.js'
import { invalidMediaTypeError } from './media.errors.js'

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MEDIA_MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => (allowedMimeTypes.has(file.mimetype) ? cb(null, true) : cb(invalidMediaTypeError)),
})
