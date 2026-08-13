import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ParticlesPlugin from '@tsparticles/vue3'
import { loadFull } from 'tsparticles'

import App from './App.vue'
import router from './router'

import './assets/styles/main.css'
import { useAuthStore } from './stores/auth.store.js'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')

const authStore = useAuthStore(pinia)

authStore.restoreSession()
