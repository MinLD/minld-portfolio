import { computed, ref } from 'vue'

const activeCount = ref(0)
const progress = ref(0)
let timer = null

function clearTimer() {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

export function startRouteProgress() {
  if (activeCount.value === 0) {
    activeCount.value = 1
    progress.value = 12
    clearTimer()
    timer = window.setInterval(() => {
      progress.value = Math.min(progress.value + (100 - progress.value) * 0.12, 88)
    }, 180)
  }
}

export function finishRouteProgress() {
  if (activeCount.value === 0 && progress.value === 0) {
    return
  }

  activeCount.value = 0
  clearTimer()
  progress.value = 100
  window.setTimeout(() => {
    if (activeCount.value === 0) {
      progress.value = 0
    }
  }, 180)
}

export function useRouteProgress() {
  return {
    isRouteLoading: computed(() => progress.value > 0),
    progress,
  }
}
