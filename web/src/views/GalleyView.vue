<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

import { listMomentsApi, listMomentTagsApi } from '@/api/moment'
import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import HeaderGallery from '../components/gallery/HeaderGallery.vue'
import LayoutContainer from '../layouts/LayoutContainer.vue'
import GalleryCart from '../components/gallery/GalleryCart.vue'
import { Grid2x2, Grid3x3, TableOfContents } from 'lucide-vue-next'

const tags = ref([])
const galleries = ref([])
const search = reactive({ keyTags: '' })
const viewMode = ref('locket')

const viewOptions = [
  { value: 'locket', icon: Grid2x2, label: 'Locket' },
  { value: 'grid-3', icon: Grid3x3, label: 'Grid 3' },
  { value: 'grid-2', icon: TableOfContents, label: 'Grid 2' },
]

const visibleGalleries = computed(() => {
  if (!search.keyTags) return galleries.value

  return galleries.value.filter((gallery) =>
    gallery.tags?.some((tag) => tag.slug === search.keyTags),
  )
})

const galleryItems = computed(() =>
  visibleGalleries.value.flatMap((gallery) =>
    (gallery.images || []).map((image) => ({
      ...image,
      content: gallery.content,
      tags: gallery.tags,
    })),
  ),
)

async function getTags() {
  tags.value = await listMomentTagsApi()
}

async function getGalleries() {
  galleries.value = await listMomentsApi()
}
function updateSearch(nextSearch) {
  Object.assign(search, nextSearch)
}

onMounted(() => {
  getTags()
  getGalleries()
})
</script>

<template>
  <div class="relative min-h-screen">
    <LayoutContainer>
      <InteractiveNetwork :density="2.6" />
      <div class="relative z-10">
        <HeaderGallery :search="search" :tags="tags" @update:search="updateSearch" />
        <div class="w-full flex justify-end mb-5">
          <div class="flex items-center justify-center gap-3">
            <div class="w-px h-7 bg-zinc-700 mx-1" />
            <div class="flex shrink-0 items-center gap-1 rounded-lg bg-zinc-900/80 p-1">
              <button
                v-for="option in viewOptions"
                :key="option.value"
                type="button"
                class="flex size-9 items-center justify-center rounded-md transition"
                :class="
                  viewMode === option.value
                    ? 'bg-white text-zinc-950'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                "
                :aria-label="option.label"
                @click="viewMode = option.value"
              >
                <component :is="option.icon" :size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <section class="relative z-10 mx-auto pb-24">
        <div
          :class="[
            viewMode === 'grid-2' && 'columns-2 gap-2 sm:columns-3',
            viewMode === 'grid-3' && 'grid grid-cols-4 gap-2',
            viewMode === 'locket' && 'grid grid-cols-2 gap-2',
          ]"
        >
          <GalleryCart
            v-for="item in galleryItems"
            :key="item.id"
            :item="item"
            :view-mode="viewMode"
          />
        </div>
      </section>
    </LayoutContainer>
  </div>
</template>
