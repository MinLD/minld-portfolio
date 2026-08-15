import { z } from 'zod'

const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const optionalSlugSchema = z.preprocess((value) => (value === '' ? undefined : value), slugSchema.optional())

export const createProjectTagSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    slug: optionalSlugSchema,
    description: z.string().trim().min(1).optional(),
  }),
})

export const updateProjectTagSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      slug: optionalSlugSchema,
      description: z.string().trim().min(1).nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' }),
})

export const projectTagIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
