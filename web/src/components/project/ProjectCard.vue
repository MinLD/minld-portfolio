<script setup>
import { TvMinimal } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

defineProps({
  project: {
    type: Object,
    required: true,
  },
})

function updateTilt(event) {
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5

  card.style.setProperty('--tilt-x', `${(-y * 14).toFixed(2)}deg`)
  card.style.setProperty('--tilt-y', `${(x * 18).toFixed(2)}deg`)
  card.style.setProperty('--lift', '-10px')
}

function resetTilt(event) {
  const card = event.currentTarget

  card.style.setProperty('--tilt-x', '0deg')
  card.style.setProperty('--tilt-y', '0deg')
  card.style.setProperty('--lift', '0px')
}
</script>

<template>
  <RouterLink :to="{ name: 'ProjectDetail', params: { slug: project.slug } }">
    <article class="group project-card" @pointermove="updateTilt" @pointerleave="resetTilt">
      <div class="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <div class="relative aspect-[16/9] overflow-hidden bg-[var(--surface)]">
          <img
            v-if="project.thumbnailUrl"
            :src="project.thumbnailUrl"
            :alt="project.title"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div v-else class="flex h-full w-full items-center justify-center text-sm text-zinc-600">
            No preview
          </div>

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
          ></div>
          <div
            class="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-4 z-50 flex items-center justify-center p-2"
          >
            <div class="flex gap-2 items-center justify-center text-zinc-200">
              <button
                @click.prevent=""
                class="bg-zinc-800 p-2 flex items-center justify-center rounded-full hover:cursor-pointer hover:scale-95 hover:bg-zinc-500"
              >
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
                  class="lucide lucide-github h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
                  ></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </button>
              <button
                @click.prevent=""
                class="hover:cursor-pointer bg-zinc-800 rounded-full p-2 flex items-center justify-center hover:scale-95 hover:bg-zinc-700"
              >
                <TvMinimal size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <h2 class="text-2xl font-bold leading-tight text-[var(--fg)]">
          {{ project.title }}
        </h2>
        <p class="mt-3 line-clamp-2 text-base leading-7 text-[var(--muted)]">
          {{ project.summary || project.content }}
        </p>

        <div v-if="project.tags?.length" class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in project.tags.slice(0, 4)"
            :key="tag.id"
            class="rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>
    </article>
  </RouterLink>
</template>

<style scoped>
.project-card {
  display: block;
  transform-style: preserve-3d;
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  --lift: 0px;
  transition:
    transform 120ms ease,
    filter 220ms ease;
  transform: perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))
    translateY(var(--lift));
  will-change: transform;
}

.project-card:hover {
  filter: brightness(1.08);
}
</style>
