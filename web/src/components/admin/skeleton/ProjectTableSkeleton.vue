<script setup>
defineProps({
  rows: {
    type: Number,
    default: 5,
  },
})
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-zinc-800 bg-[#18181b]">
    <!-- Header -->
    <div
      class="hidden grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 border-b border-zinc-800 bg-[#141414] px-5 py-3 md:grid"
    >
      <div class="h-3 w-20 animate-pulse rounded bg-zinc-800"></div>
      <div class="h-3 w-16 animate-pulse rounded bg-zinc-800"></div>
      <div class="h-3 w-14 animate-pulse rounded bg-zinc-800"></div>
      <div class="h-3 w-16 animate-pulse rounded bg-zinc-800"></div>
      <div class="h-3 w-14 animate-pulse rounded bg-zinc-800"></div>
    </div>

    <!-- Rows -->
    <div
      v-for="index in rows"
      :key="index"
      class="grid gap-4 border-b border-zinc-800 px-5 py-4 last:border-b-0 md:grid-cols-[2fr_1fr_1fr_1fr_120px] md:items-center"
    >
      <!-- Project -->
      <div class="flex items-center gap-3">
        <div class="h-12 w-16 shrink-0 animate-pulse rounded-md bg-zinc-800"></div>

        <div class="min-w-0 flex-1">
          <div class="h-4 w-40 animate-pulse rounded bg-zinc-800"></div>
          <div class="mt-2 h-3 w-56 max-w-full animate-pulse rounded bg-zinc-800/70"></div>
        </div>
      </div>

      <!-- Status -->
      <div>
        <div class="h-6 w-20 animate-pulse rounded-full bg-zinc-800"></div>
      </div>

      <!-- Year -->
      <div>
        <div class="h-4 w-12 animate-pulse rounded bg-zinc-800"></div>
      </div>

      <!-- Featured -->
      <div>
        <div class="h-4 w-14 animate-pulse rounded bg-zinc-800"></div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <div class="h-8 w-12 animate-pulse rounded-md bg-zinc-800"></div>
        <div class="h-8 w-14 animate-pulse rounded-md bg-zinc-800"></div>
      </div>
    </div>
  </div>
</template>
