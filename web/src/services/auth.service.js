import { loginApi, logoutApi, meApi, refreshApi, registerApi } from '../api/auth'

export function register(payload) {
  return registerApi(payload)
}

export function login(credentials) {
  return loginApi(credentials)
}

export function refreshSession() {
  return refreshApi()
}

export function fetchMe() {
  return meApi()
}

export function logout() {
  return logoutApi()
}
