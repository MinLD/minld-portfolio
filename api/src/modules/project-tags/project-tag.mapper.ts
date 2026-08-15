import type { Category } from '@prisma/client'
import type { ProjectTagDto } from './project-tag.dto.js'

export function toProjectTagDto(tag: Category): ProjectTagDto {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }
}
