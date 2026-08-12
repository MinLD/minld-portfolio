import { prisma } from '../../database/prisma.js'

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
}
