import axios from 'axios'

export const http = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null
let authFailureHandler = null

export function setAuthFailureHandler(handler) {
  authFailureHandler = handler
}

const retryBlockedPaths = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
])

function pathname(url = '') {
  const path = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0]
  return path.replace(/^\/api\/v1/, '')
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config

    if (error.response?.status !== 401 || !config || config._retry || config._skipAuthRefresh || retryBlockedPaths.has(pathname(config.url))) {
      return Promise.reject(error)
    }

    config._retry = true

    try {
      refreshPromise ??= http.post('/auth/refresh', null, { _skipAuthRefresh: true }).finally(() => {
        refreshPromise = null
      })
      await refreshPromise
      return http(config)
    } catch (refreshError) {
      authFailureHandler?.()
      return Promise.reject(refreshError)
    }
  },
)
