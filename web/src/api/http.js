const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiRequest(path, options = {}) {
  const { accessToken, headers, ...fetchOptions } = options
  const hasBody = Boolean(fetchOptions.body)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...fetchOptions,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.error?.message || payload?.message || 'Request failed',
      response.status,
      payload?.error?.code,
    )
  }

  return payload?.data ?? payload
}
