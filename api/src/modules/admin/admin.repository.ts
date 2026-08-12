import { prisma } from '../../database/prisma.js'
import type { Prisma, UserRole, UserStatus } from '@prisma/client'

export type AdminUserFilter = {
  search?: string
  role?: UserRole
  status?: UserStatus
  page: number
  limit: number
}

function userWhere(filter: AdminUserFilter): Prisma.UserWhereInput {
  return {
    role: filter.role,
    status: filter.status,
    OR: filter.search ? [{ email: { contains: filter.search, mode: 'insensitive' } }, { displayName: { contains: filter.search, mode: 'insensitive' } }] : undefined,
  }
}

export const adminRepository = {
  async dashboardCounts() {
    const [users, projects, publishedProjects, projectComments, moments, publishedMoments, momentComments] = await prisma.$transaction([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.projectComment.count(),
      prisma.moment.count(),
      prisma.moment.count({ where: { status: 'PUBLISHED' } }),
      prisma.momentComment.count(),
    ])
    return { users, projects, publishedProjects, projectComments, moments, publishedMoments, momentComments }
  },

  async listUsers(filter: AdminUserFilter) {
    const where = userWhere(filter)
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (filter.page - 1) * filter.limit, take: filter.limit }),
      prisma.user.count({ where }),
    ])
    return { users, total }
  },

  findUser(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  updateUserStatus(id: string, status: UserStatus) {
    return prisma.user.update({ where: { id }, data: { status } })
  },
}
