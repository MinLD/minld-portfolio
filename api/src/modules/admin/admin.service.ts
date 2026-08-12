import { adminRepository } from './admin.repository.js'

export async function getAdminDashboard() {
  return { dashboard: await adminRepository.dashboardCounts() }
}
