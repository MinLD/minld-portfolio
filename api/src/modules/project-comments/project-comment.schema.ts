import { z } from 'zod'

const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const projectCommentSlugSchema = z.object({ params: z.object({ slug: slugSchema }) })
export const createProjectCommentSchema = z.object({
  params: z.object({ slug: slugSchema }),
  body: z.object({ content: z.string().trim().min(1).max(2000) }),
})
export const projectCommentIdSchema = z.object({ params: z.object({ id: z.uuid() }) })
export const updateProjectCommentSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({ content: z.string().trim().min(1).max(2000) }),
})
