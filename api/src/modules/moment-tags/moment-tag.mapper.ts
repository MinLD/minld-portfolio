import type { MomentTag } from '@prisma/client'
import type { MomentTagDto } from './moment-tag.dto.js'

type MomentTagWithCount = MomentTag & { _count?: { moments: number } }

export function toMomentTagDto(tag: MomentTagWithCount): MomentTagDto {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    count: tag._count?.moments ?? 0,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }
}
