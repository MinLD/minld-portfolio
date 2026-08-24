<script setup>
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  spinnerSize: { type: String, default: 'size-4' },
})
</script>

<template>
  <button :type="type" :disabled="disabled || loading">
    <LoadingSpinner v-if="loading" :size="spinnerSize" />
    <slot />
  </button>
</template>
