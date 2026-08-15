<script setup>
defineProps({
  search: { type: String, default: '' },
  status: { type: String, default: 'all' },
})
const emit = defineEmits(['create', 'update:search', 'update:status'])
</script>
<template>
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="relative w-full sm:max-w-[260px]">
      <svg
        class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />

        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        type="text"
        :value="search"
        placeholder="Search projects..."
        class="h-10 w-full rounded-md border border-zinc-800 bg-[#111111] pl-9 pr-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 hover:border-zinc-700 focus:border-zinc-600"
        @input="emit('update:search', $event.target.value)"
      />
    </div>
    <div class="flex items-center gap-2">
      <!-- Filter -->
      <div class="relative">
        <svg
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>

        <select
          :value="status"
          class="h-10 cursor-pointer appearance-none rounded-md border border-zinc-700 bg-[#171717] py-0 pl-9 pr-8 text-sm text-zinc-300 outline-none transition hover:bg-zinc-800"
          @change="emit('update:status', $event.target.value)"
        >
          <option value="all">All status</option>

          <option value="PUBLISHED">Published</option>

          <option value="DRAFT">Draft</option>

          <option value="ARCHIVED">Archived</option>
        </select>

        <svg
          class="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <!-- Create -->
      <button
        type="button"
        class="flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
        @click="emit('create')"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>

        New Project
      </button>
    </div>
  </div>
</template>
