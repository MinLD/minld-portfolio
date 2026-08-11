import { prisma } from '../../database/prisma.js'

export const userRepository = {
  findById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } })
  },

  updateProfile(userId: string, data: { displayName: string }) {
    return prisma.user.update({ where: { id: userId }, data })
  },
}
