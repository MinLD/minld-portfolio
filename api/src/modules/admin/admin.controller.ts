import type { RequestHandler } from 'express'
import { sendSuccess } from '../../common/responses/api-response.js'
import { getAdminDashboard } from './admin.service.js'

export const getAdminDashboardController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await getAdminDashboard())
  } catch (error) {
    next(error)
  }
}
