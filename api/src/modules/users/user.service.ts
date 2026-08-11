import { AppError } from '../../common/errors/AppError.js'
import { toUserDto } from './user.mapper.js'
import { userRepository } from './user.repository.js'

export async function getOwnProfile(userId: string) {
  const user = await userRepository.findById(userId)
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
  return { user: toUserDto(user) }
}

export async function updateOwnProfile(userId: string, input: { displayName: string }) {
  const user = await userRepository.updateProfile(userId, { displayName: input.displayName.trim() })
  return { user: toUserDto(user) }
}
