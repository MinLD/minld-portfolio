import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createProjectTagController, deleteProjectTagController, getProjectTagController, listProjectTagsController, updateProjectTagController } from './project-tag.controller.js'
import { createProjectTagSchema, projectTagIdSchema, updateProjectTagSchema } from './project-tag.schema.js'

export const publicProjectTagRouter = Router()
export const adminProjectTagRouter = Router()

publicProjectTagRouter.get('/project-tags', listProjectTagsController)

adminProjectTagRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminProjectTagRouter.post('/project-tags', validateRequest(createProjectTagSchema), createProjectTagController)
adminProjectTagRouter.get('/project-tags', listProjectTagsController)
adminProjectTagRouter.get('/project-tags/:id', validateRequest(projectTagIdSchema), getProjectTagController)
adminProjectTagRouter.patch('/project-tags/:id', validateRequest(updateProjectTagSchema), updateProjectTagController)
adminProjectTagRouter.delete('/project-tags/:id', validateRequest(projectTagIdSchema), deleteProjectTagController)
