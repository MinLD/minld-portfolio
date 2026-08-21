import {
  createAdminProjectApi,
  deleteAdminProjectApi,
  deleteProjectThumbnailApi,
  getAdminProjectApi,
  listAdminProjectTagsApi,
  listAdminProjectsApi,
  listAdminTechnologiesApi,
  updateAdminProjectApi,
  uploadProjectThumbnailApi,
} from '@/api/admin-project'

function isoDateTime(value) {
  if (!value) return undefined

  return new Date(value).toISOString()
}

function emptyToUndefined(value) {
  return value === '' ? undefined : value
}

function emptyToNull(value) {
  return value === '' ? null : value
}

function toProjectPayload(payload, isUpdate = false) {
  return {
    title: payload.title,
    summary: payload.summary,
    content: payload.content,
    status: payload.status,
    featured: Boolean(payload.featured),
    year: payload.year,
    publishedAt: isoDateTime(payload.publishedAt),
    demoUrl: isUpdate ? emptyToNull(payload.demoUrl) : emptyToUndefined(payload.demoUrl),
    githubUrl: isUpdate ? emptyToNull(payload.githubUrl) : emptyToUndefined(payload.githubUrl),
    sourceUrl: isUpdate ? emptyToNull(payload.sourceUrl) : emptyToUndefined(payload.sourceUrl),
    thumbnailUrl: isUpdate ? emptyToNull(payload.thumbnailUrl) : emptyToUndefined(payload.thumbnailUrl),
    tagIds: payload.tagIds,
    technologyIds: payload.technologyIds,
  }
}

export async function getProjects(params = {}) {
  const response = await listAdminProjectsApi(params)

  return {
    projects: response.data.projects,
    meta: response.meta,
  }
}

export async function getProject(id) {
  const data = await getAdminProjectApi(id)

  return data.project
}

export async function createProject(payload) {
  const data = await createAdminProjectApi(toProjectPayload(payload))

  return data.project
}

export async function updateProject(id, payload) {
  const data = await updateAdminProjectApi(id, toProjectPayload(payload, true))

  return data.project
}

export async function deleteProject(id) {
  return deleteAdminProjectApi(id)
}

export async function uploadThumbnail(id, file) {
  const data = await uploadProjectThumbnailApi(id, file)

  return data.project
}

export async function deleteThumbnail(id) {
  return deleteProjectThumbnailApi(id)
}

export async function getProjectRelations() {
  const [tagData, technologyData] = await Promise.all([
    listAdminProjectTagsApi(),
    listAdminTechnologiesApi(),
  ])

  return {
    tags: tagData.tags,
    technologies: technologyData.technologies,
  }
}
