import type { UserRole, UserStatus } from '@prisma/client'

export type AuthContext = {
  userId: string
  sessionId?: string
  role: UserRole
  status: UserStatus
}
