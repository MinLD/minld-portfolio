import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { createMomentCategory, deleteMomentCategory, getMomentCategory, listMomentCategories, updateMomentCategory } from './moment-category.service.js'

export const createMomentCategoryController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createMomentCategory(req.body))
  } catch (error) {
    next(error)
  }
}

export const listMomentCategoriesController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listMomentCategories())
  } catch (error) {
    next(error)
  }
}

export const getMomentCategoryController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getMomentCategory(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const updateMomentCategoryController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateMomentCategory(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteMomentCategoryController: RequestHandler = async (req, res, next) => {
  try {
    await deleteMomentCategory(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
