<script setup>
defineProps({
  section: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section
    :id="section.id"
    :data-about-section="section.id"
    class="min-h-[calc(100dvh-4rem)] [scroll-snap-align:start] px-6 py-12 sm:px-10 lg:px-24 lg:py-16"
  >
    <div class="w-full max-w-4xl">
      <img
        :src="section.image"
        :alt="section.alt"
        class="mb-8 aspect-[4/3] w-full object-cover lg:hidden"
      />

      <p class="font-mono text-xs tracking-[0.24em] text-zinc-600">{{ section.eyebrow }}</p>

      <h2 class="mt-4 font-serif text-5xl font-semibold leading-none text-zinc-100 sm:text-6xl">
        {{ section.title }}
      </h2>

      <div
        v-if="section.body?.length"
        class="mt-8 max-w-3xl space-y-5 text-xl leading-9 text-zinc-500"
      >
        <p>
          {{ section.body[0] }}
        </p>
      </div>

      <blockquote
        v-if="section.quote"
        class="mt-7 border-l-4 border-zinc-200 pl-7 font-serif text-2xl italic leading-9 text-zinc-200"
      >
        {{ section.quote }}
      </blockquote>
      <div
        v-if="section.body?.length"
        class="mt-8 max-w-3xl space-y-5 text-xl leading-9 text-zinc-500"
      >
        <p>
          {{ section.body[1] }}
        </p>
      </div>

      <div v-if="section.timeline" class="mt-5 border-l border-zinc-800">
        <div
          v-for="item in section.timeline"
          :key="item.title"
          class="relative pb-12 pl-10 last:pb-0"
        >
          <span
            class="absolute -left-2 top-1 size-4 rounded-full border border-zinc-500 bg-[#121212]"
          ></span>
          <p class="font-mono text-sm text-zinc-500">{{ item.period }}</p>
          <h3 class="mt-4 text-2xl font-semibold text-zinc-100">{{ item.title }}</h3>
          <p class="mt-2 text-lg font-medium text-zinc-200">{{ item.role }}</p>
          <p class="mt-4 max-w-3xl text-lg leading-8 text-zinc-500">{{ item.text }}</p>
        </div>
      </div>

      <div v-if="section.groups" class="mt-5 space-y-7">
        <div v-for="group in section.groups" :key="group.name">
          <div class="flex items-center gap-5">
            <span class="h-px w-12 bg-zinc-300"></span>
            <h3 class="font-serif text-3xl text-zinc-100">{{ group.name }}</h3>
          </div>
          <div class="mt-5 flex flex-wrap gap-3 pl-16">
            <span
              v-for="item in group.items"
              :key="item"
              class="rounded-full bg-zinc-900/70 px-4 py-2 text-base text-zinc-400"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="section.actions" class="mt-5 flex flex-wrap gap-4">
        <a
          v-for="action in section.actions"
          :key="action.href"
          :href="action.href"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-xl bg-white px-6 py-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          {{ action.label }}
        </a>
      </div>
    </div>
  </section>
</template>
