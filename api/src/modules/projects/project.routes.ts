import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createProjectController, deleteProjectController, getProjectController, listProjectsController, updateProjectController } from './project.controller.js'
import { createProjectSchema, projectIdSchema, updateProjectSchema } from './project.schema.js'

export const adminProjectRouter = Router()

adminProjectRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminProjectRouter.post('/projects', validateRequest(createProjectSchema), createProjectController)
adminProjectRouter.get('/projects', listProjectsController)
adminProjectRouter.get('/projects/:id', validateRequest(projectIdSchema), getProjectController)
adminProjectRouter.patch('/projects/:id', validateRequest(updateProjectSchema), updateProjectController)
adminProjectRouter.delete('/projects/:id', validateRequest(projectIdSchema), deleteProjectController)
