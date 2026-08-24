<script setup>
const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  search: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:search'])

function updateSearch(patch) {
  emit('update:search', { ...props.search, ...patch })
}
</script>
<template>
  <div class="relative mt-20 mb-20 flex flex-col items-center space-y-7 pb-20 text-center">
    <div class="space-y-5">
      <p class="font-mono text-sm font-semibold uppercase tracking-[0.4em] text-zinc-500">
        Hard-working Developer
      </p>
      <h1 class="font-serif text-6xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
        Projects &amp; Open Source
      </h1>
      <p class="mx-auto max-w-3xl text-lg text-zinc-500 sm:text-xl">
        A collection of my work, side projects, and open source contributions.
      </p>
    </div>
    <div class="mt-5 flex w-full max-w-xl gap-2">
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
          class="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        >
          <path d="m21 21-4.34-4.34"></path>
          <circle cx="11" cy="11" r="8"></circle></svg
        ><input
          class="flex h-14 w-full rounded-lg border border-zinc-800 bg-[#151515]/75 px-4 py-2 pl-12 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Search projects and repos..."
          :value="search.keyword"
          @input="updateSearch({ keyword: $event.target.value || undefined })"
        />
      </div>
    </div>
    <div v-if="tags.length" class="mt-3 flex max-w-5xl flex-wrap justify-center gap-2.5">
      <button
        type="button"
        class="rounded-full border px-5 py-2 text-sm font-semibold leading-none transition"
        :class="
          !search.keyTags
            ? 'border-white bg-white text-zinc-950'
            : 'border-zinc-800 bg-zinc-900/70 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800'
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
            ? 'border-white bg-white text-zinc-950'
            : 'border-zinc-800 bg-zinc-900/70 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800'
        "
        @click="updateSearch({ keyTags: search.keyTags === tag.slug ? '' : tag.slug })"
      >
        {{ tag.name }}
      </button>
    </div>
  </div>
</template>
