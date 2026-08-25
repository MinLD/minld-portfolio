import { prisma } from '../../database/prisma.js'
import type { Prisma } from '@prisma/client'

export type MomentCategoryListFilter = {
  search?: string
  usedOnly?: boolean
  publishedOnly?: boolean
  page: number
  limit: number
}

function where(filter: MomentCategoryListFilter): Prisma.MomentCategoryWhereInput {
  return {
    OR: filter.search
      ? [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { slug: { contains: filter.search, mode: 'insensitive' } },
        ]
      : undefined,
    moments: filter.usedOnly ? { some: filter.publishedOnly ? { status: 'PUBLISHED' } : {} } : undefined,
  }
}

function countInclude(filter?: Pick<MomentCategoryListFilter, 'publishedOnly'>) {
  return { _count: { select: { moments: filter?.publishedOnly ? { where: { status: 'PUBLISHED' as const } } : true } } }
}

export const momentCategoryRepository = {
  create(data: { name: string; slug: string }) {
    return prisma.momentCategory.create({ data, include: countInclude() })
  },

  async findMany(filter: MomentCategoryListFilter) {
    const categoryWhere = where(filter)
    const [categories, total] = await prisma.$transaction([
      prisma.momentCategory.findMany({
        where: categoryWhere,
        orderBy: { name: 'asc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: countInclude(filter),
      }),
      prisma.momentCategory.count({ where: categoryWhere }),
    ])
    return { categories, total }
  },

  findById(id: string) {
    return prisma.momentCategory.findUnique({ where: { id }, include: countInclude() })
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
    return prisma.momentCategory.update({ where: { id }, data, include: countInclude() })
  },

  delete(id: string) {
    return prisma.momentCategory.delete({ where: { id } })
  },
}
