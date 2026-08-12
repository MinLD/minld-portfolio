import { AppError } from '../../common/errors/AppError.js'
import { toMomentTagDto } from './moment-tag.mapper.js'
import { momentTagRepository } from './moment-tag.repository.js'

async function ensureUnique(name: string | undefined, slug: string | undefined, excludeId?: string) {
  const existing = await momentTagRepository.findByNameOrSlug(name, slug, excludeId)
  if (existing) throw new AppError(409, 'MOMENT_TAG_EXISTS', 'Moment tag name or slug already exists')
}

async function findMomentTagOrThrow(id: string) {
  const tag = await momentTagRepository.findById(id)
  if (!tag) throw new AppError(404, 'MOMENT_TAG_NOT_FOUND', 'Moment tag not found')
  return tag
}

export async function createMomentTag(input: { name: string; slug: string }) {
  await ensureUnique(input.name, input.slug)
  return { tag: toMomentTagDto(await momentTagRepository.create(input)) }
}

export async function listMomentTags() {
  return { tags: (await momentTagRepository.findMany()).map(toMomentTagDto) }
}

export async function getMomentTag(id: string) {
  return { tag: toMomentTagDto(await findMomentTagOrThrow(id)) }
}

export async function updateMomentTag(id: string, input: { name?: string; slug?: string }) {
  await findMomentTagOrThrow(id)
  await ensureUnique(input.name, input.slug, id)
  return { tag: toMomentTagDto(await momentTagRepository.update(id, input)) }
}

export async function deleteMomentTag(id: string) {
  await findMomentTagOrThrow(id)
  await momentTagRepository.delete(id)
}
