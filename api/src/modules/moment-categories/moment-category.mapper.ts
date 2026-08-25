import type { MomentCategory } from '@prisma/client'
import type { MomentCategoryDto } from './moment-category.dto.js'

type MomentCategoryWithCount = MomentCategory & { _count?: { moments: number } }

export function toMomentCategoryDto(category: MomentCategoryWithCount): MomentCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    count: category._count?.moments ?? 0,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}
