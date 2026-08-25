import { AppError } from '../../common/errors/AppError.js'
import { toMomentCategoryDto } from './moment-category.mapper.js'
import { momentCategoryRepository } from './moment-category.repository.js'

async function ensureUnique(name: string | undefined, slug: string | undefined, excludeId?: string) {
  const existing = await momentCategoryRepository.findByNameOrSlug(name, slug, excludeId)
  if (existing) throw new AppError(409, 'MOMENT_CATEGORY_EXISTS', 'Moment category name or slug already exists')
}

async function findMomentCategoryOrThrow(id: string) {
  const category = await momentCategoryRepository.findById(id)
  if (!category) throw new AppError(404, 'MOMENT_CATEGORY_NOT_FOUND', 'Moment category not found')
  return category
}

export async function createMomentCategory(input: { name: string; slug: string }) {
  await ensureUnique(input.name, input.slug)
  return { category: toMomentCategoryDto(await momentCategoryRepository.create(input)) }
}

export async function listMomentCategories() {
  return { categories: (await momentCategoryRepository.findMany()).map(toMomentCategoryDto) }
}

export async function getMomentCategory(id: string) {
  return { category: toMomentCategoryDto(await findMomentCategoryOrThrow(id)) }
}

export async function updateMomentCategory(id: string, input: { name?: string; slug?: string }) {
  await findMomentCategoryOrThrow(id)
  await ensureUnique(input.name, input.slug, id)
  return { category: toMomentCategoryDto(await momentCategoryRepository.update(id, input)) }
}

export async function deleteMomentCategory(id: string) {
  await findMomentCategoryOrThrow(id)
  await momentCategoryRepository.delete(id)
}
