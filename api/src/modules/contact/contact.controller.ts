import type { RequestHandler } from 'express'
import { sendCreated } from '../../common/responses/api-response.js'
import { createContactMessage } from './contact.service.js'

export const createContactMessageController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createContactMessage(req.body))
  } catch (error) {
    next(error)
  }
}
