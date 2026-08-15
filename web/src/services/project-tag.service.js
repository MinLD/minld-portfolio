import { http } from '@/api/http'

export const projectTagService = {
  async getAll() {
    const response = await http.get('/admin/project-tags')

    return response.data.data.tags
  },

  async create(payload) {
    const response = await http.post('/admin/project-tags', payload)

    return response.data.data.tag
  },
}
