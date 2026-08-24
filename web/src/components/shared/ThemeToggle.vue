<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, Monitor, Moon, Sun } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'
import { useTheme } from '@/composables/useTheme'

const { theme, resolvedTheme, setTheme } = useTheme()
const { t } = useI18n()
const open = ref(false)
const rootRef = ref(null)

const options = [
  { value: 'system', labelKey: 'theme.system', icon: Monitor },
  { value: 'light', labelKey: 'theme.light', icon: Sun },
  { value: 'dark', labelKey: 'theme.dark', icon: Moon },
]

const activeIcon = computed(() => (resolvedTheme.value === 'light' ? Sun : Moon))

function choose(value) {
  setTheme(value)
  open.value = false
}

function closeOnOutsideClick(event) {
  if (!rootRef.value?.contains(event.target)) open.value = false
}

onMounted(() => document.addEventListener('pointerdown', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsideClick))
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="inline-flex size-10 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
      :aria-expanded="open"
      :aria-label="t('theme.label')"
      @click="open = !open"
    >
      <component :is="activeIcon" :size="20" />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1 shadow-xl shadow-black/20"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
        :class="theme === option.value && 'text-[var(--fg)]'"
        @click="choose(option.value)"
      >
        <component :is="option.icon" :size="16" />
        <span class="flex-1">{{ t(option.labelKey) }}</span>
        <Check v-if="theme === option.value" :size="15" />
      </button>
    </div>
  </div>
</template>
