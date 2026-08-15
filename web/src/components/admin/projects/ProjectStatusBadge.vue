<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const statusConfig = computed(() => {
  const configs = {
    PUBLISHED: {
      label: 'Published',
      class: 'bg-emerald-950/60 text-emerald-500',
      dot: 'bg-emerald-500',
    },

    DRAFT: {
      label: 'Draft',
      class: 'bg-amber-950/50 text-amber-500',
      dot: 'bg-amber-500',
    },
    ARCHIVED: {
      label: 'Archived',
      class: 'bg-zinc-800 text-zinc-400',
      dot: 'bg-zinc-500',
    },
  }

  return (
    configs[props.status] ?? {
      label: props.status,
      class: 'bg-zinc-800 text-zinc-400',
      dot: 'bg-zinc-500',
    }
  )
})
</script>
<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
    :class="statusConfig.class"
  >
    <span class="size-1.5 rounded-full" :class="statusConfig.dot" />

    {{ statusConfig.label }}
  </span>
</template>
