import { computed, ref, watch } from 'vue'

const storageKey = 'minld-theme'
const modes = new Set(['system', 'light', 'dark'])
const hasDOM = typeof window !== 'undefined' && typeof document !== 'undefined'
const mediaQuery = hasDOM ? window.matchMedia('(prefers-color-scheme: dark)') : null

function storedTheme() {
  if (!hasDOM) return 'dark'
  try {
    const value = localStorage.getItem(storageKey)
    return modes.has(value) ? value : 'dark'
  } catch {
    return 'dark'
  }
}

const theme = ref(storedTheme())
const systemTheme = ref(mediaQuery?.matches ? 'dark' : 'light')
const resolvedTheme = computed(() => (theme.value === 'system' ? systemTheme.value : theme.value))
const isLight = computed(() => resolvedTheme.value === 'light')

function applyTheme() {
  if (!hasDOM) return
  document.documentElement.dataset.theme = resolvedTheme.value
  document.documentElement.dataset.themePreference = theme.value
  document.documentElement.style.colorScheme = resolvedTheme.value
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolvedTheme.value === 'light' ? '#fafafa' : '#111111')
}

function setTheme(value) {
  if (!modes.has(value)) return
  theme.value = value
  try {
    if (hasDOM) localStorage.setItem(storageKey, value)
  } catch {
    // Storage can be disabled in private/browser-policy contexts.
  }
}

function toggleTheme() {
  setTheme(resolvedTheme.value === 'light' ? 'dark' : 'light')
}

mediaQuery?.addEventListener('change', (event) => {
  systemTheme.value = event.matches ? 'dark' : 'light'
})

watch([theme, systemTheme], applyTheme, { immediate: true })

export function useTheme() {
  return { theme, resolvedTheme, isLight, setTheme, toggleTheme }
}
