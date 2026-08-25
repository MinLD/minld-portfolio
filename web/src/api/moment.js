import { http } from '@/api/http'

export async function listMomentsApi(params = {}) {
  const response = await http.get('/moments', { params })

  return response.data
}

export async function listMomentTagsApi() {
  const response = await http.get('/moment-tags')

  return response.data.data.tags
}

export async function listMomentCategoriesApi() {
  const response = await http.get('/moment-categories')

  return response.data.data.categories
}
