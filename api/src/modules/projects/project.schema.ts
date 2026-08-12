import { ProjectStatus, TechnologyType } from '@prisma/client'
import { z } from 'zod'

const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const urlSchema = z.url()
const relationIdsSchema = z.array(z.uuid()).default([])

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1),
    slug: slugSchema,
    summary: z.string().trim().min(1),
    content: z.string().trim().min(1),
    thumbnailUrl: urlSchema.optional(),
    thumbnailPublicId: z.string().trim().min(1).optional(),
    demoUrl: urlSchema.optional(),
    githubUrl: urlSchema.optional(),
    sourceUrl: urlSchema.optional(),
    status: z.enum(ProjectStatus).default('DRAFT'),
    featured: z.boolean().default(false),
    year: z.int().min(1900).max(3000).optional(),
    publishedAt: z.iso.datetime().optional(),
    categoryIds: relationIdsSchema,
    technologyIds: relationIdsSchema,
  }),
})

export const updateProjectSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z
    .object({
      title: z.string().trim().min(1).optional(),
      slug: slugSchema.optional(),
      summary: z.string().trim().min(1).optional(),
      content: z.string().trim().min(1).optional(),
      thumbnailUrl: urlSchema.nullable().optional(),
      thumbnailPublicId: z.string().trim().min(1).nullable().optional(),
      demoUrl: urlSchema.nullable().optional(),
      githubUrl: urlSchema.nullable().optional(),
      sourceUrl: urlSchema.nullable().optional(),
      status: z.enum(ProjectStatus).optional(),
      featured: z.boolean().optional(),
      year: z.int().min(1900).max(3000).nullable().optional(),
      publishedAt: z.iso.datetime().nullable().optional(),
      categoryIds: z.array(z.uuid()).optional(),
      technologyIds: z.array(z.uuid()).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' }),
})

export const projectIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
export const projectSlugSchema = z.object({ params: z.object({ slug: slugSchema }) })
export const listPublishedProjectsSchema = z.object({
  query: z.object({
    search: z.string().trim().min(1).optional(),
    category: slugSchema.optional(),
    technology: slugSchema.optional(),
    technologyType: z.enum(TechnologyType).optional(),
    featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    year: z.coerce.number().int().min(1900).max(3000).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
})
