import { http } from '@/api/http'

export async function listProjectTagsApi() {
  const response = await http.get('/project-tags')

  return response.data.data.tags
}
