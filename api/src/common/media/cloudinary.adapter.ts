import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { env } from '../../config/env.js'
import { mediaNotConfiguredError } from './media.errors.js'

export type UploadedMedia = {
  url: string
  publicId: string
  width?: number
  height?: number
  format?: string
}

function ensureConfigured() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) throw mediaNotConfiguredError
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true })
}

export const cloudinaryAdapter = {
  async uploadBuffer(buffer: Buffer, folder: string): Promise<UploadedMedia> {
    ensureConfigured()
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error)
          return
        }
        resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, format: result.format })
      })
      stream.end(buffer)
    })
  },

  async delete(publicId: string) {
    ensureConfigured()
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  },
}
