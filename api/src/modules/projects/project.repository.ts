import type { Prisma, ProjectStatus, TechnologyType } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import type { TxClient } from '../../database/transaction.js'
import { projectInclude } from './project.mapper.js'

const db = (tx?: TxClient) => tx ?? prisma

export type ProjectWriteInput = {
  title?: string
  slug?: string
  summary?: string
  content?: string
  thumbnailUrl?: string | null
  thumbnailPublicId?: string | null
  demoUrl?: string | null
  githubUrl?: string | null
  sourceUrl?: string | null
  status?: ProjectStatus
  featured?: boolean
  year?: number | null
  publishedAt?: Date | null
}

export type PublishedProjectFilter = {
  search?: string
  category?: string
  technology?: string
  technologyType?: TechnologyType
  featured?: boolean
  year?: number
  page: number
  limit: number
}

const connect = (ids: string[]) => ids.map((id) => ({ id }))

function publishedWhere(filter: PublishedProjectFilter): Prisma.ProjectWhereInput {
  return {
    status: 'PUBLISHED',
    featured: filter.featured,
    year: filter.year,
    OR: filter.search ? [{ title: { contains: filter.search, mode: 'insensitive' } }, { summary: { contains: filter.search, mode: 'insensitive' } }, { content: { contains: filter.search, mode: 'insensitive' } }] : undefined,
    categories: filter.category ? { some: { slug: filter.category } } : undefined,
    technologies: filter.technology || filter.technologyType ? { some: { slug: filter.technology, type: filter.technologyType } } : undefined,
  }
}

export const projectRepository = {
  create(data: ProjectWriteInput & { title: string; slug: string; summary: string; content: string; categoryIds: string[]; technologyIds: string[] }, tx?: TxClient) {
    return db(tx).project.create({
      data: {
        ...data,
        categoryIds: undefined,
        technologyIds: undefined,
        categories: { connect: connect(data.categoryIds) },
        technologies: { connect: connect(data.technologyIds) },
      },
      include: projectInclude,
    })
  },

  findMany() {
    return prisma.project.findMany({ orderBy: { createdAt: 'desc' }, include: projectInclude })
  },

  async findPublished(filter: PublishedProjectFilter) {
    const where = publishedWhere(filter)
    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({ where, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], skip: (filter.page - 1) * filter.limit, take: filter.limit, include: projectInclude }),
      prisma.project.count({ where }),
    ])
    return { projects, total }
  },

  findById(id: string, tx?: TxClient) {
    return db(tx).project.findUnique({ where: { id }, include: projectInclude })
  },

  findBySlug(slug: string, excludeId?: string) {
    return prisma.project.findFirst({ where: { slug, id: excludeId ? { not: excludeId } : undefined } })
  },

  findPublishedBySlug(slug: string) {
    return prisma.project.findFirst({ where: { slug, status: 'PUBLISHED' }, include: projectInclude })
  },

  countCategories(ids: string[], tx?: TxClient) {
    return ids.length ? db(tx).category.count({ where: { id: { in: ids } } }) : 0
  },

  countTechnologies(ids: string[], tx?: TxClient) {
    return ids.length ? db(tx).technology.count({ where: { id: { in: ids } } }) : 0
  },

  update(id: string, data: ProjectWriteInput & { categoryIds?: string[]; technologyIds?: string[] }, tx?: TxClient) {
    const updateData: Prisma.ProjectUpdateInput = {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      thumbnailUrl: data.thumbnailUrl,
      thumbnailPublicId: data.thumbnailPublicId,
      demoUrl: data.demoUrl,
      githubUrl: data.githubUrl,
      sourceUrl: data.sourceUrl,
      status: data.status,
      featured: data.featured,
      year: data.year,
      publishedAt: data.publishedAt,
      categories: data.categoryIds ? { set: connect(data.categoryIds) } : undefined,
      technologies: data.technologyIds ? { set: connect(data.technologyIds) } : undefined,
    }
    return db(tx).project.update({ where: { id }, data: updateData, include: projectInclude })
  },

  updateThumbnail(id: string, data: { thumbnailUrl: string | null; thumbnailPublicId: string | null }) {
    return prisma.project.update({ where: { id }, data, include: projectInclude })
  },

  delete(id: string) {
    return prisma.project.delete({ where: { id } })
  },
}
