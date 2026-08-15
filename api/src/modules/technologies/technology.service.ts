import type { TechnologyType } from '@prisma/client'
import { AppError } from '../../common/errors/AppError.js'
import { toTechnologyDto } from './technology.mapper.js'
import { technologyRepository } from './technology.repository.js'

async function ensureUnique(name: string | undefined, slug: string | undefined, excludeId?: string) {
  const existing = await technologyRepository.findByNameOrSlug(name, slug, excludeId)
  if (existing) throw new AppError(409, 'TECHNOLOGY_EXISTS', 'Technology name or slug already exists')
}

function slugifyName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[đĐ]/g, 'd')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'technology'
}

async function uniqueSlugFromName(name: string) {
  const base = slugifyName(name)
  let slug = base
  let suffix = 2

  while (await technologyRepository.findByNameOrSlug(undefined, slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }

  return slug
}

async function findTechnologyOrThrow(id: string) {
  const technology = await technologyRepository.findById(id)
  if (!technology) throw new AppError(404, 'TECHNOLOGY_NOT_FOUND', 'Technology not found')
  return technology
}

export async function createTechnology(input: { name: string; slug?: string; type: TechnologyType; description?: string }) {
  const slug = input.slug ?? (await uniqueSlugFromName(input.name))
  await ensureUnique(input.name, input.slug)
  return { technology: toTechnologyDto(await technologyRepository.create({ ...input, slug })) }
}

export async function listTechnologies(filter?: { type?: TechnologyType }) {
  return { technologies: (await technologyRepository.findMany(filter)).map(toTechnologyDto) }
}

export async function getTechnology(id: string) {
  return { technology: toTechnologyDto(await findTechnologyOrThrow(id)) }
}

export async function updateTechnology(id: string, input: { name?: string; slug?: string; type?: TechnologyType; description?: string | null }) {
  await findTechnologyOrThrow(id)
  await ensureUnique(input.name, input.slug, id)
  return { technology: toTechnologyDto(await technologyRepository.update(id, input)) }
}

export async function deleteTechnology(id: string) {
  await findTechnologyOrThrow(id)
  await technologyRepository.delete(id)
}
