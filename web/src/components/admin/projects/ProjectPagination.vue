<script setup>
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  limit: { type: Number, default: 20 },
  loading: { type: Boolean, default: false },
  itemLabel: { type: String, default: 'projects' },
})

const emit = defineEmits(['change'])
const { t } = useI18n()

const pages = computed(() => {
  if (props.totalPages <= 1) return []

  const start = Math.max(1, props.page - 2)
  const end = Math.min(props.totalPages, props.page + 2)
  const result = []

  for (let page = start; page <= end; page++) result.push(page)

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
    class="sticky bottom-0 z-10 mt-10 flex flex-col gap-3 rounded-lg border border-zinc-800 bg-[#18181b] px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-sm text-zinc-500">
      {{ t('admin.pagination.page') }}
      <span class="font-medium text-zinc-300">{{ page }}</span>
      {{ t('admin.pagination.of') }}
      <span class="font-medium text-zinc-300">{{ totalPages }}</span>
      <span class="mx-1">•</span>
      {{ total }} {{ itemLabel }}
    </p>

    <div class="flex items-center gap-1">
      <button
        type="button"
        :disabled="page <= 1 || loading"
        class="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        @click="goToPage(page - 1)"
      >
        {{ t('admin.pagination.previous') }}
      </button>

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

      <button
        type="button"
        :disabled="page >= totalPages || loading"
        class="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        @click="goToPage(page + 1)"
      >
        {{ t('admin.pagination.next') }}
      </button>
    </div>
  </div>
</template>
