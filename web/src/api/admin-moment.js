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

const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))

export async function getAdminMomentTagsApi(params = {}) {
  const response = await http.get('/admin/moment-tags', { params: cleanParams(params) })

  return response.data
}

export async function getAdminMomentCategoriesApi(params = {}) {
  const response = await http.get('/admin/moment-categories', { params: cleanParams(params) })

  return response.data
}

export async function createAdminMomentCategoryApi(payload) {
  const response = await http.post('/admin/moment-categories', payload)

  return response.data.data.category
}

export async function updateAdminMomentCategoryApi(id, payload) {
  const response = await http.patch(`/admin/moment-categories/${id}`, payload)

  return response.data.data.category
}

export async function deleteAdminMomentCategoryApi(id) {
  await http.delete(`/admin/moment-categories/${id}`)
}

export async function createAdminMomentTagApi(payload) {
  const response = await http.post('/admin/moment-tags', payload)

  return response.data.data.tag
}

export async function updateAdminMomentTagApi(id, payload) {
  const response = await http.patch(`/admin/moment-tags/${id}`, payload)

  return response.data.data.tag
}

export async function deleteAdminMomentTagApi(id) {
  await http.delete(`/admin/moment-tags/${id}`)
}
