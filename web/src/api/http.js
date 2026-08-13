import axios from 'axios'

export const http = axios.create({
  baseURL: '/api/v1',

  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
})
