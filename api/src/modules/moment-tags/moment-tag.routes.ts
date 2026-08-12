import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createMomentTagController, deleteMomentTagController, getMomentTagController, listMomentTagsController, updateMomentTagController } from './moment-tag.controller.js'
import { createMomentTagSchema, momentTagIdSchema, updateMomentTagSchema } from './moment-tag.schema.js'

export const publicMomentTagRouter = Router()
export const adminMomentTagRouter = Router()

publicMomentTagRouter.get('/moment-tags', listMomentTagsController)

adminMomentTagRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminMomentTagRouter.post('/moment-tags', validateRequest(createMomentTagSchema), createMomentTagController)
adminMomentTagRouter.get('/moment-tags', listMomentTagsController)
adminMomentTagRouter.get('/moment-tags/:id', validateRequest(momentTagIdSchema), getMomentTagController)
adminMomentTagRouter.patch('/moment-tags/:id', validateRequest(updateMomentTagSchema), updateMomentTagController)
adminMomentTagRouter.delete('/moment-tags/:id', validateRequest(momentTagIdSchema), deleteMomentTagController)
