import type { RequestHandler } from 'express'
import { sendCreated, sendSuccess } from '../../common/responses/api-response.js'
import { createProjectComment, listProjectComments } from './project-comment.service.js'

export const listProjectCommentsController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await listProjectComments(String(req.params.slug)))
  } catch (error) {
    next(error)
  }
}

export const createProjectCommentController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createProjectComment(String(req.params.slug), res.locals.auth.userId, req.body))
  } catch (error) {
    next(error)
  }
}
