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
  <div class="mt-20 relative flex flex-col items-center text-center pb-20 space-y-6 mb-20">
    <div class="fixed inset-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
      <div
        class="absolute rounded-full blur-[120px] w-96 h-96 top-[-10%] left-[-5%] bg-primary/10"
        style="transform: translateX(-12.738px) translateY(12.738px)"
      ></div>
      <div
        class="absolute rounded-full blur-[120px] w-80 h-80 top-[20%] right-[-5%] bg-secondary/10"
        style="transform: translateX(1.5375px) translateY(-0.3075px)"
      ></div>
      <div
        class="absolute rounded-full blur-[120px] w-64 h-64 bottom-[10%] left-[30%] bg-primary/5"
        style="transform: translateX(-1.845px) translateY(1.38375px)"
      ></div>
    </div>
    <div class="space-y-4">
      <p class="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
        Hard-working Developer
      </p>
      <h1 class="text-4xl md:text-6xl font-bold tracking-tight font-serif">
        Projects &amp; Open Source
      </h1>
      <p class="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
        A collection of my work, side projects, and open source contributions.
      </p>
    </div>
    <div class="w-full max-w-md flex gap-2 mt-4">
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
