import { onScopeDispose, ref, watch } from 'vue'

export function useDebouncedValue(source, delay = 400) {
  const debouncedValue = ref(source.value)

  let timer = null

  watch(source, (value) => {
    clearTimeout(timer)

    timer = setTimeout(() => {
      debouncedValue.value = value
    }, delay)
  })

  onScopeDispose(() => {
    clearTimeout(timer)
  })

  return debouncedValue
}
