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
    class="min-h-[calc(100dvh-4rem)] scroll-mt-24 py-16 lg:flex lg:items-center lg:py-24"
  >
    <div class="w-full">
      <img
        :src="section.image"
        :alt="section.alt"
        class="mb-8 aspect-[4/3] w-full rounded-lg object-cover lg:hidden"
      />

      <p class="font-mono text-xs uppercase tracking-[0.24em] text-yellow-300">
        {{ section.eyebrow }}
      </p>

      <h2 class="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
        {{ section.title }}
      </h2>

      <div v-if="section.body?.length" class="mt-8 space-y-5 text-base leading-8 text-zinc-400">
        <p v-for="paragraph in section.body" :key="paragraph">
          {{ paragraph }}
        </p>
      </div>

      <div v-if="section.stats" class="mt-10 grid gap-3 sm:grid-cols-2">
        <div
          v-for="stat in section.stats"
          :key="stat.label"
          class="border-t border-zinc-800 pt-4"
        >
          <p class="text-sm text-zinc-500">{{ stat.label }}</p>
          <p class="mt-1 text-lg font-medium text-zinc-100">{{ stat.value }}</p>
        </div>
      </div>

      <div v-if="section.timeline" class="mt-10 space-y-6">
        <div v-for="item in section.timeline" :key="item.period" class="border-l border-zinc-800 pl-5">
          <p class="text-sm font-medium text-zinc-100">{{ item.period }}</p>
          <p class="mt-2 text-sm leading-7 text-zinc-500">{{ item.text }}</p>
        </div>
      </div>

      <div v-if="section.groups" class="mt-10 space-y-6">
        <div v-for="group in section.groups" :key="group.name">
          <h3 class="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            {{ group.name }}
          </h3>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="item in group.items"
              :key="item"
              class="rounded-full border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="section.actions" class="mt-10 flex flex-wrap gap-3">
        <a
          v-for="action in section.actions"
          :key="action.href"
          :href="action.href"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          {{ action.label }}
        </a>
      </div>
    </div>
  </section>
</template>
