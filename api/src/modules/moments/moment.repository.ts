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

export const momentRepository = {
  create(data: MomentWriteInput & { content: string; tagIds: string[] }, tx?: TxClient) {
    return db(tx).moment.create({
      data: {
        content: data.content,
        status: data.status,
        publishedAt: data.publishedAt,
        tags: { connect: connect(data.tagIds) },
      },
      include: momentInclude,
    })
  },

  findMany() {
    return prisma.moment.findMany({ orderBy: { createdAt: 'desc' }, include: momentInclude })
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

  createComment(data: { momentId: string; userId: string; content: string }) {
    return prisma.momentComment.create({ data, include: momentCommentInclude })
  },

  countTags(ids: string[], tx?: TxClient) {
    return ids.length ? db(tx).momentTag.count({ where: { id: { in: ids } } }) : 0
  },

  update(id: string, data: MomentWriteInput & { tagIds?: string[] }, tx?: TxClient) {
    const updateData: Prisma.MomentUpdateInput = {
      content: data.content,
      status: data.status,
      publishedAt: data.publishedAt,
      tags: data.tagIds ? { set: connect(data.tagIds) } : undefined,
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
