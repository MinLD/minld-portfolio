<script setup>
defineProps({
  count: { type: Number, default: 8 },
  viewMode: { type: String, default: 'locket' },
})
</script>

<template>
  <div
    class="animate-pulse"
    :class="[
      viewMode === 'grid-2' && 'columns-2 gap-2 sm:columns-3',
      viewMode === 'grid-3' && 'grid grid-cols-4 gap-2',
      viewMode === 'locket' && 'grid grid-cols-2 gap-2',
    ]"
  >
    <div
      v-for="index in count"
      :key="index"
      class="mb-2 break-inside-avoid rounded-lg bg-[var(--surface)]"
      :class="index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'"
    ></div>
  </div>
</template>
