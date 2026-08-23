import { http } from '@/api/http'

export async function listMomentsApi() {
  const response = await http.get('/moments')

  return response.data.data.moments
}

export async function listMomentTagsApi() {
  const response = await http.get('/moment-tags')

  return response.data.data.tags
}
