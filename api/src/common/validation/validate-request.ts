import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'

export function validateRequest(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.parse({ body: req.body, params: req.params, query: req.query }) as {
      body?: unknown
      params?: unknown
      query?: unknown
    }

    if (parsed.body !== undefined) req.body = parsed.body
    if (parsed.params !== undefined) req.params = parsed.params as typeof req.params
    if (parsed.query !== undefined) req.query = parsed.query as typeof req.query
    next()
  }
}
