import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const optionalUrl = (message) => z.union([z.literal(''), z.string().trim().url(message)])

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title must not exceed 150 characters'),

  summary: z
    .string()
    .trim()
    .min(1, 'Summary is required')
    .max(500, 'Summary must not exceed 500 characters'),

  content: z.string().trim().min(1, 'Content is required'),

  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
    error: 'Invalid project status',
  }),

  year: z.coerce
    .number()
    .int('Year must be an integer')
    .min(2000, 'Year must be at least 2000')
    .max(2100, 'Year must not exceed 2100'),

  publishedAt: z.string(),

  featured: z.boolean(),

  demoUrl: optionalUrl('Demo URL is invalid'),

  githubUrl: optionalUrl('Github URL is invalid'),

  sourceUrl: optionalUrl('Source URL is invalid'),

  thumbnail: z
    .instanceof(File)
    .nullable()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'Thumbnail must be smaller than 5MB')
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPG, PNG and WEBP images are allowed',
    ),

  tagIds: z.array(z.string()),

  technologyIds: z.array(z.string()),
})
