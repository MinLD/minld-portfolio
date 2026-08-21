import { MomentStatus } from '@prisma/client'
import { z } from 'zod'

const tagIdsSchema = z.array(z.uuid()).default([])
const uploadedImagesSchema = z.array(z.object({
  url: z.url(),
  publicId: z.string().trim().min(1),
})).max(10).default([])
const listMomentsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  status: z.enum(MomentStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createMomentSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1),
    status: z.enum(MomentStatus).default('DRAFT'),
    publishedAt: z.iso.datetime().optional(),
    tagIds: tagIdsSchema,
    images: uploadedImagesSchema,
  }),
})

export const updateMomentSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z
    .object({
      content: z.string().trim().min(1).optional(),
      status: z.enum(MomentStatus).optional(),
      publishedAt: z.iso.datetime().nullable().optional(),
      tagIds: z.array(z.uuid()).optional(),
      images: uploadedImagesSchema.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' }),
})

export const listMomentsSchema = z.object({ query: listMomentsQuerySchema })
export const momentIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
export const momentImageIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
export const reorderMomentImagesSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({ images: z.array(z.object({ id: z.uuid(), sortOrder: z.int().min(0) })).min(1).max(10) }),
})
export const createMomentCommentSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({ authorName: z.string().trim().min(1).max(80), content: z.string().trim().min(1).max(2000) }),
})
export const momentCommentIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
export const updateMomentCommentSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({ content: z.string().trim().min(1).max(2000) }),
})
export const updateMomentCommentStatusSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({ status: z.enum(['VISIBLE', 'HIDDEN']) }),
})
