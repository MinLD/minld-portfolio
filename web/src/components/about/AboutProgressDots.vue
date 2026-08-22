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
      :class="activeId === section.id ? 'text-zinc-100' : 'text-transparent hover:text-zinc-500'"
      :aria-label="section.label"
      @click.prevent="$emit('select', section.id)"
    >
      <span>{{ section.label }}</span>
      <span
        class="size-2 rounded-full transition"
        :class="
          activeId === section.id
            ? 'bg-white ring-4 ring-white/15'
            : 'bg-zinc-700 group-hover:bg-zinc-400'
        "
      ></span>
    </a>
  </nav>
</template>
