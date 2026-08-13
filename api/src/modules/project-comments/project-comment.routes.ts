import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { projectCommentCreateRateLimit } from '../../common/rate-limit/project-comment.rate-limit.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createProjectCommentController, deleteAdminProjectCommentController, deleteOwnProjectCommentController, listAdminProjectCommentsController, listProjectCommentsController, updateOwnProjectCommentController, updateProjectCommentStatusController } from './project-comment.controller.js'
import { createProjectCommentSchema, projectCommentIdSchema, projectCommentSlugSchema, updateProjectCommentSchema, updateProjectCommentStatusSchema } from './project-comment.schema.js'

export const projectCommentRouter = Router()
export const adminProjectCommentRouter = Router()

projectCommentRouter.get('/projects/:slug/comments', validateRequest(projectCommentSlugSchema), listProjectCommentsController)
projectCommentRouter.post('/projects/:slug/comments', projectCommentCreateRateLimit, validateRequest(createProjectCommentSchema), createProjectCommentController)
projectCommentRouter.patch('/project-comments/:id', requireAuth, requireActiveUser, validateRequest(updateProjectCommentSchema), updateOwnProjectCommentController)
projectCommentRouter.delete('/project-comments/:id', requireAuth, requireActiveUser, validateRequest(projectCommentIdSchema), deleteOwnProjectCommentController)

adminProjectCommentRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminProjectCommentRouter.get('/project-comments', listAdminProjectCommentsController)
adminProjectCommentRouter.patch('/project-comments/:id/status', validateRequest(updateProjectCommentStatusSchema), updateProjectCommentStatusController)
adminProjectCommentRouter.delete('/project-comments/:id', validateRequest(projectCommentIdSchema), deleteAdminProjectCommentController)
