import {
  createAdminMomentApi,
  getAdminMomentApi,
  getAdminMomentTagsApi,
  updateAdminMomentApi,
} from '../api/admin-moment'
export function toFormData(data) {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return
    }

    if (Array.isArray(value) && value.every((item) => item instanceof File)) {
      value.forEach((file) => {
        formData.append(key, file)
      })

      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item)
      })

      return
    }

    if (value instanceof File) {
      formData.append(key, value)
      return
    }

    formData.append(key, value)
  })

  return formData
}
export async function createMoment(payload) {
  const data = await createAdminMomentApi(payload)

  return data.moment
}

export async function getMoment(params) {
  const response = await getAdminMomentApi(params)
  return { moments: response.data.moments, meta: response.meta }
}

export async function updateMoment(id, payload) {
  const response = await updateAdminMomentApi(id, payload)

  return response.moment
}

export async function getMomentRelations() {
  const tags = await getAdminMomentTagsApi()

  return { tags }
}
