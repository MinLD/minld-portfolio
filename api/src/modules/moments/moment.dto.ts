import type { MomentStatus } from '@prisma/client'
import type { MomentTagDto } from '../moment-tags/moment-tag.dto.js'

export type MomentImageDto = {
  id: string
  url: string
  publicId: string
  altText: string | null
  sortOrder: number
  createdAt: string
}

export type MomentDto = {
  id: string
  content: string
  status: MomentStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  images: MomentImageDto[]
  tags: MomentTagDto[]
}
