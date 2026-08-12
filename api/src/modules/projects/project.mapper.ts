import type { Category, Prisma, Project, Technology } from '@prisma/client'
import { toCategoryDto } from '../categories/category.mapper.js'
import { toTechnologyDto } from '../technologies/technology.mapper.js'
import type { ProjectDto } from './project.dto.js'

export type ProjectWithRelations = Project & { categories: Category[]; technologies: Technology[] }

export const projectInclude = { categories: true, technologies: true } satisfies Prisma.ProjectInclude

export function toProjectDto(project: ProjectWithRelations): ProjectDto {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    content: project.content,
    thumbnailUrl: project.thumbnailUrl,
    thumbnailPublicId: project.thumbnailPublicId,
    demoUrl: project.demoUrl,
    githubUrl: project.githubUrl,
    sourceUrl: project.sourceUrl,
    status: project.status,
    featured: project.featured,
    year: project.year,
    publishedAt: project.publishedAt?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    categories: project.categories.map(toCategoryDto),
    technologies: project.technologies.map(toTechnologyDto),
  }
}
