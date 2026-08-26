<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { cloudinaryImage, cloudinarySrcSet } from '@/utils/cloudinary'
import { listMomentCategoriesApi, listMomentsApi, listMomentTagsApi } from '@/api/moment'
import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import HeaderGallery from '../components/gallery/HeaderGallery.vue'
import LayoutContainer from '../layouts/LayoutContainer.vue'
import GalleryCart from '../components/gallery/GalleryCart.vue'
import GallerySkeleton from '@/components/gallery/GallerySkeleton.vue'
import { Grid2x2, Grid3x3, TableOfContents } from 'lucide-vue-next'
import GalleryPreview from '../components/gallery/GalleryPreview.vue'

const tags = ref([])
const categories = ref([])
const galleries = ref([])

const search = reactive({
  keyCategory: '',
  keyTags: '',
})

const viewMode = ref('locket')

const isFetchingMomentTags = ref(false)
const isFetchingMomentCategories = ref(false)
const isFetchingGalleries = ref(false)

const loadMoreTrigger = ref(null)

let observer = null

const pagination = reactive({
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 0,
})

let galleriesRequestId = 0
const previewVisible = ref(false)
const previewIndex = ref(0)
watch(previewVisible, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
function openPreview(index) {
  previewIndex.value = index
  previewVisible.value = true
}

const viewOptions = [
  {
    value: 'locket',
    icon: Grid2x2,
    label: 'Locket',
  },
  {
    value: 'grid-3',
    icon: Grid3x3,
    label: 'Grid 3',
  },
  {
    value: 'grid-2',
    icon: TableOfContents,
    label: 'Grid 2',
  },
]

const galleryItems = computed(() =>
  galleries.value.flatMap((gallery) =>
    (gallery.images || []).map((image) => ({
      ...image,
      content: gallery.content,
      tags: gallery.tags,
      thumbnailUrl: cloudinaryImage(image.url, 640),

      thumbnailSrcSet: cloudinarySrcSet(image.url, [320, 480, 640, 960]),

      previewUrl: cloudinaryImage(image.url, 1920),
    })),
  ),
)

const hasMore = computed(() => {
  return pagination.page < pagination.totalPages
})

async function getTags() {
  isFetchingMomentTags.value = true

  try {
    tags.value = await listMomentTagsApi()
  } catch (error) {
    console.error('moment tags api error:', error)
  } finally {
    isFetchingMomentTags.value = false
  }
}

async function getCategories() {
  isFetchingMomentCategories.value = true

  try {
    categories.value = await listMomentCategoriesApi()
  } catch (error) {
    console.error('moment categories api error:', error)
  } finally {
    isFetchingMomentCategories.value = false
  }
}

async function getGalleries({ reset = false, page = pagination.page } = {}) {
  if (isFetchingGalleries.value) return false

  const requestId = ++galleriesRequestId

  isFetchingGalleries.value = true

  try {
    const response = await listMomentsApi({
      page,
      limit: pagination.limit,
      category: search.keyCategory || undefined,
      tag: search.keyTags || undefined,
    })

    if (requestId !== galleriesRequestId) {
      return false
    }

    if (reset) {
      galleries.value = response.data.moments
    } else {
      galleries.value.push(...response.data.moments)
    }

    pagination.page = page
    pagination.total = response.meta.total
    pagination.totalPages = response.meta.totalPages

    return true
  } catch (error) {
    console.error('moments api error:', error)

    return false
  } finally {
    if (requestId === galleriesRequestId) {
      isFetchingGalleries.value = false
    }
  }
}

async function loadMore() {
  if (isFetchingGalleries.value) return
  if (!hasMore.value) return

  const nextPage = pagination.page + 1

  await getGalleries({
    page: nextPage,
  })
}

function updateSearch(nextSearch) {
  Object.assign(search, nextSearch)
}

watch(
  () => search.keyTags,
  async () => {
    pagination.page = 1
    pagination.total = 0
    pagination.totalPages = 0

    await getGalleries({
      reset: true,
    })
  },
)

watch(
  () => search.keyCategory,
  async () => {
    pagination.page = 1
    pagination.total = 0
    pagination.totalPages = 0

    await getGalleries({
      reset: true,
    })
  },
)

onMounted(async () => {
  getCategories()
  getTags()

  await getGalleries({
    reset: true,
  })
  await nextTick()

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        loadMore()
      }
    },
    {
      root: null,
      rootMargin: '400px 0px',
      threshold: 0,
    },
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  observer?.disconnect()
})
</script>

<template>
  <div class="relative min-h-screen">
    <LayoutContainer>
      <InteractiveNetwork :density="2.6" />

      <div class="relative z-10">
        <HeaderGallery
          :search="search"
          :categories="categories"
          :tags="tags"
          :loading-categories="isFetchingMomentCategories"
          :loading-tags="isFetchingMomentTags"
          @update:search="updateSearch"
        />

        <!-- View mode -->
        <div class="mb-5 flex w-full justify-end">
          <div class="flex items-center justify-center gap-3">
            <div class="mx-1 h-7 w-px bg-zinc-700" />

            <div class="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--panel)]/80 p-1">
              <button
                v-for="option in viewOptions"
                :key="option.value"
                type="button"
                class="flex size-9 items-center justify-center rounded-md transition"
                :class="
                  viewMode === option.value
                    ? 'bg-[var(--action-bg)] text-[var(--action-fg)]'
                    : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]'
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
        <GallerySkeleton
          v-if="isFetchingGalleries && galleryItems.length === 0"
          :count="8"
          :view-mode="viewMode"
        />

        <template v-else>
          <div
            class="transition-opacity duration-200"
            :class="[
              viewMode === 'grid-2' && 'columns-2 gap-2 space-y-2 sm:columns-3',

              viewMode === 'grid-3' && 'grid grid-cols-4 gap-2',

              viewMode === 'locket' && 'grid grid-cols-2 gap-2',
            ]"
          >
            <GalleryCart
              v-for="(item, index) in galleryItems"
              :key="item.id"
              :item="item"
              :view-mode="viewMode"
              class="cursor-pointer"
              @click="openPreview(index)"
            />
          </div>

          <GallerySkeleton
            v-if="isFetchingGalleries && galleryItems.length > 0"
            :count="4"
            :view-mode="viewMode"
            class="mt-2"
          />

          <div ref="loadMoreTrigger" class="h-10 w-full" aria-hidden="true" />

          <div
            v-if="!isFetchingGalleries && !hasMore && galleryItems.length > 0"
            class="py-8 text-center text-sm text-[var(--muted)]"
          >
            No more photos
          </div>

          <a-empty
            v-if="!isFetchingGalleries && galleryItems.length === 0"
            description="No Galleries found"
          />
        </template>

        <GalleryPreview
          v-if="previewVisible"
          :items="galleryItems"
          v-model:open="previewVisible"
          v-model:current-index="previewIndex"
        />
      </section>
    </LayoutContainer>
  </div>
</template>
