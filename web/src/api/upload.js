import { http } from '@/api/http'

export async function uploadImageApi(file, folder = 'uploads') {
  const formData = new FormData()

  formData.append('image', file)
  formData.append('folder', folder)

  const response = await http.post('/admin/uploads/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data.data.image
}
