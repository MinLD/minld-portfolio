import type { RequestHandler } from 'express'
import { sendSuccess } from '../../common/responses/api-response.js'
import { getHealth, getReady } from './health.service.js'

export const healthController: RequestHandler = (_req, res) => {
  sendSuccess(res, getHealth())
}

export const readyController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await getReady())
  } catch (error) {
    next(error)
  }
}
