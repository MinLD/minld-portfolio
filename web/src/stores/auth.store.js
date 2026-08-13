import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

import * as authService from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const loading = ref(false)
  const error = ref('')

  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value))

  async function login(credentials) {
    loading.value = true
    error.value = ''

    try {
      const data = await authService.login(credentials)

      user.value = data.user

      return data.user
    } catch (err) {
      user.value = null

      if (axios.isAxiosError(err)) {
        const code = err.response?.data?.error?.code

        if (code === 'INVALID_CREDENTIALS') {
          error.value = 'Incorrect email or password.'
        } else if (!err.response) {
          error.value = 'Unable to connect to the server.'
        } else {
          error.value = err.response?.data?.error?.message || 'Login failed.'
        }
      } else {
        error.value = 'Login failed.'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  async function restoreSession() {
    if (initialized.value) {
      return user.value
    }

    try {
      const data = await authService.refreshSession()

      user.value = data.user
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }

    return user.value
  }

  function clearError() {
    error.value = ''
  }

  return {
    user,
    loading,
    error,
    initialized,

    isAuthenticated,

    login,
    restoreSession,
    clearError,
  }
})
