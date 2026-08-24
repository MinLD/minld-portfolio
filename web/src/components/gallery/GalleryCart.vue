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
    class="group overflow-hidden rounded-sm bg-zinc-950"
    :class="viewMode === 'locket' ? ' break-inside-avoid' : ''"
  >
    <img
      :src="item.url"
      :alt="item.altText || item.content"
      class="w-full transition duration-500 group-hover:scale-105"
      :class="viewMode === 'grid-2' ? 'object-contain' : 'aspect-[4/3] object-cover'"
      loading="lazy"
      decoding="async"
    />
  </article>
</template>
