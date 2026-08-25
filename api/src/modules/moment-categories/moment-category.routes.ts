import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createMomentCategoryController, deleteMomentCategoryController, getMomentCategoryController, listMomentCategoriesController, listPublicMomentCategoriesController, updateMomentCategoryController } from './moment-category.controller.js'
import { createMomentCategorySchema, listMomentCategoriesSchema, momentCategoryIdSchema, updateMomentCategorySchema } from './moment-category.schema.js'

export const publicMomentCategoryRouter = Router()
export const adminMomentCategoryRouter = Router()

publicMomentCategoryRouter.get('/moment-categories', validateRequest(listMomentCategoriesSchema), listPublicMomentCategoriesController)

adminMomentCategoryRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminMomentCategoryRouter.post('/moment-categories', validateRequest(createMomentCategorySchema), createMomentCategoryController)
adminMomentCategoryRouter.get('/moment-categories', validateRequest(listMomentCategoriesSchema), listMomentCategoriesController)
adminMomentCategoryRouter.get('/moment-categories/:id', validateRequest(momentCategoryIdSchema), getMomentCategoryController)
adminMomentCategoryRouter.patch('/moment-categories/:id', validateRequest(updateMomentCategorySchema), updateMomentCategoryController)
adminMomentCategoryRouter.delete('/moment-categories/:id', validateRequest(momentCategoryIdSchema), deleteMomentCategoryController)
