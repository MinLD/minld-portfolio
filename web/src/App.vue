<script setup>
import { RouterView } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from './layouts/AdminLayout.vue'
import BlankLayout from './layouts/BlankLayout.vue'
const route = useRoute()
const layouts = {
  user: DefaultLayout,
  admin: AdminLayout,
  blank: BlankLayout,
}
const currentLayout = computed(() => {
  return layouts[route.meta.layout] ?? DefaultLayout
})
</script>

<template>
  <component :is="currentLayout">
    <RouterView />
  </component>
</template>
