import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

import { setAuthFailureHandler } from '@/api/http'
import * as authService from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const loading = ref(false)
  const error = ref('')

  const initialized = ref(false)
  let restorePromise = null

  const isAuthenticated = computed(() => Boolean(user.value))

  function clearSession() {
    user.value = null
  }

  setAuthFailureHandler(clearSession)

  async function register(payload) {
    loading.value = true
    error.value = ''

    try {
      return await authService.register(payload)
    } catch (err) {
      error.value = axios.isAxiosError(err) ? err.response?.data?.error?.message || 'Register failed.' : 'Register failed.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value = ''

    try {
      const data = await authService.login(credentials)

      user.value = data.user
      initialized.value = true

      return data.user
    } catch (err) {
      clearSession()

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

    if (restorePromise) {
      return restorePromise
    }

    restorePromise = (async () => {
      try {
        const data = await authService.refreshSession()

        user.value = data.user
      } catch {
        clearSession()
      } finally {
        initialized.value = true
        restorePromise = null
      }

      return user.value
    })()

    return restorePromise
  }

  async function fetchMe() {
    const data = await authService.fetchMe()
    user.value = data.user
    initialized.value = true
    return data.user
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      clearSession()
      initialized.value = true
    }
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

    register,
    login,
    restoreSession,
    fetchMe,
    logout,
    clearSession,
    clearError,
  }
})
