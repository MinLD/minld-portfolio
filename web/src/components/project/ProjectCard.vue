<script setup>
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
  <article class="group project-card" @pointermove="updateTilt" @pointerleave="resetTilt">
    <div class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div class="relative aspect-[16/9] overflow-hidden bg-zinc-900">
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
      </div>
    </div>

    <div class="mt-5">
      <h2 class="text-2xl font-bold leading-tight text-zinc-100">
        {{ project.title }}
      </h2>
      <p class="mt-3 line-clamp-2 text-base leading-7 text-zinc-500">
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
