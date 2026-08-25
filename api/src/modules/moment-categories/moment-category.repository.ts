import { prisma } from '../../database/prisma.js'
import type { Prisma } from '@prisma/client'

export type MomentCategoryListFilter = {
  search?: string
  page: number
  limit: number
}

function where(filter: MomentCategoryListFilter): Prisma.MomentCategoryWhereInput {
  return filter.search
    ? {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { slug: { contains: filter.search, mode: 'insensitive' } },
        ],
      }
    : {}
}

export const momentCategoryRepository = {
  create(data: { name: string; slug: string }) {
    return prisma.momentCategory.create({ data, include: { _count: { select: { moments: true } } } })
  },

  async findMany(filter: MomentCategoryListFilter) {
    const categoryWhere = where(filter)
    const [categories, total] = await prisma.$transaction([
      prisma.momentCategory.findMany({
        where: categoryWhere,
        orderBy: { name: 'asc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: { _count: { select: { moments: true } } },
      }),
      prisma.momentCategory.count({ where: categoryWhere }),
    ])
    return { categories, total }
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
