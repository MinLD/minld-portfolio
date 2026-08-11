import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js'
import { healthRouter } from './routes/health.routes.js'

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }))
app.use(express.json())

app.use(healthRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)
