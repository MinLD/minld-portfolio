import { AppError } from '../../common/errors/AppError.js'
import { toMomentCategoryDto } from './moment-category.mapper.js'
import { momentCategoryRepository, type MomentCategoryListFilter } from './moment-category.repository.js'

function slugifyName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[đĐ]/g, 'd')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category'
}

async function uniqueSlugFromName(name: string) {
  const base = slugifyName(name)
  let slug = base
  let suffix = 2

  while (await momentCategoryRepository.findByNameOrSlug(undefined, slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }

  return slug
}

async function ensureUnique(name: string | undefined, slug: string | undefined, excludeId?: string) {
  const existing = await momentCategoryRepository.findByNameOrSlug(name, slug, excludeId)
  if (existing) throw new AppError(409, 'MOMENT_CATEGORY_EXISTS', 'Moment category name or slug already exists')
}

async function findMomentCategoryOrThrow(id: string) {
  const category = await momentCategoryRepository.findById(id)
  if (!category) throw new AppError(404, 'MOMENT_CATEGORY_NOT_FOUND', 'Moment category not found')
  return category
}

export async function createMomentCategory(input: { name: string; slug?: string }) {
  const slug = input.slug ?? (await uniqueSlugFromName(input.name))
  await ensureUnique(input.name, input.slug)
  return { category: toMomentCategoryDto(await momentCategoryRepository.create({ ...input, slug })) }
}

export async function listMomentCategories(filter: MomentCategoryListFilter) {
  const { categories, total } = await momentCategoryRepository.findMany(filter)
  return {
    categories: categories.map(toMomentCategoryDto),
    meta: { page: filter.page, limit: filter.limit, total, totalPages: Math.ceil(total / filter.limit) },
  }
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
