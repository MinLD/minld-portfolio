<script setup>
import { ArrowLeft, Download } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import LayoutContainer from '@/layouts/LayoutContainer.vue'
import resumeUrl from '@/assets/resume/CV_Đỗ Đặng Minh Luân_Frontend.pdf'
import resumePreviewUrl from '@/assets/resume/cv-preview.png'

const router = useRouter()
</script>

<template>
  <main class="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#151515] text-zinc-100">
    <InteractiveNetwork :density="1.1" />

    <LayoutContainer>
      <div class="relative z-10 py-10 lg:py-20">
      <div class="mb-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="inline-flex size-10 items-center justify-center rounded-full text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            aria-label="Go back"
            @click="router.back()"
          >
            <ArrowLeft :size="20" />
          </button>
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Resume</h1>
        </div>

        <a
          :href="resumeUrl"
          download="CV_Do_Dang_Minh_Luan_Frontend.pdf"
          class="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          <Download :size="16" />
          Download CV
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
