import { AppError } from '../../common/errors/AppError.js'
import { toUserDto } from '../auth/auth.mapper.js'
import { adminRepository } from './admin.repository.js'
import type { AdminUserFilter } from './admin.repository.js'

export async function getAdminDashboard() {
  return { dashboard: await adminRepository.dashboardCounts() }
}

export async function listAdminUsers(filter: AdminUserFilter) {
  const { users, total } = await adminRepository.listUsers(filter)
  return { users: users.map(toUserDto), meta: { page: filter.page, limit: filter.limit, total, totalPages: Math.ceil(total / filter.limit) } }
}

export async function updateAdminUserStatus(id: string, currentAdminId: string, input: { status: 'ACTIVE' | 'BANNED' }) {
  const user = await adminRepository.findUser(id)
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
  if (id === currentAdminId && input.status === 'BANNED') throw new AppError(400, 'CANNOT_BAN_SELF', 'Cannot ban current admin')
  return { user: toUserDto(await adminRepository.updateUserStatus(id, input.status)) }
}
