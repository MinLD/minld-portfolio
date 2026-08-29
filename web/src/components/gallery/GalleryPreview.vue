<script setup>
import { ChevronLeft, ChevronRight, Download, Pause, Play, Share2, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  items: {
    type: Array,
    default: () => [],
  },

  currentIndex: {
    type: Number,
    default: 0,
  },
})
const emit = defineEmits(['update:open', 'update:currentIndex'])

const imageLoading = ref(false)
const isPlaying = ref(false)
let playTimer = null

function handleImageLoaded() {
  imageLoading.value = false
}

const currentItem = computed(() => {
  return props.items[props.currentIndex] ?? null
})
const closePreview = () => {
  stopSlideshow()
  emit('update:open', false)
}

function updateIndex(index) {
  if (!props.items.length) return
  emit('update:currentIndex', (index + props.items.length) % props.items.length)
  imageLoading.value = true
}

function stopSlideshow() {
  isPlaying.value = false
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

function toggleSlideshow() {
  if (isPlaying.value) {
    stopSlideshow()
    return
  }

  if (props.items.length < 2) return

  isPlaying.value = true
  playTimer = setInterval(() => {
    updateIndex(props.currentIndex + 1)
  }, 2500)
}

function downloadImage() {
  const url = currentItem.value?.url || currentItem.value?.previewUrl
  if (!url) return

  const link = document.createElement('a')
  link.href = url.includes('/upload/') ? url.replace('/upload/', '/upload/fl_attachment/') : url
  link.download = currentItem.value?.altText || currentItem.value?.id || 'moment-image'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

async function shareImage() {
  const url = currentItem.value?.previewUrl || currentItem.value?.url
  if (!url) return

  if (navigator.share) {
    await navigator.share({
      title: currentItem.value?.content || 'Moment image',
      url,
    })
    return
  }

  await navigator.clipboard?.writeText(url)
}

function handleKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') closePreview()
  if (event.key === 'ArrowLeft') updateIndex(props.currentIndex - 1)
  if (event.key === 'ArrowRight') updateIndex(props.currentIndex + 1)
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  stopSlideshow()
  window.removeEventListener('keydown', handleKeydown)
})
</script>
<template>
  <Teleport to="body">
    <Transition name="preview">
      <div
        v-if="open && currentItem"
        class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/75 backdrop-blur-xl"
        @click.self="closePreview"
      >
        <div
          class="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-3xl"
          :style="{ backgroundImage: `url(${currentItem.thumbnailUrl})` }"
        />
        <div
          class="relative z-10 flex h-[85vh] w-[90vw] max-w-7xl items-center justify-center overflow-hidden rounded-2xl"
        >
          <div v-if="imageLoading" class="absolute inset-0 animate-pulse bg-zinc-800" />

          <img
            :key="currentItem.id"
            :src="currentItem.previewUrl"
            :alt="currentItem.altText || currentItem.content"
            class="max-h-full max-w-full object-contain transition-opacity duration-300"
            :class="imageLoading ? 'opacity-0' : 'opacity-100'"
            @load="handleImageLoaded"
          />
          <div class="absolute right-4 top-4 z-30 flex items-center justify-center">
            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full bg-zinc-600 text-white backdrop-blur-xl hover:bg-black/70"
              @click="closePreview"
            >
              <X :size="20" />
            </button>
          </div>
          <div
            class="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-4"
          >
            <button
              type="button"
              class="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/70"
              @click="updateIndex(currentIndex - 1)"
            >
              <ChevronLeft :size="20" />
            </button>

            <button
              type="button"
              class="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/70"
              @click="updateIndex(currentIndex + 1)"
            >
              <ChevronRight :size="20" />
            </button>
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <p class="font-medium text-justify px-3 text-white text-md line-clamp-2">
              {{ currentItem?.content }}
            </p>
            <p class="rounded-full px-3 py-1 text-sm text-white/70">
              {{ currentIndex + 1 }} / {{ items.length }}
            </p>
          </div>
          <div
            class="absolute bottom-4 right-4 flex-col sm:flex-row sm:flex items-center gap-5 z-20"
          >
            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/70"
              :aria-label="isPlaying ? 'Pause slideshow' : 'Play slideshow'"
              @click="toggleSlideshow"
            >
              <Pause v-if="isPlaying" :size="17" />
              <Play v-else :size="17" />
            </button>

            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/70"
              aria-label="Download image"
              @click="downloadImage"
            >
              <Download :size="17" />
            </button>

            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/70"
              aria-label="Share image"
              @click="shareImage"
            >
              <Share2 :size="17" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
