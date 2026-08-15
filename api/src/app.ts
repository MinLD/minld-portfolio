import cookieParser from 'cookie-parser'
import express from 'express'
import { env } from './config/env.js'
import { errorMiddleware, notFoundMiddleware } from './common/middlewares/error.middleware.js'
import { requestIdMiddleware } from './common/middleware/request-id.js'
import { securityMiddleware } from './common/middleware/security.js'
import { requireTrustedOriginForUnsafeMethods } from './common/middleware/trusted-origin.js'
import { adminRouter } from './modules/admin/admin.routes.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { adminCategoryRouter, publicCategoryRouter } from './modules/categories/category.routes.js'
import { healthRouter } from './modules/health/health.routes.js'
import { adminMomentTagRouter, publicMomentTagRouter } from './modules/moment-tags/moment-tag.routes.js'
import { adminMomentRouter, publicMomentRouter } from './modules/moments/moment.routes.js'
import { adminProjectCommentRouter, projectCommentRouter } from './modules/project-comments/project-comment.routes.js'
import { adminProjectTagRouter, publicProjectTagRouter } from './modules/project-tags/project-tag.routes.js'
import { adminProjectRouter, publicProjectRouter } from './modules/projects/project.routes.js'
import { adminTechnologyRouter, publicTechnologyRouter } from './modules/technologies/technology.routes.js'
import { userRouter } from './modules/users/user.routes.js'

export const app = express()

app.use(requestIdMiddleware)
app.use(securityMiddleware)
app.use(express.json({ limit: env.JSON_BODY_LIMIT }))
app.use(cookieParser())
app.use(requireTrustedOriginForUnsafeMethods)

app.use('/api/v1', healthRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1', publicCategoryRouter)
app.use('/api/v1', publicProjectTagRouter)
app.use('/api/v1', publicTechnologyRouter)
app.use('/api/v1', publicProjectRouter)
app.use('/api/v1', publicMomentTagRouter)
app.use('/api/v1', publicMomentRouter)
app.use('/api/v1', projectCommentRouter)
app.use('/api/v1/admin', adminCategoryRouter)
app.use('/api/v1/admin', adminProjectTagRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/admin', adminTechnologyRouter)
app.use('/api/v1/admin', adminProjectRouter)
app.use('/api/v1/admin', adminProjectCommentRouter)
app.use('/api/v1/admin', adminMomentTagRouter)
app.use('/api/v1/admin', adminMomentRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)
