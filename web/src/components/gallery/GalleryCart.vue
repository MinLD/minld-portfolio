<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  viewMode: {
    type: String,
    default: 'grid-2',
  },
})
</script>

<template>
  <article
    class="group overflow-hidden rounded-lg bg-zinc-950"
    :class="viewMode === 'locket' ? 'mb-2 break-inside-avoid' : ''"
  >
    <img
      :src="item.url"
      :alt="item.altText || item.content"
      class="w-full transition duration-500 group-hover:scale-105"
      :class="viewMode === 'locket' ? 'object-contain' : 'aspect-square object-cover'"
      loading="lazy"
    />
  </article>
</template>
