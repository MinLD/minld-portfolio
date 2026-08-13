import type { Prisma } from '@prisma/client'
import type { ProjectCommentDto } from './project-comment.dto.js'

export const projectCommentInclude = { user: { select: { id: true, displayName: true, avatarUrl: true } } } satisfies Prisma.ProjectCommentInclude

export type ProjectCommentWithUser = Prisma.ProjectCommentGetPayload<{ include: typeof projectCommentInclude }>

export function toProjectCommentDto(comment: ProjectCommentWithUser): ProjectCommentDto {
  return {
    id: comment.id,
    projectId: comment.projectId,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    user: comment.user ?? { id: '', displayName: comment.authorName ?? 'Anonymous', avatarUrl: null },
  }
}
