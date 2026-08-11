import type { RequestHandler } from 'express'
import { sendSuccess } from '../../common/responses/api-response.js'
import { getOwnProfile, updateOwnProfile } from './user.service.js'

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
