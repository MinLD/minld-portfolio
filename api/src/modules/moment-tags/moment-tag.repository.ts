import type { Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma.js'

export type MomentTagListFilter = {
  search?: string
  page: number
  limit: number
}

function where(filter: MomentTagListFilter): Prisma.MomentTagWhereInput {
  return filter.search
    ? {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { slug: { contains: filter.search, mode: 'insensitive' } },
        ],
      }
    : {}
}

export const momentTagRepository = {
  create(data: { name: string; slug: string }) {
    return prisma.momentTag.create({ data, include: { _count: { select: { moments: true } } } })
  },

  async findMany(filter: MomentTagListFilter) {
    const tagWhere = where(filter)
    const [tags, total] = await prisma.$transaction([
      prisma.momentTag.findMany({
        where: tagWhere,
        orderBy: { name: 'asc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: { _count: { select: { moments: true } } },
      }),
      prisma.momentTag.count({ where: tagWhere }),
    ])
    return { tags, total }
  },

  findById(id: string) {
    return prisma.momentTag.findUnique({ where: { id }, include: { _count: { select: { moments: true } } } })
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
    return prisma.momentTag.update({ where: { id }, data, include: { _count: { select: { moments: true } } } })
  },

  delete(id: string) {
    return prisma.momentTag.delete({ where: { id } })
  },
}
