<script setup>
import { useRouteProgress } from '@/composables/useRouteProgress'

const { isRouteLoading, progress } = useRouteProgress()
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
    aria-hidden="true"
  >
    <div
      class="h-full bg-[var(--action-bg)] shadow-[0_0_12px_var(--action-bg)] transition-all duration-200 ease-out"
      :class="{ 'opacity-100': isRouteLoading, 'opacity-0': !isRouteLoading }"
      :style="{ width: `${progress}%` }"
    ></div>
  </div>
</template>
