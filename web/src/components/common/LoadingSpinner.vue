<script setup>
defineProps({
  size: {
    type: String,
    default: 'size-5',
  },
})
</script>

<template>
  <span
    class="inline-block animate-spin rounded-full border-2 border-current border-r-transparent"
    :class="size"
  />
</template>
