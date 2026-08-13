import { http } from './http'

export async function registerApi(payload) {
  const response = await http.post('/auth/register', payload)
  return response.data.data
}

export async function loginApi(payload) {
  const response = await http.post('/auth/login', payload)
  return response.data.data
}

export async function refreshApi() {
  const response = await http.post('/auth/refresh')
  console.log(response.data.data)
  return response.data.data
}
export async function meApi(accessToken) {
  const response = await http.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.data.data
}

export async function logoutApi() {
  const response = await http.post('/auth/logout')
  return response.data.data
}
