<script setup>
import { ArrowLeft, Download } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import { useI18n } from '@/composables/useI18n'
import LayoutContainer from '@/layouts/LayoutContainer.vue'
import resumeUrl from '@/assets/resume/CV_Đỗ Đặng Minh Luân_Frontend.pdf'
import resumePreviewUrl from '@/assets/resume/cv-preview.png'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <main class="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[var(--page)] text-[var(--fg)]">
    <InteractiveNetwork :density="1.1" />

    <LayoutContainer>
      <div class="relative z-10 py-10 lg:py-20">
      <div class="mb-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="inline-flex size-10 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            :aria-label="t('resume.back')"
            @click="router.back()"
          >
            <ArrowLeft :size="20" />
          </button>
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ t('resume.title') }}</h1>
        </div>

        <a
          :href="resumeUrl"
          download="CV_Do_Dang_Minh_Luan_Frontend.pdf"
          class="inline-flex items-center gap-2 rounded-lg bg-[var(--action-bg)] px-4 py-2 text-sm font-medium text-[var(--action-fg)] transition hover:bg-[var(--action-hover)]"
        >
          <Download :size="16" />
          {{ t('resume.download') }}
        </a>
      </div>

      <section class="overflow-hidden rounded-[1.75rem] bg-white">
        <img
          :src="resumePreviewUrl"
          alt="Luân Đỗ frontend CV"
          class="block h-auto w-full"
        />
      </section>
      </div>
    </LayoutContainer>
  </main>
</template>
