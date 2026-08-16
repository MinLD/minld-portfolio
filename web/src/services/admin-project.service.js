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

function appendValue(formData, key, value) {
  if (value === undefined || value === null || value === '') return

  if (Array.isArray(value)) {
    value.forEach((item) => formData.append(key, item))
    return
  }

  formData.append(key, value)
}

function isoDateTime(value) {
  if (!value) return ''

  return new Date(value).toISOString()
}

function toProjectFormData(payload) {
  const formData = new FormData()

  appendValue(formData, 'title', payload.title)
  appendValue(formData, 'summary', payload.summary)
  appendValue(formData, 'content', payload.content)
  appendValue(formData, 'status', payload.status)
  appendValue(formData, 'featured', String(Boolean(payload.featured)))
  appendValue(formData, 'year', payload.year)
  appendValue(formData, 'publishedAt', isoDateTime(payload.publishedAt))
  appendValue(formData, 'demoUrl', payload.demoUrl)
  appendValue(formData, 'githubUrl', payload.githubUrl)
  appendValue(formData, 'sourceUrl', payload.sourceUrl)
  appendValue(formData, 'tagIds', payload.tagIds)
  appendValue(formData, 'technologyIds', payload.technologyIds)
  appendValue(formData, 'thumbnail', payload.thumbnail)

  return formData
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
  const data = await createAdminProjectApi(toProjectFormData(payload))

  return data.project
}

export async function updateProject(id, payload) {
  const data = await updateAdminProjectApi(id, toProjectFormData(payload))

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
