import { Router } from 'express'
import { healthController, readyController } from './health.controller.js'

export const healthRouter = Router()

healthRouter.get('/health', healthController)
healthRouter.get('/ready', readyController)
