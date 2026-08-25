<script setup>
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  tags: {
    type: Array,
    default: () => ['abc', 'xyz', 'bcc'],
  },
  search: {
    type: Object,
    required: true,
    default: undefined,
  },
  loadingTags: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:search'])
const { t } = useI18n()

function updateSearch(patch) {
  emit('update:search', { ...props.search, ...patch })
}
</script>
<template>
  <div class="relative mt-20 mb-8 flex flex-col items-center space-y-7 pb-8 text-center">
    <div class="space-y-5">
      <p class="font-mono text-sm font-semibold uppercase tracking-[0.4em] text-[var(--muted)]">
        {{ t('gallery.eyebrow') }}
      </p>
      <h1
        class="font-serif text-6xl font-semibold leading-none text-[var(--fg)] sm:text-7xl lg:text-8xl"
      >
        {{ t('gallery.title') }}
      </h1>
      <p class="mx-auto max-w-3xl text-lg text-[var(--muted)] sm:text-xl">
        {{ t('gallery.description') }}
      </p>
    </div>

    <div v-if="loadingTags" class="mt-3 flex animate-pulse flex-wrap justify-center gap-2.5">
      <span
        v-for="index in 5"
        :key="index"
        class="h-9 w-20 rounded-full bg-[var(--surface)]"
      ></span>
    </div>

    <div
      v-else-if="tags.length"
      class="items-center justify-center px-5 mt-3 flex w-full flex-nowrap gap-2.5 overflow-x-scroll pb-2 [scrollbar-width:thin] [scrollbar-color:#888_#262626] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 md:flex-wrap md:overflow-x-visible md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        class="shrink-0 rounded-full border px-5 py-2 text-sm font-semibold leading-none transition"
        :class="
          !search.keyTags
            ? 'border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]'
            : 'border-[var(--border)] bg-[var(--panel)]/70 text-[var(--fg)] hover:bg-[var(--surface)]'
        "
        @click="updateSearch({ keyTags: '' })"
      >
        {{ t('gallery.all') }}
      </button>

      <button
        v-for="tag in tags"
        :key="tag.id"
        type="button"
        class="shrink-0 rounded-full border px-5 py-2 text-sm font-semibold leading-none transition"
        :class="
          search.keyTags === tag.slug
            ? 'border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]'
            : 'border-[var(--border)] bg-[var(--panel)]/70 text-[var(--fg)] hover:bg-[var(--surface)]'
        "
        @click="
          updateSearch({
            keyTags: search.keyTags === tag.slug ? '' : tag.slug,
          })
        "
      >
        {{ tag.name }}
      </button>
    </div>
  </div>
</template>
