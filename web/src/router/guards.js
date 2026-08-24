// Navigation guards: kiểm tra trạng thái auth trước khi vào route.
import { useAuthStore } from '@/stores/auth.store'
import { finishRouteProgress, startRouteProgress } from '@/composables/useRouteProgress'
//trước mỗi lần điều hướng route, chạy function này trước.
export function registerGuards(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const shouldShowRouteProgress = authStore.initialized

    if (shouldShowRouteProgress) {
      startRouteProgress()
    }

    try {
      const needsAuthState = to.meta.requiresAuth || to.meta.guestOnly || authStore.initialized

      if (needsAuthState) {
        await authStore.restoreSession() //Trước khi quyết định có cho user vào route hay không, hãy xác định trạng thái đăng nhập hiện tại trước.
      } else {
        void authStore.restoreSession()
      }

      //route này chỉ dành cho người CHƯA đăng nhập.
      if (to.meta.guestOnly && authStore.isAuthenticated) {
        return '/'
      }

      if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { path: '/login', query: { redirect: to.fullPath } }
      }
      if (to.meta.roles) {
        const allowedRoles = to.meta.roles.map((role) => role.toUpperCase())
        const userRole = authStore.user?.role.toUpperCase()
        const hasPermission = userRole && allowedRoles.includes(userRole)
        if (!hasPermission) {
          return {
            name: 'not-found',
            params: {
              pathMatch: to.path.substring(1).split('/'),
            },
          }
        }
      }

      return true
    } catch (error) {
      if (shouldShowRouteProgress) {
        finishRouteProgress()
      }
      throw error
    }
  })

  router.afterEach(() => {
    finishRouteProgress()
  })

  router.onError(() => {
    finishRouteProgress()
  })

  return router
}
