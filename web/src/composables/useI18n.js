import { computed, ref } from 'vue'
import { messages } from '@/i18n/messages'

const storageKey = 'minld-locale'
const supportedLocales = ['vi', 'en']

function initialLocale() {
  try {
    const stored = localStorage.getItem(storageKey)
    if (supportedLocales.includes(stored)) return stored
  } catch {
    // Storage can be disabled by browser policy.
  }

  const browserLocale = navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en'
  return browserLocale
}

const locale = ref(initialLocale())

function readMessage(path, targetLocale) {
  return path.split('.').reduce((node, key) => node?.[key], messages[targetLocale])
}

function setLocale(value) {
  if (!supportedLocales.includes(value)) return
  locale.value = value
  document.documentElement.lang = value
  try {
    localStorage.setItem(storageKey, value)
  } catch {
    // Storage can be disabled by browser policy.
  }
}

setLocale(locale.value)

export function useI18n() {
  const currentLocale = computed(() => locale.value)

  function t(path) {
    return readMessage(path, locale.value) ?? readMessage(path, 'en') ?? path
  }

  return { locale: currentLocale, setLocale, t, supportedLocales }
}
