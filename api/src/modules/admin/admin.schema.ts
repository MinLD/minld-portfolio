import { UserRole, UserStatus } from '@prisma/client'
import { z } from 'zod'

export const adminUserListSchema = z.object({
  query: z.object({
    search: z.string().trim().min(1).optional(),
    role: z.enum(UserRole).optional(),
    status: z.enum(UserStatus).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
})

export const adminUserStatusSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({ status: z.enum(['ACTIVE', 'BANNED']) }),
})
