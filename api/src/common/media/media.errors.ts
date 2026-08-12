import { AppError } from '../errors/AppError.js'

export const invalidMediaTypeError = new AppError(400, 'INVALID_MEDIA_TYPE', 'Only jpeg, png, and webp images are allowed')
export const mediaTooLargeError = new AppError(413, 'MEDIA_TOO_LARGE', 'Uploaded file is too large')
export const mediaNotConfiguredError = new AppError(500, 'MEDIA_NOT_CONFIGURED', 'Media storage is not configured')
