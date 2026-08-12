import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { getAdminDashboardController, listAdminUsersController, updateAdminUserStatusController } from './admin.controller.js'
import { adminUserListSchema, adminUserStatusSchema } from './admin.schema.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminRouter.get('/dashboard', getAdminDashboardController)
adminRouter.get('/users', validateRequest(adminUserListSchema), listAdminUsersController)
adminRouter.patch('/users/:id/status', validateRequest(adminUserStatusSchema), updateAdminUserStatusController)
