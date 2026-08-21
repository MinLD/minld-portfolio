import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { imageUpload } from '../../common/media/upload.middleware.js'
import { adminUploadRateLimit } from '../../common/rate-limit/upload.rate-limit.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { uploadImageController } from './upload.controller.js'
import { uploadImageSchema } from './upload.schema.js'

export const adminUploadRouter = Router()

adminUploadRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminUploadRouter.post('/uploads/images', adminUploadRateLimit, imageUpload.single('image'), validateRequest(uploadImageSchema), uploadImageController)
