import { http } from '@/api/http'

export async function listProjectsApi(params = {}) {
  const response = await http.get('/projects', { params })

  return response.data
}
