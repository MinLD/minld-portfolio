<script setup>
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
})

const emit = defineEmits(['update:search'])

function updateSearch(patch) {
  emit('update:search', { ...props.search, ...patch })
}
</script>
<template>
  <div class="relative mt-20 mb-8 flex flex-col items-center space-y-7 pb-8 text-center">
    <div class="space-y-5">
      <p class="font-mono text-sm font-semibold uppercase tracking-[0.4em] text-[var(--muted)]">
        Gallery
      </p>
      <h1 class="font-serif text-6xl font-semibold leading-none text-[var(--fg)] sm:text-7xl lg:text-8xl">
        Locket Library
      </h1>
      <p class="mx-auto max-w-3xl text-lg text-[var(--muted)] sm:text-xl">
        A collection of memories, places, and little things that inspire me.
      </p>
    </div>
    <!-- <div class="w-full max-w-md flex gap-2 mt-4">
      <div class="relative flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-search absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10 pointer-events-none"
          aria-hidden="true"
        >
          <path d="m21 21-4.34-4.34"></path>
          <circle cx="11" cy="11" r="8"></circle></svg
        ><input
          class="flex w-full rounded-md border border-input bg-background backdrop-blur-sm px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 pl-10 h-10"
          placeholder="Search projects and repos..."
          :value="search.keyword"
          @input="updateSearch({ keyword: $event.target.value || undefined })"
        />
      </div>
    </div> -->
    <div v-if="tags.length" class="mt-3 flex flex-wrap gap-2.5">
      <button
        type="button"
        class="rounded-full border px-5 py-2 text-sm font-semibold leading-none transition"
        :class="
          !search.keyTags
            ? 'border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]'
            : 'border-[var(--border)] bg-[var(--panel)]/70 text-[var(--fg)] hover:bg-[var(--surface)]'
        "
        @click="updateSearch({ keyTags: '' })"
      >
        All
      </button>
      <button
        v-for="tag in tags"
        :key="tag.id"
        type="button"
        class="rounded-full border px-5 py-2 text-sm font-semibold leading-none transition"
        :class="
          search.keyTags === tag.slug
            ? 'border-[var(--action-bg)] bg-[var(--action-bg)] text-[var(--action-fg)]'
            : 'border-[var(--border)] bg-[var(--panel)]/70 text-[var(--fg)] hover:bg-[var(--surface)]'
        "
        @click="updateSearch({ keyTags: search.keyTags === tag.slug ? '' : tag.slug })"
      >
        {{ tag.name }}
      </button>
    </div>
  </div>
</template>
