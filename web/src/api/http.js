import axios from 'axios'

export const http = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null
let onAuthFail = null

export function setAuthFailureHandler(handler) {
  onAuthFail = handler
}

const noRetryPaths = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'])

function pathOf(url = '') {
  if (!url) return ''

  const pathname = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0]

  return pathname.replace(/^\/api\/v1/, '')
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config
    const path = pathOf(config?.url)

    if (
      err.response?.status !== 401 ||
      !config ||
      config._retry ||
      config._skipAuthRefresh ||
      noRetryPaths.has(path)
    ) {
      return Promise.reject(err)
    }

    config._retry = true

    try {
      refreshPromise ??= http
        .post('/auth/refresh', undefined, { _skipAuthRefresh: true })
        .finally(() => {
          refreshPromise = null
        })

      await refreshPromise
      return http(config)
    } catch (refreshErr) {
      onAuthFail?.()
      return Promise.reject(refreshErr)
    }
  },
)
