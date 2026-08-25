import { z } from 'zod'

const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const listMomentCategoriesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createMomentCategorySchema = z.object({ body: z.object({ name: z.string().trim().min(1), slug: slugSchema.optional() }) })
export const updateMomentCategorySchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({ name: z.string().trim().min(1).optional(), slug: slugSchema.optional() }).refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' }),
})
export const momentCategoryIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
export const listMomentCategoriesSchema = z.object({ query: listMomentCategoriesQuerySchema })
