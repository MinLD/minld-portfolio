import { defineStore } from 'pinia'
import * as authService from '@/services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    booted: false,
    loading: false,
    error: '',
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.user),
  },

  actions: {
    setError(error, fallback) {
      this.error = error?.message || fallback
    },

    async register(credentials) {
      this.loading = true
      this.error = ''

      try {
        return await authService.register(credentials)
      } catch (error) {
        this.setError(error, 'Register failed')
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = ''

      try {
        const data = await authService.login(credentials)
        this.user = data.user
        return data
      } catch (error) {
        this.setError(error, 'Login failed')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      if (!authService.getAccessToken()) await authService.refresh()

      let data
      try {
        data = await authService.me()
      } catch (error) {
        if (error.status !== 401) throw error
        await authService.refresh()
        data = await authService.me()
      }

      this.user = data.user
      return data.user
    },

    async boot() {
      if (this.booted) return this.user

      try {
        await this.fetchMe()
      } catch {
        this.user = null
      } finally {
        this.booted = true
      }

      return this.user
    },

    async logout() {
      await authService.logout()
      this.user = null
    },
  },
})
