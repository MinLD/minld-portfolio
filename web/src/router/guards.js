// Navigation guards: kiểm tra trạng thái auth trước khi vào route.
import { useAuthStore } from '@/stores/auth.store'

export function registerGuards(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth) {
      await authStore.boot()
    }

    if (to.meta.guestOnly && authStore.isLoggedIn) {
      return '/'
    }

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    return true
  })

  return router
}
