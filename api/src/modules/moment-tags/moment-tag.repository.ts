import { prisma } from '../../database/prisma.js'

export const momentTagRepository = {
  create(data: { name: string; slug: string }) {
    return prisma.momentTag.create({ data })
  },

  findMany() {
    return prisma.momentTag.findMany({ orderBy: { name: 'asc' } })
  },

  findById(id: string) {
    return prisma.momentTag.findUnique({ where: { id } })
  },

  findByNameOrSlug(name: string | undefined, slug: string | undefined, excludeId?: string) {
    return prisma.momentTag.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        OR: [name ? { name } : undefined, slug ? { slug } : undefined].filter(Boolean) as [{ name: string } | { slug: string }],
      },
    })
  },

  update(id: string, data: { name?: string; slug?: string }) {
    return prisma.momentTag.update({ where: { id }, data })
  },

  delete(id: string) {
    return prisma.momentTag.delete({ where: { id } })
  },
}
