import type { MomentStatus } from '@prisma/client'
import { AppError } from '../../common/errors/AppError.js'
import { mediaService } from '../../common/media/media.service.js'
import { runTransaction } from '../../database/transaction.js'
import { toMomentCommentDto } from './moment-comment.mapper.js'
import { toMomentDto } from './moment.mapper.js'
import { momentRepository, type MomentListFilter, type MomentWriteInput } from './moment.repository.js'

type UploadedMomentImage = { url: string; publicId: string }
type CreateMomentInput = MomentWriteInput & { content: string; publishedAt?: string; status?: MomentStatus; tagIds: string[]; images?: UploadedMomentImage[] }
type UpdateMomentInput = MomentWriteInput & { publishedAt?: string | null; status?: MomentStatus; tagIds?: string[]; images?: UploadedMomentImage[] }

async function findMomentOrThrow(id: string) {
  const moment = await momentRepository.findById(id)
  if (!moment) throw new AppError(404, 'MOMENT_NOT_FOUND', 'Moment not found')
  return moment
}

async function ensureTags(tagIds: string[] | undefined) {
  if (tagIds && (await momentRepository.countTags(tagIds)) !== new Set(tagIds).size) throw new AppError(400, 'MOMENT_TAG_NOT_FOUND', 'One or more moment tags do not exist')
}

function normalize(input: CreateMomentInput | UpdateMomentInput) {
  const { images: _images, ...data } = input
  return { ...data, publishedAt: input.publishedAt === undefined ? undefined : input.publishedAt ? new Date(input.publishedAt) : null }
}

export async function createMoment(input: CreateMomentInput) {
  await ensureTags(input.tagIds)
  return { moment: toMomentDto(await runTransaction((tx) => momentRepository.create({ ...normalize(input), images: input.images ?? [] } as CreateMomentInput & { publishedAt?: Date | null; images: UploadedMomentImage[] }, tx))) }
}

export async function listMoments(filter: MomentListFilter) {
  const { moments, total } = await momentRepository.findMany(filter)
  return { moments: moments.map(toMomentDto), meta: { page: filter.page, limit: filter.limit, total, totalPages: Math.ceil(total / filter.limit) } }
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

export async function toggleMomentLike(id: string, userId: string) {
  const moment = await momentRepository.findPublishedById(id)
  if (!moment) throw new AppError(404, 'MOMENT_NOT_FOUND', 'Moment not found')
  const existing = await momentRepository.findLike(id, userId)
  if (existing) {
    await momentRepository.deleteLike(id, userId)
    return { liked: false, likeCount: await momentRepository.countLikes(id) }
  }
  await momentRepository.createLike(id, userId)
  return { liked: true, likeCount: await momentRepository.countLikes(id) }
}

export async function listMomentComments(id: string) {
  const moment = await momentRepository.findPublishedById(id)
  if (!moment) throw new AppError(404, 'MOMENT_NOT_FOUND', 'Moment not found')
  return { comments: (await momentRepository.findVisibleComments(id)).map(toMomentCommentDto) }
}

export async function createMomentComment(id: string, input: { authorName: string; content: string }) {
  const moment = await momentRepository.findPublishedById(id)
  if (!moment) throw new AppError(404, 'MOMENT_NOT_FOUND', 'Moment not found')
  return { comment: toMomentCommentDto(await momentRepository.createComment({ momentId: id, authorName: input.authorName, content: input.content })) }
}

async function findOwnMomentComment(id: string, userId: string) {
  const comment = await momentRepository.findCommentById(id)
  if (!comment) throw new AppError(404, 'MOMENT_COMMENT_NOT_FOUND', 'Moment comment not found')
  if (!comment.userId || comment.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'Forbidden')
  return comment
}

export async function updateOwnMomentComment(id: string, userId: string, input: { content: string }) {
  await findOwnMomentComment(id, userId)
  return { comment: toMomentCommentDto(await momentRepository.updateComment(id, input)) }
}

export async function deleteOwnMomentComment(id: string, userId: string) {
  await findOwnMomentComment(id, userId)
  await momentRepository.deleteComment(id)
}

async function findMomentCommentOrThrow(id: string) {
  const comment = await momentRepository.findCommentById(id)
  if (!comment) throw new AppError(404, 'MOMENT_COMMENT_NOT_FOUND', 'Moment comment not found')
  return comment
}

export async function listAdminMomentComments() {
  return { comments: (await momentRepository.findManyComments()).map(toMomentCommentDto) }
}

export async function updateMomentCommentStatus(id: string, input: { status: 'VISIBLE' | 'HIDDEN' }) {
  await findMomentCommentOrThrow(id)
  return { comment: toMomentCommentDto(await momentRepository.updateCommentStatus(id, input.status)) }
}

export async function deleteAdminMomentComment(id: string) {
  await findMomentCommentOrThrow(id)
  await momentRepository.deleteComment(id)
}

export async function updateMoment(id: string, input: UpdateMomentInput) {
  const existing = await findMomentOrThrow(id)
  await ensureTags(input.tagIds)
  if (input.images && input.images.length > 10) throw new AppError(400, 'MOMENT_IMAGE_LIMIT_EXCEEDED', 'Moment can have at most 10 images')
  const nextImages = input.images?.map((image, index) => ({ ...image, sortOrder: index }))
  const moment = await runTransaction((tx) => momentRepository.update(id, { ...normalize(input), images: nextImages } as UpdateMomentInput & { publishedAt?: Date | null; images?: (UploadedMomentImage & { sortOrder: number })[] }, tx))
  if (input.images) await Promise.all(existing.images.map((image) => mediaService.deleteImage(image.publicId).catch(() => undefined)))
  return { moment: toMomentDto(moment) }
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
