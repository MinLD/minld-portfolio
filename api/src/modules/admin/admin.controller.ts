import type { RequestHandler } from 'express'
import { sendPaginated, sendSuccess } from '../../common/responses/api-response.js'
import type { AdminUserFilter } from './admin.repository.js'
import { getAdminDashboard, listAdminUsers, updateAdminUserStatus } from './admin.service.js'

export const getAdminDashboardController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await getAdminDashboard())
  } catch (error) {
    next(error)
  }
}

export const listAdminUsersController: RequestHandler = async (req, res, next) => {
  try {
    const { users, meta } = await listAdminUsers(req.query as unknown as AdminUserFilter)
    sendPaginated(res, { users }, meta)
  } catch (error) {
    next(error)
  }
}

export const updateAdminUserStatusController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateAdminUserStatus(String(req.params.id), res.locals.auth.userId, req.body))
  } catch (error) {
    next(error)
  }
}
