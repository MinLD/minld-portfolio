import type { RequestHandler } from 'express'
import { sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { deleteOwnAvatar, getOwnProfile, replaceOwnAvatar, updateOwnProfile } from './user.service.js'

export const getOwnProfileController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await getOwnProfile(res.locals.auth.userId))
  } catch (error) {
    next(error)
  }
}

export const updateOwnProfileController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateOwnProfile(res.locals.auth.userId, req.body))
  } catch (error) {
    next(error)
  }
}

export const replaceOwnAvatarController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await replaceOwnAvatar(res.locals.auth.userId, req.file))
  } catch (error) {
    next(error)
  }
}

export const deleteOwnAvatarController: RequestHandler = async (_req, res, next) => {
  try {
    await deleteOwnAvatar(res.locals.auth.userId)
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
