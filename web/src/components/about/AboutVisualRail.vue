<script setup>
defineProps({
  section: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <aside class="sticky top-24 hidden h-[calc(100dvh-8rem)] overflow-hidden rounded-lg lg:block">
    <img
      :key="section.id"
      :src="section.image"
      :alt="section.alt"
      class="h-full w-full object-cover transition duration-500"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
    <div class="absolute bottom-0 left-0 right-0 p-8">
      <p class="font-mono text-xs uppercase tracking-[0.24em] text-zinc-300">
        {{ section.eyebrow }}
      </p>
      <h2 class="mt-3 max-w-lg text-3xl font-semibold leading-tight text-white">
        {{ section.title }}
      </h2>
    </div>
  </aside>
</template>
