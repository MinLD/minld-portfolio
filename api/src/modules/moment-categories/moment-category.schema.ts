import { z } from 'zod'

const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const createMomentCategorySchema = z.object({ body: z.object({ name: z.string().trim().min(1), slug: slugSchema }) })
export const updateMomentCategorySchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({ name: z.string().trim().min(1).optional(), slug: slugSchema.optional() }).refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' }),
})
export const momentCategoryIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
