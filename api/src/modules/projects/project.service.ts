import type { ProjectStatus } from '@prisma/client'
import { AppError } from '../../common/errors/AppError.js'
import { mediaService } from '../../common/media/media.service.js'
import { runTransaction } from '../../database/transaction.js'
import { toProjectDto } from './project.mapper.js'
import { projectRepository, type ProjectWriteInput, type PublishedProjectFilter } from './project.repository.js'

type CreateProjectInput = ProjectWriteInput & { title: string; slug?: string; summary: string; content: string; publishedAt?: string; tagIds: string[]; categoryIds?: string[]; technologyIds: string[]; status?: ProjectStatus }
type UpdateProjectInput = ProjectWriteInput & { publishedAt?: string | null; tagIds?: string[]; categoryIds?: string[]; technologyIds?: string[]; status?: ProjectStatus }

function slugifyTitle(title: string) {
  return title
    .normalize('NFD')
    .replace(/[đĐ]/g, 'd')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project'
}

async function ensureUniqueSlug(slug: string | undefined, excludeId?: string) {
  if (slug && (await projectRepository.findBySlug(slug, excludeId))) throw new AppError(409, 'PROJECT_EXISTS', 'Project slug already exists')
}

async function uniqueSlugFromTitle(title: string, excludeId?: string) {
  const base = slugifyTitle(title)
  let slug = base
  let suffix = 2

  while (await projectRepository.findBySlug(slug, excludeId)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }

  return slug
}

async function findProjectOrThrow(id: string) {
  const project = await projectRepository.findById(id)
  if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found')
  return project
}

async function ensureRelations(tagIds: string[] | undefined, technologyIds: string[] | undefined) {
  if (tagIds && (await projectRepository.countTags(tagIds)) !== new Set(tagIds).size) throw new AppError(400, 'TAG_NOT_FOUND', 'One or more tags do not exist')
  if (technologyIds && (await projectRepository.countTechnologies(technologyIds)) !== new Set(technologyIds).size) throw new AppError(400, 'TECHNOLOGY_NOT_FOUND', 'One or more technologies do not exist')
}

function normalize<T extends CreateProjectInput | UpdateProjectInput>(input: T, tagIds?: string[]) {
  const { categoryIds: _categoryIds, ...data } = input
  return { ...data, tagIds, publishedAt: input.publishedAt === undefined ? undefined : input.publishedAt ? new Date(input.publishedAt) : null }
}

function resolveCreateTagIds(input: CreateProjectInput) {
  return input.tagIds.length ? input.tagIds : (input.categoryIds ?? [])
}

function resolveUpdateTagIds(input: UpdateProjectInput) {
  return input.tagIds ?? input.categoryIds
}

export async function createProject(input: CreateProjectInput, file?: Express.Multer.File) {
  const tagIds = resolveCreateTagIds(input)
  const slug = input.slug ?? (await uniqueSlugFromTitle(input.title))
  await ensureUniqueSlug(input.slug)
  await ensureRelations(tagIds, input.technologyIds)

  const uploaded = file ? await mediaService.uploadImage(file, 'projects/thumbnails') : undefined

  try {
    const data = { ...normalize(input, tagIds), slug, thumbnailUrl: uploaded?.url ?? input.thumbnailUrl, thumbnailPublicId: uploaded?.publicId }
    return { project: toProjectDto(await runTransaction((tx) => projectRepository.create(data as CreateProjectInput & { slug: string; publishedAt?: Date | null }, tx))) }
  } catch (error) {
    if (uploaded) await mediaService.deleteImage(uploaded.publicId).catch(() => undefined)
    throw error
  }
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

export async function updateProject(id: string, input: UpdateProjectInput, file?: Express.Multer.File) {
  if (!file && Object.keys(input).length === 0) throw new AppError(400, 'EMPTY_PROJECT_UPDATE', 'At least one field is required')
  const project = await findProjectOrThrow(id)
  const tagIds = resolveUpdateTagIds(input)
  await ensureUniqueSlug(input.slug, id)
  await ensureRelations(tagIds, input.technologyIds)

  const uploaded = file ? await mediaService.uploadImage(file, 'projects/thumbnails') : undefined

  try {
    const clearThumbnail = input.thumbnailUrl === null
    const data = { ...normalize(input, tagIds), thumbnailUrl: uploaded?.url ?? input.thumbnailUrl, thumbnailPublicId: uploaded ? uploaded.publicId : clearThumbnail ? null : undefined }
    const updated = await runTransaction((tx) => projectRepository.update(id, data as UpdateProjectInput & { publishedAt?: Date | null }, tx))
    if ((uploaded || clearThumbnail) && project.thumbnailPublicId) await mediaService.deleteImage(project.thumbnailPublicId)
    return { project: toProjectDto(updated) }
  } catch (error) {
    if (uploaded) await mediaService.deleteImage(uploaded.publicId).catch(() => undefined)
    throw error
  }
}

export async function deleteProject(id: string) {
  await findProjectOrThrow(id)
  await projectRepository.delete(id)
}

export async function replaceProjectThumbnail(id: string, file: Express.Multer.File | undefined) {
  if (!file) throw new AppError(400, 'MEDIA_REQUIRED', 'Thumbnail file is required')
  const project = await findProjectOrThrow(id)
  const uploaded = await mediaService.uploadImage(file, 'projects/thumbnails')
  try {
    const updated = await projectRepository.updateThumbnail(id, { thumbnailUrl: uploaded.url, thumbnailPublicId: uploaded.publicId })
    if (project.thumbnailPublicId) await mediaService.deleteImage(project.thumbnailPublicId)
    return { project: toProjectDto(updated) }
  } catch (error) {
    await mediaService.deleteImage(uploaded.publicId).catch(() => undefined)
    throw error
  }
}

export async function deleteProjectThumbnail(id: string) {
  const project = await findProjectOrThrow(id)
  await projectRepository.updateThumbnail(id, { thumbnailUrl: null, thumbnailPublicId: null })
  if (project.thumbnailPublicId) await mediaService.deleteImage(project.thumbnailPublicId)
}
