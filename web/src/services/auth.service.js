import { loginApi, refreshApi } from '../api/auth'

let accessToken = null

export async function login(credentials) {
  const data = await loginApi(credentials)

  accessToken = data.accessToken

  return data
}

export async function refreshSession() {
  const data = await refreshApi()

  accessToken = data.accessToken

  return data
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}
