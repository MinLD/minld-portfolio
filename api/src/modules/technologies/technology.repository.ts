import type { TechnologyType } from '@prisma/client'
import { prisma } from '../../database/prisma.js'

export const technologyRepository = {
  create(data: { name: string; slug: string; type: TechnologyType; description?: string }) {
    return prisma.technology.create({ data })
  },

  findMany(filter?: { type?: TechnologyType }) {
    return prisma.technology.findMany({ where: { type: filter?.type }, orderBy: { name: 'asc' } })
  },

  findById(id: string) {
    return prisma.technology.findUnique({ where: { id } })
  },

  findByNameOrSlug(name: string | undefined, slug: string | undefined, excludeId?: string) {
    return prisma.technology.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        OR: [name ? { name } : undefined, slug ? { slug } : undefined].filter(Boolean) as [{ name: string } | { slug: string }],
      },
    })
  },

  update(id: string, data: { name?: string; slug?: string; type?: TechnologyType; description?: string | null }) {
    return prisma.technology.update({ where: { id }, data })
  },

  delete(id: string) {
    return prisma.technology.delete({ where: { id } })
  },
}
