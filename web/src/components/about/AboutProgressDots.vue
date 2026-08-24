<script setup>
defineProps({
  sections: {
    type: Array,
    required: true,
  },
  activeId: {
    type: String,
    required: true,
  },
})

defineEmits(['select'])
</script>

<template>
  <nav
    class="sticky top-1/2 z-30 ml-auto mr-8 hidden h-0 w-fit -translate-y-1/2 flex-col items-end gap-7 xl:flex"
  >
    <a
      v-for="section in sections"
      :key="section.id"
      :href="`#${section.id}`"
      class="group flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em] transition"
      :class="activeId === section.id ? 'text-[var(--fg)]' : 'text-transparent hover:text-[var(--muted)]'"
      :aria-label="section.label"
      @click.prevent="$emit('select', section.id)"
    >
      <span>{{ section.label }}</span>
      <span
        class="size-2 rounded-full transition"
        :class="
          activeId === section.id
            ? 'bg-[var(--fg)] ring-4 ring-[color-mix(in_srgb,var(--fg)_18%,transparent)]'
            : 'bg-[var(--muted)] group-hover:bg-[var(--soft)]'
        "
      ></span>
    </a>
  </nav>
</template>
