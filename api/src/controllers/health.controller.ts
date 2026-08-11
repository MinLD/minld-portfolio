import type { Request, Response } from 'express'
import { getHealth } from '../services/health.service.js'
import { httpStatus } from '../utils/http-status.js'

export function healthController(_req: Request, res: Response) {
  res.status(httpStatus.ok).json(getHealth())
}
