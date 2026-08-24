<script setup>
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
    <AppHeader />
    <main class="min-h-[55vh]">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
