import type { TechnologyType } from '@prisma/client'

export type TechnologyDto = {
  id: string
  name: string
  slug: string
  type: TechnologyType
  description: string | null
  createdAt: string
  updatedAt: string
}
