<script setup>
import { RouterView } from 'vue-router'
import { theme as antdTheme } from 'ant-design-vue'
import AppLoader from '@/components/loading/AppLoader.vue'
import NProgressBar from '@/components/loading/NProgressBar.vue'
import { useAuthStore } from '@/stores/auth.store'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from './layouts/AdminLayout.vue'
import BlankLayout from './layouts/BlankLayout.vue'
import { useTheme } from './composables/useTheme.js'
const route = useRoute()
const authStore = useAuthStore()
const layouts = {
  user: DefaultLayout,
  admin: AdminLayout,
  blank: BlankLayout,
}
const { isLight } = useTheme()
const currentLayout = computed(() => {
  return layouts[route.meta.layout] ?? DefaultLayout
})

const needsBootstrapLoader = computed(() => {
  return route.meta.requiresAuth && !authStore.initialized
})
const antTheme = computed(() => ({
  algorithm: isLight.value ? antdTheme.defaultAlgorithm : antdTheme.darkAlgorithm,
}))
</script>

<template>
  <a-config-provider :theme="antTheme"></a-config-provider>
  <NProgressBar />
  <AppLoader v-if="needsBootstrapLoader" />
  <component v-else :is="currentLayout">
    <RouterView />
  </component>
</template>
