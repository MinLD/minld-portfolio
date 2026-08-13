import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireRole } from '../../common/middleware/authorize.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { imageUpload } from '../../common/media/upload.middleware.js'
import { momentCommentCreateRateLimit, momentLikeRateLimit } from '../../common/rate-limit/moment.rate-limit.js'
import { adminUploadRateLimit } from '../../common/rate-limit/upload.rate-limit.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { addMomentImagesController, createMomentCommentController, createMomentController, deleteAdminMomentCommentController, deleteMomentController, deleteMomentImageController, deleteOwnMomentCommentController, getMomentController, getPublishedMomentController, listAdminMomentCommentsController, listMomentCommentsController, listMomentsController, listPublishedMomentsController, reorderMomentImagesController, toggleMomentLikeController, updateMomentCommentStatusController, updateMomentController, updateOwnMomentCommentController } from './moment.controller.js'
import { createMomentCommentSchema, createMomentSchema, momentCommentIdSchema, momentIdSchema, momentImageIdSchema, reorderMomentImagesSchema, updateMomentCommentSchema, updateMomentCommentStatusSchema, updateMomentSchema } from './moment.schema.js'

export const adminMomentRouter = Router()
export const publicMomentRouter = Router()

publicMomentRouter.get('/moments', listPublishedMomentsController)
publicMomentRouter.post('/moments/:id/like', momentLikeRateLimit, requireAuth, requireActiveUser, validateRequest(momentIdSchema), toggleMomentLikeController)
publicMomentRouter.get('/moments/:id/comments', validateRequest(momentIdSchema), listMomentCommentsController)
publicMomentRouter.post('/moments/:id/comments', momentCommentCreateRateLimit, validateRequest(createMomentCommentSchema), createMomentCommentController)
publicMomentRouter.patch('/moment-comments/:id', requireAuth, requireActiveUser, validateRequest(updateMomentCommentSchema), updateOwnMomentCommentController)
publicMomentRouter.delete('/moment-comments/:id', requireAuth, requireActiveUser, validateRequest(momentCommentIdSchema), deleteOwnMomentCommentController)
publicMomentRouter.get('/moments/:id', validateRequest(momentIdSchema), getPublishedMomentController)

adminMomentRouter.use(requireAuth, requireActiveUser, requireRole('ADMIN'))
adminMomentRouter.post('/moments', validateRequest(createMomentSchema), createMomentController)
adminMomentRouter.get('/moments', listMomentsController)
adminMomentRouter.get('/moment-comments', listAdminMomentCommentsController)
adminMomentRouter.patch('/moment-comments/:id/status', validateRequest(updateMomentCommentStatusSchema), updateMomentCommentStatusController)
adminMomentRouter.delete('/moment-comments/:id', validateRequest(momentCommentIdSchema), deleteAdminMomentCommentController)
adminMomentRouter.post('/moments/:id/images', adminUploadRateLimit, validateRequest(momentIdSchema), imageUpload.array('images', 10), addMomentImagesController)
adminMomentRouter.patch('/moments/:id/images/reorder', validateRequest(reorderMomentImagesSchema), reorderMomentImagesController)
adminMomentRouter.delete('/moment-images/:id', validateRequest(momentImageIdSchema), deleteMomentImageController)
adminMomentRouter.get('/moments/:id', validateRequest(momentIdSchema), getMomentController)
adminMomentRouter.patch('/moments/:id', validateRequest(updateMomentSchema), updateMomentController)
adminMomentRouter.delete('/moments/:id', validateRequest(momentIdSchema), deleteMomentController)
