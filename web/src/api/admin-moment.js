import { http } from './http'

export async function createAdminMomentApi(payload) {
  const response = await http.post('/admin/moments', payload)

  return response.data.data
}
export async function getAdminMomentApi(params) {
  const response = await http.get('/admin/moments', {
    params,
  })
  return response.data
}
export async function updateAdminMomentApi(id, payload) {
  const response = await http.patch(`/admin/moments/${id}`, payload)

  return response.data.data
}

export async function deleteAdminMomentApi(id) {
  await http.delete(`/admin/moments/${id}`)
}

export async function getAdminMomentTagsApi() {
  const response = await http.get('/admin/moment-tags')

  return response.data.data.tags
}

export async function getAdminMomentCategoriesApi() {
  const response = await http.get('/admin/moment-categories')

  return response.data.data.categories
}
