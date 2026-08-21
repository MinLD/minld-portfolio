import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { imageUpload } from '../../common/media/upload.middleware.js'
import { adminUploadRateLimit } from '../../common/rate-limit/upload.rate-limit.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createProjectController, deleteProjectController, deleteProjectThumbnailController, getProjectController, getPublishedProjectController, listProjectsController, listPublishedProjectsController, replaceProjectThumbnailController, updateProjectController } from './project.controller.js'
import { createProjectSchema, listProjectsSchema, listPublishedProjectsSchema, projectIdSchema, projectSlugSchema, updateProjectSchema } from './project.schema.js'

export const publicProjectRouter = Router()
export const adminProjectRouter = Router()

publicProjectRouter.get('/projects', validateRequest(listPublishedProjectsSchema), listPublishedProjectsController)
publicProjectRouter.get('/projects/:slug', validateRequest(projectSlugSchema), getPublishedProjectController)

adminProjectRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminProjectRouter.post('/projects', validateRequest(createProjectSchema), createProjectController)
adminProjectRouter.get('/projects', validateRequest(listProjectsSchema), listProjectsController)
adminProjectRouter.post('/projects/:id/thumbnail', adminUploadRateLimit, validateRequest(projectIdSchema), imageUpload.single('thumbnail'), replaceProjectThumbnailController)
adminProjectRouter.delete('/projects/:id/thumbnail', validateRequest(projectIdSchema), deleteProjectThumbnailController)
adminProjectRouter.get('/projects/:id', validateRequest(projectIdSchema), getProjectController)
adminProjectRouter.patch('/projects/:id', validateRequest(updateProjectSchema), updateProjectController)
adminProjectRouter.delete('/projects/:id', validateRequest(projectIdSchema), deleteProjectController)
