import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { getOwnProfileController, updateOwnProfileController } from './user.controller.js'
import { updateProfileSchema } from './user.schema.js'

export const userRouter = Router()

userRouter.get('/me', requireAuth, getOwnProfileController)
userRouter.patch('/me', requireAuth, requireActiveUser, validateRequest(updateProfileSchema), updateOwnProfileController)
