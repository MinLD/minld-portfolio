import type { Technology } from '@prisma/client'
import type { TechnologyDto } from './technology.dto.js'

export function toTechnologyDto(technology: Technology): TechnologyDto {
  return {
    id: technology.id,
    name: technology.name,
    slug: technology.slug,
    type: technology.type,
    description: technology.description,
    createdAt: technology.createdAt.toISOString(),
    updatedAt: technology.updatedAt.toISOString(),
  }
}
