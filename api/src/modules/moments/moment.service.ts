import type { MomentStatus } from '@prisma/client'
import { AppError } from '../../common/errors/AppError.js'
import { runTransaction } from '../../database/transaction.js'
import { toMomentDto } from './moment.mapper.js'
import { momentRepository, type MomentWriteInput } from './moment.repository.js'

type CreateMomentInput = MomentWriteInput & { content: string; publishedAt?: string; status?: MomentStatus; tagIds: string[] }
type UpdateMomentInput = MomentWriteInput & { publishedAt?: string | null; status?: MomentStatus; tagIds?: string[] }

async function findMomentOrThrow(id: string) {
  const moment = await momentRepository.findById(id)
  if (!moment) throw new AppError(404, 'MOMENT_NOT_FOUND', 'Moment not found')
  return moment
}

async function ensureTags(tagIds: string[] | undefined) {
  if (tagIds && (await momentRepository.countTags(tagIds)) !== new Set(tagIds).size) throw new AppError(400, 'MOMENT_TAG_NOT_FOUND', 'One or more moment tags do not exist')
}

function normalize(input: CreateMomentInput | UpdateMomentInput) {
  return { ...input, publishedAt: input.publishedAt === undefined ? undefined : input.publishedAt ? new Date(input.publishedAt) : null }
}

export async function createMoment(input: CreateMomentInput) {
  await ensureTags(input.tagIds)
  return { moment: toMomentDto(await runTransaction((tx) => momentRepository.create(normalize(input) as CreateMomentInput & { publishedAt?: Date | null }, tx))) }
}

export async function listMoments() {
  return { moments: (await momentRepository.findMany()).map(toMomentDto) }
}

export async function getMoment(id: string) {
  return { moment: toMomentDto(await findMomentOrThrow(id)) }
}

export async function updateMoment(id: string, input: UpdateMomentInput) {
  await findMomentOrThrow(id)
  await ensureTags(input.tagIds)
  return { moment: toMomentDto(await runTransaction((tx) => momentRepository.update(id, normalize(input) as UpdateMomentInput & { publishedAt?: Date | null }, tx))) }
}

export async function deleteMoment(id: string) {
  await findMomentOrThrow(id)
  await momentRepository.delete(id)
}
