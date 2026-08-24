import { http } from '@/api/http'

export async function sendContactMessageApi(payload) {
  const response = await http.post('/contact', payload)
  return response.data.data
}
