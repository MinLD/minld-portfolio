import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendSuccess } from '../../common/responses/api-response.js'
import { createProject, deleteProject, getProject, getPublishedProject, listProjects, listPublishedProjects, updateProject } from './project.service.js'

export const createProjectController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createProject(req.body))
  } catch (error) {
    next(error)
  }
}

export const listProjectsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listProjects())
  } catch (error) {
    next(error)
  }
}

export const getProjectController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getProject(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const listPublishedProjectsController: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, await listPublishedProjects())
  } catch (error) {
    next(error)
  }
}

export const getPublishedProjectController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getPublishedProject(String(req.params.slug)))
  } catch (error) {
    next(error)
  }
}

export const updateProjectController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateProject(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteProjectController: RequestHandler = async (req, res, next) => {
  try {
    await deleteProject(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
