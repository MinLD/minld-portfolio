import { prisma } from '../../database/prisma.js'

export const categoryRepository = {
  create(data: { name: string; slug: string; description?: string }) {
    return prisma.category.create({ data })
  },

  findMany() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } })
  },

  findById(id: string) {
    return prisma.category.findUnique({ where: { id } })
  },

  findByNameOrSlug(name: string | undefined, slug: string | undefined, excludeId?: string) {
    return prisma.category.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        OR: [name ? { name } : undefined, slug ? { slug } : undefined].filter(Boolean) as [{ name: string } | { slug: string }],
      },
    })
  },

  update(id: string, data: { name?: string; slug?: string; description?: string | null }) {
    return prisma.category.update({ where: { id }, data })
  },

  delete(id: string) {
    return prisma.category.delete({ where: { id } })
  },
}
