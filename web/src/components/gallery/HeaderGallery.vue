<script setup>
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  tags: {
    type: Array,
    default: () => [],
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
  loadingCategories: {
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
  <div
    class="relative mt-12 mb-8 flex flex-col items-center space-y-6 pb-8 text-center md:mt-20 md:space-y-7"
  >
    <div class="space-y-4 md:space-y-5">
      <p class="font-mono text-sm font-semibold uppercase tracking-[0.4em] text-[var(--muted)]">
        {{ t('gallery.eyebrow') }}
      </p>
      <h1
        class="font-serif text-5xl font-semibold leading-none text-[var(--fg)] sm:text-7xl lg:text-8xl"
      >
        {{ t('gallery.title') }}
      </h1>
      <p class="mx-auto max-w-3xl px-3 text-base text-[var(--muted)] sm:text-xl">
        {{ t('gallery.description') }}
      </p>
    </div>

    <div v-if="loadingCategories" class="mt-3 flex animate-pulse flex-wrap justify-center gap-2.5">
      <span
        v-for="index in 5"
        :key="index"
        class="h-9 w-20 rounded-full bg-[var(--surface)]"
      ></span>
    </div>

    <div
      v-else-if="categories.length"
      class="mt-3 flex w-full flex-nowrap items-center justify-start gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:justify-center md:overflow-x-visible"
    >
      <button
        type="button"
        class="shrink-0 rounded-full border px-5 py-2 text-sm font-semibold leading-none transition"
        :class="
          !search.keyCategory
            ? 'border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]'
            : 'border-[var(--border)] bg-[var(--panel)]/70 text-[var(--fg)] hover:bg-[var(--surface)]'
        "
        @click="updateSearch({ keyCategory: '' })"
      >
        {{ t('gallery.all') }}
      </button>

      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="shrink-0 rounded-full border px-5 py-2 text-sm font-semibold leading-none transition"
        :class="
          search.keyCategory === category.slug
            ? 'border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]'
            : 'border-[var(--border)] bg-[var(--panel)]/70 text-[var(--fg)] hover:bg-[var(--surface)]'
        "
        @click="
          updateSearch({
            keyCategory: search.keyCategory === category.slug ? '' : category.slug,
          })
        "
      >
        {{ category.name }} <span>({{ category.count ?? 0 }})</span>
      </button>
    </div>

    <div v-if="loadingTags" class="flex items-center animate-pulse flex-wrap justify-center gap-2">
      <span
        v-for="index in 10"
        :key="index"
        class="h-7 w-20 rounded-full bg-[var(--surface)]"
      ></span>
    </div>

    <div
      v-else-if="tags.length"
      class="flex w-full flex-nowrap justify-start gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:justify-center md:overflow-x-visible"
    >
      <button
        v-for="tag in tags"
        :key="tag.id"
        type="button"
        class="shrink-0 rounded-full border px-3 py-1 text-sm transition"
        :class="
          search.keyTags === tag.slug
            ? 'border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]'
            : 'border-[var(--border)] bg-[var(--panel)]/70 text-[var(--fg)] hover:bg-[var(--surface)]'
        "
        @click="updateSearch({ keyTags: search.keyTags === tag.slug ? '' : tag.slug })"
      >
        {{ tag.name }} <span>({{ tag.count ?? 0 }})</span>
      </button>
    </div>
  </div>
</template>
