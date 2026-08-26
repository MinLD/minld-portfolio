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
    <div class="relative">
      <img
        :src="item.url"
        :alt="item.altText || item.content"
        class="w-full transition duration-500 group-hover:scale-105"
        :class="viewMode === 'grid-2' ? 'object-contain' : 'aspect-[4/3] object-cover'"
        loading="lazy"
        decoding="async"
      />
      <div
        class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <p class="font-medium text-justify px-3 text-white text-sm line-clamp-2">
          {{ item.content }}
        </p>
      </div>
    </div>
  </article>
</template>
