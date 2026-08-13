<script setup>
import { ref } from 'vue'

import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/AdminTopbar.vue'

const sidebarOpen = ref(false)

function openSidebar() {
  sidebarOpen.value = true
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[#151515] text-white">
    <AdminSidebar :open="sidebarOpen" @close="closeSidebar" />

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/60 lg:hidden"
      @click="closeSidebar"
    ></div>

    <div class="min-h-screen lg:pl-72">
      <AdminTopbar @open-sidebar="openSidebar" />

      <main class="px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>
