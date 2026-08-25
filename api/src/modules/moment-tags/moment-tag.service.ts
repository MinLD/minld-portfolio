import { AppError } from '../../common/errors/AppError.js'
import { toMomentTagDto } from './moment-tag.mapper.js'
import { momentTagRepository, type MomentTagListFilter } from './moment-tag.repository.js'

function slugifyName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[đĐ]/g, 'd')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'tag'
}

function normalizeHashtagName(name: string) {
  const value = name.trim()
  return value.startsWith('#') ? value : `#${value}`
}

async function uniqueSlugFromName(name: string) {
  const base = slugifyName(name)
  let slug = base
  let suffix = 2

  while (await momentTagRepository.findByNameOrSlug(undefined, slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }

  return slug
}

async function ensureUnique(name: string | undefined, slug: string | undefined, excludeId?: string) {
  const existing = await momentTagRepository.findByNameOrSlug(name, slug, excludeId)
  if (existing) throw new AppError(409, 'MOMENT_TAG_EXISTS', 'Moment tag name or slug already exists')
}

async function findMomentTagOrThrow(id: string) {
  const tag = await momentTagRepository.findById(id)
  if (!tag) throw new AppError(404, 'MOMENT_TAG_NOT_FOUND', 'Moment tag not found')
  return tag
}

export async function createMomentTag(input: { name: string; slug?: string }) {
  const name = normalizeHashtagName(input.name)
  const slug = input.slug ?? (await uniqueSlugFromName(name))
  await ensureUnique(name, input.slug)
  return { tag: toMomentTagDto(await momentTagRepository.create({ name, slug })) }
}

export async function listMomentTags(filter: MomentTagListFilter) {
  const { tags, total } = await momentTagRepository.findMany(filter)
  return {
    tags: tags.map(toMomentTagDto),
    meta: { page: filter.page, limit: filter.limit, total, totalPages: Math.ceil(total / filter.limit) },
  }
}

export async function getMomentTag(id: string) {
  return { tag: toMomentTagDto(await findMomentTagOrThrow(id)) }
}

export async function updateMomentTag(id: string, input: { name?: string; slug?: string }) {
  await findMomentTagOrThrow(id)
  const data = { ...input, name: input.name ? normalizeHashtagName(input.name) : undefined }
  await ensureUnique(data.name, data.slug, id)
  return { tag: toMomentTagDto(await momentTagRepository.update(id, data)) }
}

export async function deleteMomentTag(id: string) {
  await findMomentTagOrThrow(id)
  await momentTagRepository.delete(id)
}
