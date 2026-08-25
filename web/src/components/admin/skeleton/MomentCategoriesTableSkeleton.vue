<script setup>
defineProps({
  rows: {
    type: Number,
    default: 5,
  },
})
</script>

<template>
  <div class="w-full overflow-x-auto rounded-lg border border-zinc-800">
    <div class="min-w-[1000px] animate-pulse">
      <!-- Header -->
      <div
        class="grid grid-cols-[1.4fr_1.2fr_100px_1.4fr_1.4fr_180px] border-b border-zinc-800 bg-zinc-900/60"
      >
        <div class="px-4 py-4">
          <div class="h-4 w-16 rounded bg-zinc-700"></div>
        </div>

        <div class="px-4 py-4">
          <div class="h-4 w-14 rounded bg-zinc-700"></div>
        </div>

        <div class="flex justify-center px-4 py-4">
          <div class="h-4 w-14 rounded bg-zinc-700"></div>
        </div>

        <div class="px-4 py-4">
          <div class="h-4 w-20 rounded bg-zinc-700"></div>
        </div>

        <div class="px-4 py-4">
          <div class="h-4 w-20 rounded bg-zinc-700"></div>
        </div>

        <div class="px-4 py-4">
          <div class="h-4 w-16 rounded bg-zinc-700"></div>
        </div>
      </div>

      <!-- Rows -->
      <div
        v-for="index in rows"
        :key="index"
        class="grid grid-cols-[1.4fr_1.2fr_100px_1.4fr_1.4fr_180px] border-b border-zinc-800 last:border-b-0"
      >
        <!-- Name -->
        <div class="px-4 py-5">
          <div class="h-4 rounded bg-zinc-800" :class="index % 2 === 0 ? 'w-32' : 'w-40'"></div>
        </div>

        <!-- Slug -->
        <div class="px-4 py-5">
          <div class="h-4 rounded bg-zinc-800" :class="index % 2 === 0 ? 'w-24' : 'w-32'"></div>
        </div>

        <!-- Moments -->
        <div class="flex justify-center px-4 py-5">
          <div class="h-4 w-8 rounded bg-zinc-800"></div>
        </div>

        <!-- Created at -->
        <div class="px-4 py-5">
          <div class="h-4 w-36 rounded bg-zinc-800"></div>
        </div>

        <!-- Updated at -->
        <div class="px-4 py-5">
          <div class="h-4 w-36 rounded bg-zinc-800"></div>
        </div>

        <!-- Action -->
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="h-8 w-16 rounded-md bg-zinc-800"></div>
          <div class="h-8 w-20 rounded-md bg-zinc-800"></div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-end gap-2 px-4 py-4">
        <div class="h-8 w-8 rounded bg-zinc-800"></div>
        <div class="h-8 w-8 rounded bg-zinc-800"></div>
        <div class="h-8 w-8 rounded bg-zinc-800"></div>
        <div class="h-8 w-20 rounded bg-zinc-800"></div>
      </div>
    </div>
  </div>
</template>
