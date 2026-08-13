import { http } from './http'

export async function getAdminDashboardApi() {
  const response = await http.get('/admin/dashboard')

  return response.data.data
}
    
