import type { ProjectStatus } from '@prisma/client'
import type { CategoryDto } from '../categories/category.dto.js'
import type { TechnologyDto } from '../technologies/technology.dto.js'

export type ProjectDto = {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  thumbnailUrl: string | null
  thumbnailPublicId: string | null
  demoUrl: string | null
  githubUrl: string | null
  sourceUrl: string | null
  status: ProjectStatus
  featured: boolean
  year: number | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  categories: CategoryDto[]
  technologies: TechnologyDto[]
}
