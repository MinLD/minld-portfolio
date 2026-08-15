<script setup>
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

defineProps({
  project: {
    type: Object,
    default: null,
  },

  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      @click.self="!isLoading && emit('cancel')"
    >
      <div class="w-full max-w-md rounded-xl border border-zinc-800 bg-[#18181b] shadow-2xl">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 class="text-base font-semibold text-white">Delete Project</h2>

            <p class="mt-1 text-sm text-zinc-500">This action cannot be undone.</p>
          </div>

          <button
            type="button"
            :disabled="isLoading"
            class="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            @click="emit('cancel')"
          >
            ×
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-5">
          <p class="text-sm leading-6 text-zinc-300">
            Are you sure you want to delete
            <span class="font-medium text-white"> "{{ project?.title }}" </span>
            ?
          </p>

          <div class="mt-4 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3">
            <p class="text-sm text-red-300">
              The project and its related data may be permanently removed.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 border-t border-zinc-800 px-6 py-4">
          <button
            type="button"
            :disabled="isLoading"
            class="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            @click="emit('cancel')"
          >
            Cancel
          </button>

          <button
            type="button"
            :disabled="isLoading"
            class="flex min-w-28 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            @click="emit('confirm')"
          >
            <LoadingSpinner v-if="isLoading" size="size-4" />

            <span v-if="isLoading"> Deleting... </span>

            <span v-else> Delete </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
