import { prisma } from '../../database/prisma.js'

export const momentCategoryRepository = {
  create(data: { name: string; slug: string }) {
    return prisma.momentCategory.create({ data, include: { _count: { select: { moments: true } } } })
  },

  findMany() {
    return prisma.momentCategory.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { moments: true } } } })
  },

  findById(id: string) {
    return prisma.momentCategory.findUnique({ where: { id }, include: { _count: { select: { moments: true } } } })
  },

  findByNameOrSlug(name: string | undefined, slug: string | undefined, excludeId?: string) {
    return prisma.momentCategory.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        OR: [name ? { name } : undefined, slug ? { slug } : undefined].filter(Boolean) as [{ name: string } | { slug: string }],
      },
    })
  },

  update(id: string, data: { name?: string; slug?: string }) {
    return prisma.momentCategory.update({ where: { id }, data, include: { _count: { select: { moments: true } } } })
  },

  delete(id: string) {
    return prisma.momentCategory.delete({ where: { id } })
  },
}
