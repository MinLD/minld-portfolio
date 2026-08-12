import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { addMomentImages, createMoment, createMomentComment, deleteAdminMomentComment, deleteMoment, deleteMomentImage, deleteOwnMomentComment, getMoment, getPublishedMoment, listAdminMomentComments, listMomentComments, listMoments, listPublishedMoments, reorderMomentImages, toggleMomentLike, updateMoment, updateMomentCommentStatus, updateOwnMomentComment } from './moment.service.js'

export const createMomentController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createMoment(req.body))
  } catch (error) {
    next(error)
  }
}

export const listMomentsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listMoments())
  } catch (error) {
    next(error)
  }
}

export const getMomentController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getMoment(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const listPublishedMomentsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listPublishedMoments())
  } catch (error) {
    next(error)
  }
}

export const getPublishedMomentController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getPublishedMoment(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const toggleMomentLikeController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await toggleMomentLike(String(req.params.id), res.locals.auth.userId))
  } catch (error) {
    next(error)
  }
}

export const listMomentCommentsController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await listMomentComments(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const createMomentCommentController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createMomentComment(String(req.params.id), res.locals.auth.userId, req.body))
  } catch (error) {
    next(error)
  }
}

export const updateOwnMomentCommentController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateOwnMomentComment(String(req.params.id), res.locals.auth.userId, req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteOwnMomentCommentController: RequestHandler = async (req, res, next) => {
  try {
    await deleteOwnMomentComment(String(req.params.id), res.locals.auth.userId)
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}

export const listAdminMomentCommentsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listAdminMomentComments())
  } catch (error) {
    next(error)
  }
}

export const updateMomentCommentStatusController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateMomentCommentStatus(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteAdminMomentCommentController: RequestHandler = async (req, res, next) => {
  try {
    await deleteAdminMomentComment(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}

export const updateMomentController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateMoment(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteMomentController: RequestHandler = async (req, res, next) => {
  try {
    await deleteMoment(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}

export const addMomentImagesController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await addMomentImages(String(req.params.id), req.files as Express.Multer.File[] | undefined))
  } catch (error) {
    next(error)
  }
}

export const reorderMomentImagesController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await reorderMomentImages(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteMomentImageController: RequestHandler = async (req, res, next) => {
  try {
    await deleteMomentImage(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
