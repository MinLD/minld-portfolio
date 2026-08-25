import type { RequestHandler } from 'express'
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../common/responses/api-response.js'
import { createMomentTag, deleteMomentTag, getMomentTag, listMomentTags, updateMomentTag } from './moment-tag.service.js'

export const createMomentTagController: RequestHandler = async (req, res, next) => {
  try {
    sendCreated(res, await createMomentTag(req.body))
  } catch (error) {
    next(error)
  }
}

export const listMomentTagsController: RequestHandler = async (req, res, next) => {
  try {
    const { tags, meta } = await listMomentTags(req.query as unknown as { search?: string; page: number; limit: number })
    sendPaginated(res, { tags }, meta)
  } catch (error) {
    next(error)
  }
}

export const listPublicMomentTagsController: RequestHandler = async (req, res, next) => {
  try {
    const { tags, meta } = await listMomentTags({ ...(req.query as unknown as { search?: string; page: number; limit: number }), usedOnly: true, publishedOnly: true })
    sendPaginated(res, { tags }, meta)
  } catch (error) {
    next(error)
  }
}

export const getMomentTagController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getMomentTag(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export const updateMomentTagController: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await updateMomentTag(String(req.params.id), req.body))
  } catch (error) {
    next(error)
  }
}

export const deleteMomentTagController: RequestHandler = async (req, res, next) => {
  try {
    await deleteMomentTag(String(req.params.id))
    sendNoContent(res)
  } catch (error) {
    next(error)
  }
}
