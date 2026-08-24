<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import AboutProgressDots from '@/components/about/AboutProgressDots.vue'
import AboutSection from '@/components/about/AboutSection.vue'
import AboutVisualRail from '@/components/about/AboutVisualRail.vue'
import { useI18n } from '@/composables/useI18n'
import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import { aboutContent } from '@/config/about/content'

const { locale } = useI18n()
const aboutSections = computed(() => aboutContent[locale.value] ?? aboutContent.en)
const activeId = ref(aboutSections.value[0].id)
const scrollArea = ref(null)
let frameId = 0

const activeSection = computed(
  () =>
    aboutSections.value.find((section) => section.id === activeId.value) || aboutSections.value[0],
)

function updateActiveSection() {
  frameId = 0

  const area = scrollArea.value
  if (!area) return

  const scrollTarget = area.scrollTop + area.clientHeight * 0.38
  const current = [...aboutSections.value].reverse().find((section) => {
    const element = document.getElementById(section.id)
    return element && element.offsetTop <= scrollTarget
  })

  if (current) activeId.value = current.id
}

function requestActiveSectionUpdate() {
  if (!frameId) frameId = requestAnimationFrame(updateActiveSection)
}

function scrollToSection(sectionId, behavior = 'smooth') {
  const area = scrollArea.value
  const element = document.getElementById(sectionId)
  if (!area || !element) return

  area.scrollTo({ top: element.offsetTop, behavior })
  activeId.value = sectionId
}

onMounted(() => {
  const initialTarget = window.location.hash.replace('#', '')
  if (initialTarget) scrollToSection(initialTarget, 'auto')

  updateActiveSection()
  scrollArea.value?.addEventListener('scroll', requestActiveSectionUpdate, { passive: true })
})

watch(locale, () => {
  if (!aboutSections.value.some((section) => section.id === activeId.value)) {
    activeId.value = aboutSections.value[0].id
  }
})

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId)
  scrollArea.value?.removeEventListener('scroll', requestActiveSectionUpdate)
})
</script>

<template>
  <div
    ref="scrollArea"
    class="relative h-[calc(100dvh-4rem)] overflow-y-auto scroll-smooth bg-[var(--page)] text-[var(--fg)] [scroll-snap-type:y_proximity]"
  >
    <InteractiveNetwork :density="1.6" />

    <AboutVisualRail :section="activeSection" :sections="aboutSections" />

    <AboutProgressDots :sections="aboutSections" :active-id="activeId" @select="scrollToSection" />

    <main class="relative z-10 min-w-0 lg:ml-[39.5vw]">
      <AboutSection v-for="section in aboutSections" :key="section.id" :section="section" />
    </main>
  </div>
</template>
