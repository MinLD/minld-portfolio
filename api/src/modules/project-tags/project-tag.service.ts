import { AppError } from '../../common/errors/AppError.js'
import { categoryRepository } from '../categories/category.repository.js'
import { toProjectTagDto } from './project-tag.mapper.js'

function slugifyName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[đĐ]/g, 'd')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'tag'
}

async function uniqueSlugFromName(name: string) {
  const base = slugifyName(name)
  let slug = base
  let suffix = 2

  while (await categoryRepository.findByNameOrSlug(undefined, slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }

  return slug
}

async function ensureUnique(name: string | undefined, slug: string | undefined, excludeId?: string) {
  const existing = await categoryRepository.findByNameOrSlug(name, slug, excludeId)
  if (existing) throw new AppError(409, 'TAG_EXISTS', 'Tag name or slug already exists')
}

async function findProjectTagOrThrow(id: string) {
  const tag = await categoryRepository.findById(id)
  if (!tag) throw new AppError(404, 'TAG_NOT_FOUND', 'Tag not found')
  return tag
}

export async function createProjectTag(input: { name: string; slug?: string; description?: string }) {
  const slug = input.slug ?? (await uniqueSlugFromName(input.name))
  await ensureUnique(input.name, input.slug)
  return { tag: toProjectTagDto(await categoryRepository.create({ ...input, slug })) }
}

export async function listProjectTags() {
  return { tags: (await categoryRepository.findMany()).map(toProjectTagDto) }
}

export async function getProjectTag(id: string) {
  return { tag: toProjectTagDto(await findProjectTagOrThrow(id)) }
}

export async function updateProjectTag(id: string, input: { name?: string; slug?: string; description?: string | null }) {
  await findProjectTagOrThrow(id)
  await ensureUnique(input.name, input.slug, id)
  return { tag: toProjectTagDto(await categoryRepository.update(id, input)) }
}

export async function deleteProjectTag(id: string) {
  await findProjectTagOrThrow(id)
  await categoryRepository.delete(id)
}
