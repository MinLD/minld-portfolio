import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createMomentController, deleteMomentController, getMomentController, listMomentsController, updateMomentController } from './moment.controller.js'
import { createMomentSchema, momentIdSchema, updateMomentSchema } from './moment.schema.js'

export const adminMomentRouter = Router()

adminMomentRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminMomentRouter.post('/moments', validateRequest(createMomentSchema), createMomentController)
adminMomentRouter.get('/moments', listMomentsController)
adminMomentRouter.get('/moments/:id', validateRequest(momentIdSchema), getMomentController)
adminMomentRouter.patch('/moments/:id', validateRequest(updateMomentSchema), updateMomentController)
adminMomentRouter.delete('/moments/:id', validateRequest(momentIdSchema), deleteMomentController)
