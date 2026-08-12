import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createTechnologyController, deleteTechnologyController, getTechnologyController, listTechnologiesController, updateTechnologyController } from './technology.controller.js'
import { createTechnologySchema, listTechnologiesSchema, technologyIdSchema, updateTechnologySchema } from './technology.schema.js'

export const publicTechnologyRouter = Router()
export const adminTechnologyRouter = Router()

publicTechnologyRouter.get('/technologies', validateRequest(listTechnologiesSchema), listTechnologiesController)

adminTechnologyRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminTechnologyRouter.post('/technologies', validateRequest(createTechnologySchema), createTechnologyController)
adminTechnologyRouter.get('/technologies', validateRequest(listTechnologiesSchema), listTechnologiesController)
adminTechnologyRouter.get('/technologies/:id', validateRequest(technologyIdSchema), getTechnologyController)
adminTechnologyRouter.patch('/technologies/:id', validateRequest(updateTechnologySchema), updateTechnologyController)
adminTechnologyRouter.delete('/technologies/:id', validateRequest(technologyIdSchema), deleteTechnologyController)
