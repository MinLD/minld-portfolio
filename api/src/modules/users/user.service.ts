import { AppError } from '../../common/errors/AppError.js'
import { mediaService } from '../../common/media/media.service.js'
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

export async function replaceOwnAvatar(userId: string, file: Express.Multer.File | undefined) {
  if (!file) throw new AppError(400, 'MEDIA_REQUIRED', 'Avatar file is required')
  const user = await userRepository.findById(userId)
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
  const uploaded = await mediaService.uploadImage(file, 'users/avatars')
  try {
    const updated = await userRepository.updateAvatar(userId, { avatarUrl: uploaded.url, avatarPublicId: uploaded.publicId })
    if (user.avatarPublicId) await mediaService.deleteImage(user.avatarPublicId)
    return { user: toUserDto(updated) }
  } catch (error) {
    await mediaService.deleteImage(uploaded.publicId).catch(() => undefined)
    throw error
  }
}

export async function deleteOwnAvatar(userId: string) {
  const user = await userRepository.findById(userId)
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
  await userRepository.updateAvatar(userId, { avatarUrl: null, avatarPublicId: null })
  if (user.avatarPublicId) await mediaService.deleteImage(user.avatarPublicId)
}
