import { apiRequest } from './http'

const AUTH_BASE = 'http://localhost:4000/api/v1/auth'

export function registerApi(payload) {
  return apiRequest(`${AUTH_BASE}/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginApi(payload) {
  return apiRequest(`${AUTH_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function refreshApi() {
  return apiRequest(`${AUTH_BASE}/refresh`, { method: 'POST' })
}

export function meApi(accessToken) {
  return apiRequest(`${AUTH_BASE}/me`, { accessToken })
}

export function logoutApi() {
  return apiRequest(`${AUTH_BASE}/logout`, { method: 'POST' })
}
