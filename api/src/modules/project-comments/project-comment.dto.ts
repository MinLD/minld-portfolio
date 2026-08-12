import type { ProjectCommentStatus } from '@prisma/client'

export type ProjectCommentDto = {
  id: string
  projectId: string
  content: string
  status: ProjectCommentStatus
  createdAt: string
  updatedAt: string
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
  }
}
