<script setup>
defineProps({
  page: {
    type: Number,
    required: true,
  },

  limit: {
    type: Number,
    required: true,
  },

  totalPages: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['change'])
function gotoPage(page) {
  emit('change', page)
}
</script>
<template>
  <div class="mt-12 flex w-full items-center justify-center">
    <div class="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 p-1">
      <button
        type="button"
        class="rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page <= 1"
        @click="gotoPage(page - 1)"
      >
        Prev
      </button>

      <button
        v-for="item in totalPages"
        :key="item"
        type="button"
        class="size-9 rounded-full text-sm transition"
        :class="
          item === page
            ? 'bg-white text-zinc-950'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        "
        @click="gotoPage(item)"
      >
        {{ item }}
      </button>

      <button
        type="button"
        class="rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="gotoPage(page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
