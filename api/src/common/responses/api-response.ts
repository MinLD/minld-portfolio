import type { Response } from 'express'

export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data } satisfies ApiSuccess<T>)
}

export function sendCreated<T>(res: Response, data: T) {
  return sendSuccess(res, data, 201)
}

export function sendPaginated<T>(res: Response, data: T, meta: Record<string, unknown>) {
  return res.status(200).json({ success: true, data, meta } satisfies ApiSuccess<T>)
}

export function sendNoContent(res: Response) {
  return res.status(204).send()
}
