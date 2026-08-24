<script setup>
import { RouterView } from 'vue-router'

import AppLoader from '@/components/loading/AppLoader.vue'
import NProgressBar from '@/components/loading/NProgressBar.vue'
import { useAuthStore } from '@/stores/auth.store'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from './layouts/AdminLayout.vue'
import BlankLayout from './layouts/BlankLayout.vue'
const route = useRoute()
const authStore = useAuthStore()
const layouts = {
  user: DefaultLayout,
  admin: AdminLayout,
  blank: BlankLayout,
}
const currentLayout = computed(() => {
  return layouts[route.meta.layout] ?? DefaultLayout
})

const needsBootstrapLoader = computed(() => {
  return route.meta.requiresAuth && !authStore.initialized
})
</script>

<template>
  <NProgressBar />
  <AppLoader v-if="needsBootstrapLoader" />
  <component v-else :is="currentLayout">
    <RouterView />
  </component>
</template>
