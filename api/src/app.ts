import cookieParser from 'cookie-parser'
import express from 'express'
import { env } from './config/env.js'
import { errorMiddleware, notFoundMiddleware } from './common/middlewares/error.middleware.js'
import { requestIdMiddleware } from './common/middleware/request-id.js'
import { securityMiddleware } from './common/middleware/security.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { healthRouter } from './modules/health/health.routes.js'
import { userRouter } from './modules/users/user.routes.js'

export const app = express()

app.use(requestIdMiddleware)
app.use(securityMiddleware)
app.use(express.json({ limit: env.JSON_BODY_LIMIT }))
app.use(cookieParser())

app.use('/api/v1', healthRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)
