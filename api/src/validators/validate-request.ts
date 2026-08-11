import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'

export function validateRequest(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    schema.parse({ body: req.body, params: req.params, query: req.query })
    next()
  }
}
