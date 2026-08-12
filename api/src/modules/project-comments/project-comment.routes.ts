import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { projectCommentCreateRateLimit } from '../../common/rate-limit/project-comment.rate-limit.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createProjectCommentController, deleteOwnProjectCommentController, listProjectCommentsController, updateOwnProjectCommentController } from './project-comment.controller.js'
import { createProjectCommentSchema, projectCommentIdSchema, projectCommentSlugSchema, updateProjectCommentSchema } from './project-comment.schema.js'

export const projectCommentRouter = Router()

projectCommentRouter.get('/projects/:slug/comments', validateRequest(projectCommentSlugSchema), listProjectCommentsController)
projectCommentRouter.post('/projects/:slug/comments', projectCommentCreateRateLimit, requireAuth, requireActiveUser, validateRequest(createProjectCommentSchema), createProjectCommentController)
projectCommentRouter.patch('/project-comments/:id', requireAuth, requireActiveUser, validateRequest(updateProjectCommentSchema), updateOwnProjectCommentController)
projectCommentRouter.delete('/project-comments/:id', requireAuth, requireActiveUser, validateRequest(projectCommentIdSchema), deleteOwnProjectCommentController)
