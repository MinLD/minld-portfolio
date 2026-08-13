<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },

  value: {
    type: [Number, String],
    default: 0,
  },

  description: {
    type: String,
    default: '',
  },

  icon: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article
    class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-zinc-400">
          {{ title }}
        </p>

        <p class="mt-3 text-3xl font-semibold tracking-tight text-white">
          {{ value }}
        </p>
      </div>

      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400"
      >
        <component :is="icon" :size="20" />
      </div>
    </div>

    <p v-if="description" class="mt-4 border-t border-zinc-800 pt-4 text-sm text-zinc-500">
      {{ description }}
    </p>
  </article>
</template>
