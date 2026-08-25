import { z } from 'zod'

const MAX_IMAGES = 10

const uploadedImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
})

export const createMomentSchema = z.object({
  content: z.string().trim().min(1, 'Content is required'),

  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),

  publishedAt: z.string().optional(),

  categoryIds: z.array(z.string().uuid('Invalid category ID')).default([]),

  tagIds: z.array(z.string().uuid('Invalid tag ID')).default([]),

  images: z.array(uploadedImageSchema).max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images`).default([]),
})
