import type { MomentStatus } from '@prisma/client'
import type { MomentCategoryDto } from '../moment-categories/moment-category.dto.js'
import type { MomentTagDto } from '../moment-tags/moment-tag.dto.js'

export type MomentImageDto = {
  id: string
  url: string
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
  categories: MomentCategoryDto[]
  tags: MomentTagDto[]
}
