import { http } from '@/api/http'

export const technologyService = {
  async getAll() {
    const response = await http.get('/admin/technologies')

    return response.data.data.technologies
  },

  async create(payload) {
    const response = await http.post('/admin/technologies', payload)

    return response.data.data.technology
  },
}
