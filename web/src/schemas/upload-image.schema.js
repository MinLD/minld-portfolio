import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const uploadImageSchema = z.object({
  file: z
    .instanceof(File, { message: 'Image is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Image must be smaller than 5MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPG, PNG and WEBP images are allowed',
    ),
  folder: z.string().trim().regex(/^[a-z0-9/_-]+$/i, 'Upload folder is invalid'),
})
