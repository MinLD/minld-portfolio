import { prisma } from '../../database/prisma.js'
import { projectCommentInclude } from './project-comment.mapper.js'

export const projectCommentRepository = {
  findVisibleByProjectId(projectId: string) {
    return prisma.projectComment.findMany({ where: { projectId, status: 'VISIBLE' }, orderBy: { createdAt: 'asc' }, include: projectCommentInclude })
  },

  create(data: { projectId: string; authorName: string; content: string }) {
    return prisma.projectComment.create({ data, include: projectCommentInclude })
  },

  findById(id: string) {
    return prisma.projectComment.findUnique({ where: { id }, include: projectCommentInclude })
  },

  findMany() {
    return prisma.projectComment.findMany({ orderBy: { createdAt: 'desc' }, include: projectCommentInclude })
  },

  update(id: string, data: { content: string }) {
    return prisma.projectComment.update({ where: { id }, data, include: projectCommentInclude })
  },

  updateStatus(id: string, status: 'VISIBLE' | 'HIDDEN') {
    return prisma.projectComment.update({ where: { id }, data: { status }, include: projectCommentInclude })
  },

  delete(id: string) {
    return prisma.projectComment.delete({ where: { id } })
  },
}
