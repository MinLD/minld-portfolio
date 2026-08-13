import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { createProjectComment, deleteAdminProjectComment, deleteOwnProjectComment, listAdminProjectComments, listProjectComments, updateOwnProjectComment, updateProjectCommentStatus } from './project-comment.service.js'

export const listProjectCommentsController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await listProjectComments(String(req.params.slug)))
  } catch (error) {
    next(error)
  }
}

export const createProjectCommentController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createProjectComment(String(req.params.slug), req.body))
  } catch (error) {
    next(error)
  }
}

export const updateOwnProjectCommentController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateOwnProjectComment(String(req.params.id), res.locals.auth.userId, req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteOwnProjectCommentController: RequestHandler = async (req, res, next) => {
  try {
    await deleteOwnProjectComment(String(req.params.id), res.locals.auth.userId)
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}

export const listAdminProjectCommentsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listAdminProjectComments())
  } catch (error) {
    next(error)
  }
}

export const updateProjectCommentStatusController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateProjectCommentStatus(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteAdminProjectCommentController: RequestHandler = async (req, res, next) => {
  try {
    await deleteAdminProjectComment(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
