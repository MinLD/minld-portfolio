import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { createCategory, deleteCategory, getCategory, listCategories, updateCategory } from './category.service.js'

export const createCategoryController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createCategory(req.body))
  } catch (error) {
    next(error)
  }
}

export const listCategoriesController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listCategories())
  } catch (error) {
    next(error)
  }
}

export const getCategoryController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getCategory(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const updateCategoryController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateCategory(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteCategoryController: RequestHandler = async (req, res, next) => {
  try {
    await deleteCategory(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
