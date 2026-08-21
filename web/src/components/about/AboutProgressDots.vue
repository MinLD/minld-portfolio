<script setup>
defineProps({
  sections: {
    type: Array,
    required: true,
  },
  activeId: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <nav class="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
    <a
      v-for="section in sections"
      :key="section.id"
      :href="`#${section.id}`"
      class="size-2 rounded-full transition"
      :class="activeId === section.id ? 'bg-white ring-4 ring-white/15' : 'bg-zinc-700 hover:bg-zinc-400'"
      :aria-label="section.eyebrow"
    ></a>
  </nav>
</template>
