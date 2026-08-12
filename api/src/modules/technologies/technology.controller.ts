import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { createTechnology, deleteTechnology, getTechnology, listTechnologies, updateTechnology } from './technology.service.js'

export const createTechnologyController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createTechnology(req.body))
  } catch (error) {
    next(error)
  }
}

export const listTechnologiesController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await listTechnologies(req.query))
  } catch (error) {
    next(error)
  }
}

export const getTechnologyController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getTechnology(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const updateTechnologyController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateTechnology(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteTechnologyController: RequestHandler = async (req, res, next) => {
  try {
    await deleteTechnology(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
