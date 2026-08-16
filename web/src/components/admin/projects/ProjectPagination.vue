<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },

  totalPages: {
    type: Number,
    default: 0,
  },

  total: {
    type: Number,
    default: 0,
  },

  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change'])

const pages = computed(() => {
  if (props.totalPages <= 1) {
    return []
  }

  const current = props.page
  const total = props.totalPages

  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)

  const result = []

  for (let page = start; page <= end; page++) {
    result.push(page)
  }

  return result
})

const goToPage = (page) => {
  if (props.loading) return
  if (page < 1) return
  if (page > props.totalPages) return
  if (page === props.page) return

  emit('change', page)
}
</script>

<template>
  <div
    v-if="totalPages > 0"
    class="mt-4 flex flex-col gap-3 rounded-lg border border-zinc-800 bg-[#18181b] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <!-- Result info -->
    <p class="text-sm text-zinc-500">
      Page
      <span class="font-medium text-zinc-300">
        {{ page }}
      </span>
      of
      <span class="font-medium text-zinc-300">
        {{ totalPages }}
      </span>

      <span class="mx-1">•</span>

      {{ total }} projects
    </p>

    <!-- Pagination buttons -->
    <div class="flex items-center gap-1">
      <!-- Previous -->
      <button
        type="button"
        :disabled="page <= 1 || loading"
        class="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        @click="goToPage(page - 1)"
      >
        Previous
      </button>

      <!-- Page numbers -->
      <button
        v-for="item in pages"
        :key="item"
        type="button"
        :disabled="loading"
        class="min-w-9 rounded-md border px-3 py-1.5 text-sm transition"
        :class="
          item === page
            ? 'border-white bg-white text-black'
            : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
        "
        @click="goToPage(item)"
      >
        {{ item }}
      </button>

      <!-- Next -->
      <button
        type="button"
        :disabled="page >= totalPages || loading"
        class="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        @click="goToPage(page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
