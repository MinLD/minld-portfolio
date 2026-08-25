import type { MomentStatus, Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import type { TxClient } from '../../database/transaction.js'
import { momentCommentInclude } from './moment-comment.mapper.js'
import { momentInclude } from './moment.mapper.js'

const db = (tx?: TxClient) => tx ?? prisma
const connect = (ids: string[]) => ids.map((id) => ({ id }))

export type MomentWriteInput = {
  content?: string
  status?: MomentStatus
  publishedAt?: Date | null
}

export type MomentListFilter = {
  search?: string
  category?: string
  tag?: string
  status?: MomentStatus
  page: number
  limit: number
}

function momentWhere(filter: MomentListFilter): Prisma.MomentWhereInput {
  return {
    status: filter.status,
    content: filter.search ? { contains: filter.search, mode: 'insensitive' } : undefined,
    categories: filter.category ? { some: { slug: filter.category } } : undefined,
    tags: filter.tag ? { some: { slug: filter.tag } } : undefined,
  }
}

export const momentRepository = {
  create(data: MomentWriteInput & { content: string; categoryIds: string[]; tagIds: string[]; images?: { url: string; publicId: string }[] }, tx?: TxClient) {
    return db(tx).moment.create({
      data: {
        content: data.content,
        status: data.status,
        publishedAt: data.publishedAt,
        categories: { connect: connect(data.categoryIds) },
        tags: { connect: connect(data.tagIds) },
        images: data.images?.length ? { create: data.images.map((image, index) => ({ ...image, sortOrder: index })) } : undefined,
      },
      include: momentInclude,
    })
  },

  async findMany(filter: MomentListFilter) {
    const where = momentWhere(filter)
    const [moments, total] = await prisma.$transaction([
      prisma.moment.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (filter.page - 1) * filter.limit, take: filter.limit, include: momentInclude }),
      prisma.moment.count({ where }),
    ])
    return { moments, total }
  },

  findPublished() {
    return prisma.moment.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], include: momentInclude })
  },

  findById(id: string, tx?: TxClient) {
    return db(tx).moment.findUnique({ where: { id }, include: momentInclude })
  },

  findPublishedById(id: string) {
    return prisma.moment.findFirst({ where: { id, status: 'PUBLISHED' }, include: momentInclude })
  },

  findLike(momentId: string, userId: string) {
    return prisma.momentLike.findUnique({ where: { momentId_userId: { momentId, userId } } })
  },

  createLike(momentId: string, userId: string) {
    return prisma.momentLike.create({ data: { momentId, userId } })
  },

  deleteLike(momentId: string, userId: string) {
    return prisma.momentLike.delete({ where: { momentId_userId: { momentId, userId } } })
  },

  countLikes(momentId: string) {
    return prisma.momentLike.count({ where: { momentId } })
  },

  findVisibleComments(momentId: string) {
    return prisma.momentComment.findMany({ where: { momentId, status: 'VISIBLE' }, orderBy: { createdAt: 'asc' }, include: momentCommentInclude })
  },

  createComment(data: { momentId: string; authorName: string; content: string }) {
    return prisma.momentComment.create({ data, include: momentCommentInclude })
  },

  findCommentById(id: string) {
    return prisma.momentComment.findUnique({ where: { id }, include: momentCommentInclude })
  },

  findManyComments() {
    return prisma.momentComment.findMany({ orderBy: { createdAt: 'desc' }, include: momentCommentInclude })
  },

  updateComment(id: string, data: { content: string }) {
    return prisma.momentComment.update({ where: { id }, data, include: momentCommentInclude })
  },

  updateCommentStatus(id: string, status: 'VISIBLE' | 'HIDDEN') {
    return prisma.momentComment.update({ where: { id }, data: { status }, include: momentCommentInclude })
  },

  deleteComment(id: string) {
    return prisma.momentComment.delete({ where: { id } })
  },

  countTags(ids: string[], tx?: TxClient) {
    return ids.length ? db(tx).momentTag.count({ where: { id: { in: ids } } }) : 0
  },

  countCategories(ids: string[], tx?: TxClient) {
    return ids.length ? db(tx).momentCategory.count({ where: { id: { in: ids } } }) : 0
  },

  update(id: string, data: MomentWriteInput & { categoryIds?: string[]; tagIds?: string[]; images?: { url: string; publicId: string; sortOrder: number }[] }, tx?: TxClient) {
    const updateData: Prisma.MomentUpdateInput = {
      content: data.content,
      status: data.status,
      publishedAt: data.publishedAt,
      categories: data.categoryIds ? { set: connect(data.categoryIds) } : undefined,
      tags: data.tagIds ? { set: connect(data.tagIds) } : undefined,
      images: data.images ? { deleteMany: {}, create: data.images } : undefined,
    }
    return db(tx).moment.update({ where: { id }, data: updateData, include: momentInclude })
  },

  countImages(momentId: string, tx?: TxClient) {
    return db(tx).momentImage.count({ where: { momentId } })
  },

  createImages(momentId: string, images: { url: string; publicId: string; sortOrder: number }[], tx?: TxClient) {
    return db(tx).moment.update({ where: { id: momentId }, data: { images: { create: images } }, include: momentInclude })
  },

  findImageById(id: string) {
    return prisma.momentImage.findUnique({ where: { id } })
  },

  async reorderImages(momentId: string, images: { id: string; sortOrder: number }[], tx?: TxClient) {
    await Promise.all(images.map((image) => db(tx).momentImage.update({ where: { id: image.id, momentId }, data: { sortOrder: image.sortOrder } })))
    return db(tx).moment.findUniqueOrThrow({ where: { id: momentId }, include: momentInclude })
  },

  deleteImage(id: string) {
    return prisma.momentImage.delete({ where: { id } })
  },

  delete(id: string) {
    return prisma.moment.delete({ where: { id } })
  },
}
