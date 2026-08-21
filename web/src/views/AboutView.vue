<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AboutProgressDots from '@/components/about/AboutProgressDots.vue'
import AboutSection from '@/components/about/AboutSection.vue'
import AboutVisualRail from '@/components/about/AboutVisualRail.vue'
import { aboutSections } from '@/config/about/content'
import LayoutContainer from '@/layouts/LayoutContainer.vue'

const activeId = ref(aboutSections[0].id)
let observer

const activeSection = computed(
  () => aboutSections.find((section) => section.id === activeId.value) || aboutSections[0],
)

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible) activeId.value = visible.target.dataset.aboutSection
    },
    { rootMargin: '-35% 0px -35% 0px', threshold: [0.2, 0.45, 0.7] },
  )

  document.querySelectorAll('[data-about-section]').forEach((section) => observer.observe(section))
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="bg-[#111111]">
    <LayoutContainer>
      <div class="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <AboutVisualRail :section="activeSection" />

        <main>
          <AboutSection v-for="section in aboutSections" :key="section.id" :section="section" />
        </main>
      </div>
    </LayoutContainer>

    <AboutProgressDots :sections="aboutSections" :active-id="activeId" />
  </div>
</template>
