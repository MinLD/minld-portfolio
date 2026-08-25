import type { Moment, MomentCategory, MomentImage, MomentTag, Prisma } from '@prisma/client'
import { toMomentCategoryDto } from '../moment-categories/moment-category.mapper.js'
import { toMomentTagDto } from '../moment-tags/moment-tag.mapper.js'
import type { MomentDto, MomentImageDto } from './moment.dto.js'

const taxonomyCount = { _count: { select: { moments: true } } }

export const momentInclude = { images: { orderBy: { sortOrder: 'asc' } }, categories: { include: taxonomyCount }, tags: { include: taxonomyCount } } satisfies Prisma.MomentInclude
export type MomentWithRelations = Moment & {
  images: MomentImage[]
  categories: (MomentCategory & { _count?: { moments: number } })[]
  tags: (MomentTag & { _count?: { moments: number } })[]
}

function toMomentImageDto(image: MomentImage): MomentImageDto {
  return {
    id: image.id,
    url: image.url,
    altText: image.altText,
    sortOrder: image.sortOrder,
    createdAt: image.createdAt.toISOString(),
  }
}

export function toMomentDto(moment: MomentWithRelations): MomentDto {
  return {
    id: moment.id,
    content: moment.content,
    status: moment.status,
    publishedAt: moment.publishedAt?.toISOString() ?? null,
    createdAt: moment.createdAt.toISOString(),
    updatedAt: moment.updatedAt.toISOString(),
    images: moment.images.map(toMomentImageDto),
    categories: moment.categories.map(toMomentCategoryDto),
    tags: moment.tags.map(toMomentTagDto),
  }
}
