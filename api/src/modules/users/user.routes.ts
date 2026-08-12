import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { imageUpload } from '../../common/media/upload.middleware.js'
import { userUploadRateLimit } from '../../common/rate-limit/upload.rate-limit.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { deleteOwnAvatarController, getOwnProfileController, replaceOwnAvatarController, updateOwnProfileController } from './user.controller.js'
import { updateProfileSchema } from './user.schema.js'

export const userRouter = Router()

userRouter.get('/me', requireAuth, getOwnProfileController)
userRouter.patch('/me', requireAuth, requireActiveUser, validateRequest(updateProfileSchema), updateOwnProfileController)
userRouter.post('/me/avatar', userUploadRateLimit, requireAuth, requireActiveUser, imageUpload.single('avatar'), replaceOwnAvatarController)
userRouter.delete('/me/avatar', requireAuth, requireActiveUser, deleteOwnAvatarController)
