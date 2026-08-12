import type { Prisma } from '@prisma/client'
import type { MomentCommentDto } from './moment-comment.dto.js'

export const momentCommentInclude = { user: { select: { id: true, displayName: true, avatarUrl: true } } } satisfies Prisma.MomentCommentInclude
export type MomentCommentWithUser = Prisma.MomentCommentGetPayload<{ include: typeof momentCommentInclude }>

export function toMomentCommentDto(comment: MomentCommentWithUser): MomentCommentDto {
  return {
    id: comment.id,
    momentId: comment.momentId,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    user: comment.user,
  }
}
