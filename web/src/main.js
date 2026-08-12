import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ParticlesPlugin from '@tsparticles/vue3'
import { loadFull } from 'tsparticles'

import App from './App.vue'
import router from './router'

import './assets/styles/main.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(ParticlesPlugin, {
    init: async (engine) => {
      await loadFull(engine)
    },
  })
  .mount('#app')
