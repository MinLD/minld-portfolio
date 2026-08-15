import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'vue3-toastify/dist/index.css'
import './assets/styles/main.css'
import Vue3Toastify from 'vue3-toastify'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vue3Toastify, {
  theme: 'dark',
  position: 'top-right',
  autoClose: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  hideProgressBar: false,
  newestOnTop: true,
})
app.mount('#app')
