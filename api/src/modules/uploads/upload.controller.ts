import type { RequestHandler } from 'express'
import { AppError } from '../../common/errors/AppError.js'
import { mediaService } from '../../common/media/media.service.js'
import { sendCreated } from '../../common/responses/api-response.js'

export const uploadImageController: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'MEDIA_REQUIRED', 'Image file is required')

    const image = await mediaService.uploadImage(req.file, req.body.folder)

    sendCreated(res, { image })
  } catch (error) {
    next(error)
  }
}
