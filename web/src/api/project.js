import { http } from '@/api/http'

export async function listProjectsApi(params = {}) {
  const response = await http.get('/projects', { params })

  return response.data
}

export async function getProjectBySlugApi(slug) {
  const response = await http.get(`/projects/${slug}`)

  return response.data.data.project
}

export async function listProjectCommentsApi(slug) {
  const response = await http.get(`/projects/${slug}/comments`)

  return response.data.data.comments
}

export async function createProjectCommentApi(slug, payload) {
  const response = await http.post(`/projects/${slug}/comments`, payload)

  return response.data.data.comment
}
