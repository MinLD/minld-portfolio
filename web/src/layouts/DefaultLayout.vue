<script setup>
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ParticleBackground from '../components/shared/ParticleBackground.vue'
</script>

<template>
  <div class="min-h-screen bg-[#111111] text-zinc-100">
    <AppHeader />
    <main class="min-h-[55vh]">
      <ParticleBackground variant="dust" />
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
