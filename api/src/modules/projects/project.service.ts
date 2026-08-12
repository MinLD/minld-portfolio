import type { ProjectStatus } from '@prisma/client'
import { AppError } from '../../common/errors/AppError.js'
import { runTransaction } from '../../database/transaction.js'
import { toProjectDto } from './project.mapper.js'
import { projectRepository, type ProjectWriteInput, type PublishedProjectFilter } from './project.repository.js'

type CreateProjectInput = ProjectWriteInput & { title: string; slug: string; summary: string; content: string; publishedAt?: string; categoryIds: string[]; technologyIds: string[]; status?: ProjectStatus }
type UpdateProjectInput = ProjectWriteInput & { publishedAt?: string | null; categoryIds?: string[]; technologyIds?: string[]; status?: ProjectStatus }

async function ensureUniqueSlug(slug: string | undefined, excludeId?: string) {
  if (slug && (await projectRepository.findBySlug(slug, excludeId))) throw new AppError(409, 'PROJECT_EXISTS', 'Project slug already exists')
}

async function findProjectOrThrow(id: string) {
  const project = await projectRepository.findById(id)
  if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found')
  return project
}

async function ensureRelations(categoryIds: string[] | undefined, technologyIds: string[] | undefined) {
  if (categoryIds && (await projectRepository.countCategories(categoryIds)) !== new Set(categoryIds).size) throw new AppError(400, 'CATEGORY_NOT_FOUND', 'One or more categories do not exist')
  if (technologyIds && (await projectRepository.countTechnologies(technologyIds)) !== new Set(technologyIds).size) throw new AppError(400, 'TECHNOLOGY_NOT_FOUND', 'One or more technologies do not exist')
}

function normalize(input: CreateProjectInput | UpdateProjectInput) {
  return { ...input, publishedAt: input.publishedAt === undefined ? undefined : input.publishedAt ? new Date(input.publishedAt) : null }
}

export async function createProject(input: CreateProjectInput) {
  await ensureUniqueSlug(input.slug)
  await ensureRelations(input.categoryIds, input.technologyIds)
  return { project: toProjectDto(await runTransaction((tx) => projectRepository.create(normalize(input) as CreateProjectInput & { publishedAt?: Date | null }, tx))) }
}

export async function listProjects() {
  return { projects: (await projectRepository.findMany()).map(toProjectDto) }
}

export async function getProject(id: string) {
  return { project: toProjectDto(await findProjectOrThrow(id)) }
}

export async function listPublishedProjects(filter: PublishedProjectFilter) {
  const { projects, total } = await projectRepository.findPublished(filter)
  return { projects: projects.map(toProjectDto), meta: { page: filter.page, limit: filter.limit, total, totalPages: Math.ceil(total / filter.limit) } }
}

export async function getPublishedProject(slug: string) {
  const project = await projectRepository.findPublishedBySlug(slug)
  if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found')
  return { project: toProjectDto(project) }
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  await findProjectOrThrow(id)
  await ensureUniqueSlug(input.slug, id)
  await ensureRelations(input.categoryIds, input.technologyIds)
  return { project: toProjectDto(await runTransaction((tx) => projectRepository.update(id, normalize(input) as UpdateProjectInput & { publishedAt?: Date | null }, tx))) }
}

export async function deleteProject(id: string) {
  await findProjectOrThrow(id)
  await projectRepository.delete(id)
}
