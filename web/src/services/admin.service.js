import { getAdminDashboardApi } from '@/api/admin'

export async function getDashboard() {
  return getAdminDashboardApi()
}
