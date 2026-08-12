import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { createMoment, deleteMoment, getMoment, listMoments, updateMoment } from './moment.service.js'

export const createMomentController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createMoment(req.body))
  } catch (error) {
    next(error)
  }
}

export const listMomentsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listMoments())
  } catch (error) {
    next(error)
  }
}

export const getMomentController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getMoment(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const updateMomentController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateMoment(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteMomentController: RequestHandler = async (req, res, next) => {
  try {
    await deleteMoment(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
