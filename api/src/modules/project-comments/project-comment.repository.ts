import { prisma } from '../../database/prisma.js'
import { projectCommentInclude } from './project-comment.mapper.js'

export const projectCommentRepository = {
  findVisibleByProjectId(projectId: string) {
    return prisma.projectComment.findMany({ where: { projectId, status: 'VISIBLE' }, orderBy: { createdAt: 'asc' }, include: projectCommentInclude })
  },

  create(data: { projectId: string; userId: string; content: string }) {
    return prisma.projectComment.create({ data, include: projectCommentInclude })
  },
}
