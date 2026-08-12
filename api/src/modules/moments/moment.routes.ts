import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { imageUpload } from '../../common/media/upload.middleware.js'
import { adminUploadRateLimit } from '../../common/rate-limit/upload.rate-limit.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { addMomentImagesController, createMomentController, deleteMomentController, deleteMomentImageController, getMomentController, listMomentsController, reorderMomentImagesController, updateMomentController } from './moment.controller.js'
import { createMomentSchema, momentIdSchema, momentImageIdSchema, reorderMomentImagesSchema, updateMomentSchema } from './moment.schema.js'

export const adminMomentRouter = Router()

adminMomentRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminMomentRouter.post('/moments', validateRequest(createMomentSchema), createMomentController)
adminMomentRouter.get('/moments', listMomentsController)
adminMomentRouter.post('/moments/:id/images', adminUploadRateLimit, validateRequest(momentIdSchema), imageUpload.array('images', 10), addMomentImagesController)
adminMomentRouter.patch('/moments/:id/images/reorder', validateRequest(reorderMomentImagesSchema), reorderMomentImagesController)
adminMomentRouter.delete('/moment-images/:id', validateRequest(momentImageIdSchema), deleteMomentImageController)
adminMomentRouter.get('/moments/:id', validateRequest(momentIdSchema), getMomentController)
adminMomentRouter.patch('/moments/:id', validateRequest(updateMomentSchema), updateMomentController)
adminMomentRouter.delete('/moments/:id', validateRequest(momentIdSchema), deleteMomentController)
