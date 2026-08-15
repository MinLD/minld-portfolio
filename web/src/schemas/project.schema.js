import { z } from 'zod'

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => !value || URL.canParse(value), 'Invalid URL')

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title is too long'),

  summary: z
    .string()
    .trim()
    .min(5, 'Summary must be at least 5 characters')
    .max(300, 'Summary is too long'),

  content: z.string().trim().min(10, 'Content must be at least 10 characters'),

  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),

  featured: z.boolean(),

  year: z.coerce.number().int().min(2000, 'Invalid year').max(2100, 'Invalid year'),

  publishedAt: z.string().optional().or(z.literal('')),

  demoUrl: optionalUrl,

  githubUrl: optionalUrl,

  sourceUrl: optionalUrl,

  tagIds: z.array(z.string()).min(1, 'Select at least one tag'),

  technologyIds: z.array(z.string()).min(1, 'Select at least one technology'),

  thumbnail: z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_THUMBNAIL_SIZE,
      'Thumbnail must be smaller than 5MB',
    )
    .refine(
      (file) => !file || IMAGE_TYPES.includes(file.type),
      'Only JPG, PNG and WEBP are allowed',
    ),
})
