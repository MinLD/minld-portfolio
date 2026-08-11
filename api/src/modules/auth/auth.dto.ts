import type { UserRole, UserStatus } from '@prisma/client'

export type UserDto = {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: UserRole
  status: UserStatus
  emailVerified: boolean
}

export type AuthDto = { user: UserDto; accessToken: string }

export type SessionDto = {
  id: string
  createdAt: string
  expiresAt: string
  userAgent: string | null
  ipAddress: string | null
  isCurrent: boolean
}
