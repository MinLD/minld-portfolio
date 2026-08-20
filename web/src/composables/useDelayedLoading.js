import { onScopeDispose, ref, watch } from 'vue'

export function useDelayedLoading(source, { delay = 80, minDuration = 300 } = {}) {
  const visible = ref(false)

  let showTimer = null
  let hideTimer = null
  let shownAt = 0

  function clearShowTimer() {
    clearTimeout(showTimer)
    showTimer = null
  }

  function clearHideTimer() {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  function show() {
    clearHideTimer()

    if (visible.value) {
      return
    }

    clearShowTimer()

    showTimer = setTimeout(() => {
      if (!source.value) {
        return
      }

      visible.value = true
      shownAt = Date.now()
    }, delay)
  }

  function hide() {
    clearShowTimer()

    if (!visible.value) {
      return
    }

    const elapsed = Date.now() - shownAt

    const remaining = Math.max(0, minDuration - elapsed)

    clearHideTimer()

    hideTimer = setTimeout(() => {
      visible.value = false
      shownAt = 0
    }, remaining)
  }

  watch(
    source,
    (loading) => {
      if (loading) {
        show()
      } else {
        hide()
      }
    },
    {
      immediate: true,
    },
  )

  onScopeDispose(() => {
    clearShowTimer()
    clearHideTimer()
  })

  return visible
}
