import { loginApi, logoutApi, meApi, refreshApi, registerApi } from '@/api/auth'

let accessToken = ''

export function getAccessToken() {
  return accessToken
}

export function authHeader() {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

function setSession(data) {
  accessToken = data?.accessToken || ''
  return data
}

export async function register(credentials) {
  return registerApi(credentials)
}

export async function login(credentials) {
  return setSession(await loginApi(credentials))
}

export async function refresh() {
  return setSession(await refreshApi())
}

export async function me() {
  return meApi(accessToken)
}

export async function logout() {
  try {
    await logoutApi()
  } finally {
    accessToken = ''
  }
}
