import { ProjectStatus, TechnologyType } from '@prisma/client'
import { z } from 'zod'

const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const urlSchema = z.url()
const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value)
const emptyToNull = (value: unknown) => (value === '' ? null : value)
const optionalSlugSchema = z.preprocess(emptyToUndefined, slugSchema.optional())
const formBooleanSchema = z.preprocess((value) => (value === 'true' ? true : value === 'false' ? false : value), z.boolean())
const optionalUrlSchema = z.preprocess(emptyToUndefined, urlSchema.optional())
const nullableUrlSchema = z.preprocess(emptyToNull, urlSchema.nullable().optional())
const optionalYearSchema = z.preprocess(emptyToUndefined, z.coerce.number().int().min(1900).max(3000).optional())
const nullableYearSchema = z.preprocess(emptyToNull, z.coerce.number().int().min(1900).max(3000).nullable().optional())
const parseIds = (value: unknown) => {
  if (value === undefined) return undefined
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return []
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as unknown
    } catch {
      return value
    }
  }
  return trimmed.split(',').map((id) => id.trim()).filter(Boolean)
}
const relationIdsSchema = z.preprocess(parseIds, z.array(z.uuid()).default([]))
const optionalRelationIdsSchema = z.preprocess(parseIds, z.array(z.uuid()).optional())

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1),
    slug: optionalSlugSchema,
    summary: z.string().trim().min(1),
    content: z.string().trim().min(1),
    thumbnailUrl: optionalUrlSchema,
    demoUrl: optionalUrlSchema,
    githubUrl: optionalUrlSchema,
    sourceUrl: optionalUrlSchema,
    status: z.enum(ProjectStatus).default('DRAFT'),
    featured: formBooleanSchema.default(false),
    year: optionalYearSchema,
    publishedAt: z.preprocess(emptyToUndefined, z.iso.datetime().optional()),
    tagIds: relationIdsSchema,
    categoryIds: relationIdsSchema.optional(),
    technologyIds: relationIdsSchema,
  }),
})

export const updateProjectSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z
    .object({
      title: z.string().trim().min(1).optional(),
      slug: optionalSlugSchema,
      summary: z.string().trim().min(1).optional(),
      content: z.string().trim().min(1).optional(),
      thumbnailUrl: nullableUrlSchema,
      demoUrl: nullableUrlSchema,
      githubUrl: nullableUrlSchema,
      sourceUrl: nullableUrlSchema,
      status: z.enum(ProjectStatus).optional(),
      featured: formBooleanSchema.optional(),
      year: nullableYearSchema,
      publishedAt: z.preprocess(emptyToNull, z.iso.datetime().nullable().optional()),
      tagIds: optionalRelationIdsSchema,
      categoryIds: optionalRelationIdsSchema,
      technologyIds: optionalRelationIdsSchema,
    }),
})

export const projectIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
export const projectSlugSchema = z.object({ params: z.object({ slug: slugSchema }) })
const listProjectsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  tag: slugSchema.optional(),
  category: slugSchema.optional(),
  technology: slugSchema.optional(),
  technologyType: z.enum(TechnologyType).optional(),
  featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  year: z.coerce.number().int().min(1900).max(3000).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const listProjectsSchema = z.object({ query: listProjectsQuerySchema.extend({ status: z.enum(ProjectStatus).optional() }) })
export const listPublishedProjectsSchema = z.object({ query: listProjectsQuerySchema })
