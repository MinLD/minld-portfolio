import type { ProjectStatus } from '@prisma/client'
import type { ProjectTagDto } from '../project-tags/project-tag.dto.js'
import type { TechnologyDto } from '../technologies/technology.dto.js'

export type ProjectDto = {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  thumbnailUrl: string | null
  demoUrl: string | null
  githubUrl: string | null
  sourceUrl: string | null
  status: ProjectStatus
  featured: boolean
  year: number | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  tags: ProjectTagDto[]
  technologies: TechnologyDto[]
}
