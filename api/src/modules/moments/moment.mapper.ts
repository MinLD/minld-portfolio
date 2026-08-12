import type { Moment, MomentImage, MomentTag, Prisma } from '@prisma/client'
import { toMomentTagDto } from '../moment-tags/moment-tag.mapper.js'
import type { MomentDto, MomentImageDto } from './moment.dto.js'

export const momentInclude = { images: { orderBy: { sortOrder: 'asc' } }, tags: true } satisfies Prisma.MomentInclude
export type MomentWithRelations = Moment & { images: MomentImage[]; tags: MomentTag[] }

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
    tags: moment.tags.map(toMomentTagDto),
  }
}
