<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, Languages } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'

const { locale, setLocale, t } = useI18n()
const open = ref(false)
const rootRef = ref(null)

const options = [
  { value: 'vi', labelKey: 'language.vi' },
  { value: 'en', labelKey: 'language.en' },
]

function choose(value) {
  setLocale(value)
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
      class="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
      :aria-expanded="open"
      :aria-label="t('language.label')"
      @click="open = !open"
    >
      <Languages :size="18" />
      <span class="uppercase">{{ locale }}</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1 shadow-xl shadow-black/20"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
        :class="locale === option.value && 'text-[var(--fg)]'"
        @click="choose(option.value)"
      >
        <span class="flex-1">{{ t(option.labelKey) }}</span>
        <Check v-if="locale === option.value" :size="15" />
      </button>
    </div>
  </div>
</template>
