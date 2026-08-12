import type { MomentCommentStatus } from '@prisma/client'

export type MomentCommentDto = {
  id: string
  momentId: string
  content: string
  status: MomentCommentStatus
  createdAt: string
  updatedAt: string
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
  }
}
