import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { getAdminDashboardController } from './admin.controller.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminRouter.get('/dashboard', getAdminDashboardController)
