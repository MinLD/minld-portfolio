import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../common/responses/api-response.js'
import type { PublishedProjectFilter } from './project.repository.js'
import { createProject, deleteProject, deleteProjectThumbnail, getProject, getPublishedProject, listProjects, listPublishedProjects, replaceProjectThumbnail, updateProject } from './project.service.js'

export const createProjectController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createProject(req.body, req.file))
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

export const listPublishedProjectsController: RequestHandler = async (req, res, next) => {
  try {
    const { projects, meta } = await listPublishedProjects(req.query as unknown as PublishedProjectFilter)
    sendPaginated(res, { projects }, meta)
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
    sendSuccess(res, await updateProject(String(req.params.id), req.body, req.file))
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

export const replaceProjectThumbnailController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await replaceProjectThumbnail(String(req.params.id), req.file))
  } catch (error) {
    next(error)
  }
}

export const deleteProjectThumbnailController: RequestHandler = async (req, res, next) => {
  try {
    await deleteProjectThumbnail(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
