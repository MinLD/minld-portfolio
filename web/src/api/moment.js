import { http } from '@/api/http'

export async function listMomentsApi(params = {}) {
  const response = await http.get('/moments', { params })

  return response.data
}

export async function listMomentTagsApi() {
  const response = await http.get('/moment-tags')

  return response.data.data.tags
}
