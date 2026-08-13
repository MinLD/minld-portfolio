// Navigation guards: kiểm tra trạng thái auth trước khi vào route.
import { useAuthStore } from '@/stores/auth.store'

export function registerGuards(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth || to.meta.guestOnly) {
      await authStore.restoreSession()
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return '/'
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    return true
  })

  return router
}
