import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { categoryIdSchema, createCategorySchema, updateCategorySchema } from './category.schema.js'
import { createCategoryController, deleteCategoryController, getCategoryController, listCategoriesController, updateCategoryController } from './category.controller.js'

export const publicCategoryRouter = Router()
export const adminCategoryRouter = Router()

publicCategoryRouter.get('/categories', listCategoriesController)

adminCategoryRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminCategoryRouter.post('/categories', validateRequest(createCategorySchema), createCategoryController)
adminCategoryRouter.get('/categories', listCategoriesController)
adminCategoryRouter.get('/categories/:id', validateRequest(categoryIdSchema), getCategoryController)
adminCategoryRouter.patch('/categories/:id', validateRequest(updateCategorySchema), updateCategoryController)
adminCategoryRouter.delete('/categories/:id', validateRequest(categoryIdSchema), deleteCategoryController)
