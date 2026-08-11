import { Router } from 'express'
import { requireAuth } from '../../common/middleware/authenticate.js'
import { requireActiveUser } from '../../common/middleware/require-active-user.js'
import { requireTrustedOrigin } from '../../common/middleware/trusted-origin.js'
import { forgotPasswordRateLimit, loginRateLimit, refreshRateLimit, registerRateLimit, resendVerificationRateLimit, resetPasswordRateLimit, verifyEmailRateLimit } from '../../common/rate-limit/auth.rate-limit.js'
import { validateRequest } from '../../common/validation/validate-request.js'
import { changePasswordController, forgotPasswordController, loginController, logoutAllController, logoutController, meController, refreshController, registerController, resendVerificationController, resetPasswordController, revokeSessionController, sessionsController, verifyEmailController } from './auth.controller.js'
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resendVerificationSchema, resetPasswordSchema, revokeSessionSchema, verifyEmailSchema } from './auth.schema.js'

export const authRouter = Router()

authRouter.post('/register', registerRateLimit, validateRequest(registerSchema), registerController)
authRouter.post('/verify-email', verifyEmailRateLimit, validateRequest(verifyEmailSchema), verifyEmailController)
authRouter.post('/resend-verification', resendVerificationRateLimit, validateRequest(resendVerificationSchema), resendVerificationController)
authRouter.post('/login', loginRateLimit, validateRequest(loginSchema), loginController)
authRouter.post('/refresh', refreshRateLimit, requireTrustedOrigin, refreshController)
authRouter.post('/logout', requireTrustedOrigin, logoutController)
authRouter.post('/forgot-password', forgotPasswordRateLimit, validateRequest(forgotPasswordSchema), forgotPasswordController)
authRouter.post('/reset-password', resetPasswordRateLimit, validateRequest(resetPasswordSchema), resetPasswordController)
authRouter.post('/change-password', requireAuth, requireActiveUser, validateRequest(changePasswordSchema), changePasswordController)
authRouter.get('/me', requireAuth, meController)
authRouter.get('/sessions', requireAuth, sessionsController)
authRouter.delete('/sessions/:sessionId', requireAuth, requireTrustedOrigin, validateRequest(revokeSessionSchema), revokeSessionController)
authRouter.post('/logout-all', requireAuth, requireTrustedOrigin, logoutAllController)
