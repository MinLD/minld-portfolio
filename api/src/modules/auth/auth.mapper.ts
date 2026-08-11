import type { AuthSession, User } from '@prisma/client'
import type { SessionDto, UserDto } from './auth.dto.js'

export function toUserDto(user: Pick<User, 'id' | 'email' | 'displayName' | 'avatarUrl' | 'role' | 'status' | 'emailVerifiedAt'>): UserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerified: Boolean(user.emailVerifiedAt),
  }
}

export function toSessionDto(session: AuthSession, currentSessionId: string | undefined): SessionDto {
  return {
    id: session.id,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    isCurrent: session.id === currentSessionId,
  }
}
