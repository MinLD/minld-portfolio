import type { MomentTag } from '@prisma/client'
import type { MomentTagDto } from './moment-tag.dto.js'

export function toMomentTagDto(tag: MomentTag): MomentTagDto {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }
}
