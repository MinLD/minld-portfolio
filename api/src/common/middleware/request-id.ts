import { randomUUID } from 'node:crypto'
import type { RequestHandler } from 'express'

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const requestId = req.header('x-request-id') ?? randomUUID()
  res.locals.requestId = requestId
  res.setHeader('x-request-id', requestId)
  next()
}
