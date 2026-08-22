<script setup>
import { aboutSections } from '@/config/about/content'

defineProps({
  section: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <aside
    class="pointer-events-none sticky left-0 top-0 z-10 -mb-[calc(100dvh-4rem)] hidden h-[calc(100dvh-4rem)] w-[39.5vw] overflow-hidden bg-zinc-950 lg:block"
  >
    <img
      v-for="item in aboutSections"
      :key="item.id"
      :src="item.image"
      :alt="item.alt"
      class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
      :class="item.id === section.id ? 'opacity-75' : 'opacity-0'"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black/10 via-black/20 to-black/70"></div>
    <div class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent"></div>
  </aside>
</template>
