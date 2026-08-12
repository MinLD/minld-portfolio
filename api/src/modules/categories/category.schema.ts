import { z } from 'zod'

const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    slug: slugSchema,
    description: z.string().trim().min(1).optional(),
  }),
})

export const updateCategorySchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      slug: slugSchema.optional(),
      description: z.string().trim().min(1).nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' }),
})

export const categoryIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
