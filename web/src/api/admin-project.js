import { http } from '@/api/http'

export async function listAdminProjectsApi(params = {}) {
  const response = await http.get('/admin/projects', {
    params: params,
  })

  return response.data
}

export async function getAdminProjectApi(id) {
  const response = await http.get(`/admin/projects/${id}`)

  return response.data.data
}

export async function createAdminProjectApi(payload) {
  const response = await http.post('/admin/projects', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}

export async function updateAdminProjectApi(id, payload) {
  const response = await http.patch(`/admin/projects/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}

export async function deleteAdminProjectApi(id) {
  await http.delete(`/admin/projects/${id}`)
}

export async function uploadProjectThumbnailApi(id, file) {
  const formData = new FormData()

  formData.append('thumbnail', file)

  const response = await http.post(`/admin/projects/${id}/thumbnail`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}

export async function deleteProjectThumbnailApi(id) {
  await http.delete(`/admin/projects/${id}/thumbnail`)
}

export async function listAdminProjectTagsApi() {
  const response = await http.get('/admin/project-tags')

  return response.data.data
}

export async function listAdminTechnologiesApi() {
  const response = await http.get('/admin/technologies')

  return response.data.data
}
