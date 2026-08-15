import { TechnologyType } from '@prisma/client'
import { z } from 'zod'

const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const optionalSlugSchema = z.preprocess((value) => (value === '' ? undefined : value), slugSchema.optional())
const technologyTypeSchema = z.enum(TechnologyType)

export const createTechnologySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    slug: optionalSlugSchema,
    type: technologyTypeSchema,
    description: z.string().trim().min(1).optional(),
  }),
})

export const updateTechnologySchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      slug: optionalSlugSchema,
      type: technologyTypeSchema.optional(),
      description: z.string().trim().min(1).nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' }),
})

export const technologyIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
export const listTechnologiesSchema = z.object({ query: z.object({ type: technologyTypeSchema.optional() }) })
