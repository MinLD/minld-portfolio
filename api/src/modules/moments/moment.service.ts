import type { MomentStatus } from '@prisma/client'
import { AppError } from '../../common/errors/AppError.js'
import { mediaService } from '../../common/media/media.service.js'
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

export async function listPublishedMoments() {
  return { moments: (await momentRepository.findPublished()).map(toMomentDto) }
}

export async function getPublishedMoment(id: string) {
  const moment = await momentRepository.findPublishedById(id)
  if (!moment) throw new AppError(404, 'MOMENT_NOT_FOUND', 'Moment not found')
  return { moment: toMomentDto(moment) }
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

export async function addMomentImages(id: string, files: Express.Multer.File[] | undefined) {
  if (!files?.length) throw new AppError(400, 'MEDIA_REQUIRED', 'At least one image is required')
  const existingCount = await momentRepository.countImages((await findMomentOrThrow(id)).id)
  if (existingCount + files.length > 10) throw new AppError(400, 'MOMENT_IMAGE_LIMIT_EXCEEDED', 'Moment can have at most 10 images')
  const uploaded = await Promise.all(files.map((file) => mediaService.uploadImage(file, 'moments')))
  try {
    const moment = await momentRepository.createImages(id, uploaded.map((image, index) => ({ url: image.url, publicId: image.publicId, sortOrder: existingCount + index })))
    return { moment: toMomentDto(moment) }
  } catch (error) {
    await Promise.all(uploaded.map((image) => mediaService.deleteImage(image.publicId).catch(() => undefined)))
    throw error
  }
}

export async function reorderMomentImages(id: string, input: { images: { id: string; sortOrder: number }[] }) {
  await findMomentOrThrow(id)
  return { moment: toMomentDto(await runTransaction((tx) => momentRepository.reorderImages(id, input.images, tx))) }
}

export async function deleteMomentImage(id: string) {
  const image = await momentRepository.findImageById(id)
  if (!image) throw new AppError(404, 'MOMENT_IMAGE_NOT_FOUND', 'Moment image not found')
  await momentRepository.deleteImage(id)
  await mediaService.deleteImage(image.publicId)
}
