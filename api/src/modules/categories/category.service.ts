import { AppError } from '../../common/errors/AppError.js'
import { toCategoryDto } from './category.mapper.js'
import { categoryRepository } from './category.repository.js'

async function ensureUnique(name: string | undefined, slug: string | undefined, excludeId?: string) {
  const existing = await categoryRepository.findByNameOrSlug(name, slug, excludeId)
  if (existing) throw new AppError(409, 'CATEGORY_EXISTS', 'Category name or slug already exists')
}

async function findCategoryOrThrow(id: string) {
  const category = await categoryRepository.findById(id)
  if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found')
  return category
}

export async function createCategory(input: { name: string; slug: string; description?: string }) {
  await ensureUnique(input.name, input.slug)
  return { category: toCategoryDto(await categoryRepository.create(input)) }
}

export async function listCategories() {
  return { categories: (await categoryRepository.findMany()).map(toCategoryDto) }
}

export async function getCategory(id: string) {
  return { category: toCategoryDto(await findCategoryOrThrow(id)) }
}

export async function updateCategory(id: string, input: { name?: string; slug?: string; description?: string | null }) {
  await findCategoryOrThrow(id)
  await ensureUnique(input.name, input.slug, id)
  return { category: toCategoryDto(await categoryRepository.update(id, input)) }
}

export async function deleteCategory(id: string) {
  await findCategoryOrThrow(id)
  await categoryRepository.delete(id)
}
