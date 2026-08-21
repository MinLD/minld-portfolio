import { z } from 'zod'

export const uploadImageSchema = z.object({
  body: z.object({
    folder: z
      .string()
      .trim()
      .regex(/^[a-z0-9/_-]+$/i, 'Upload folder is invalid')
      .default('uploads'),
  }),
})
