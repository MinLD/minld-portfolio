import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { createProjectTag, deleteProjectTag, getProjectTag, listProjectTags, updateProjectTag } from './project-tag.service.js'

export const createProjectTagController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createProjectTag(req.body))
  } catch (error) {
    next(error)
  }
}

export const listProjectTagsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listProjectTags())
  } catch (error) {
    next(error)
  }
}

export const getProjectTagController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getProjectTag(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const updateProjectTagController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateProjectTag(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteProjectTagController: RequestHandler = async (req, res, next) => {
  try {
    await deleteProjectTag(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
