<script setup>
defineProps({
  section: {
    type: Object,
    required: true,
  },
  sections: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <aside
    class="pointer-events-none sticky left-0 top-0 z-10 -mb-[calc(100dvh-4rem)] hidden h-[calc(100dvh-4rem)] w-[39.5vw] overflow-hidden bg-[var(--bg)] lg:block"
  >
    <img
      v-for="item in sections"
      :key="item.id"
      :src="item.image"
      :alt="item.alt"
      class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
      :class="item.id === section.id ? 'opacity-80' : 'opacity-0'"
    />
  </aside>
</template>
