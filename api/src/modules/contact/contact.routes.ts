import { Router } from 'express'
import { makeRateLimit } from '../../common/rate-limit/rate-limit.factory.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { createContactMessageController } from './contact.controller.js'
import { createContactMessageSchema } from './contact.schema.js'

export const contactRouter = Router()

contactRouter.post('/contact', makeRateLimit(10), validateRequest(createContactMessageSchema), createContactMessageController)
