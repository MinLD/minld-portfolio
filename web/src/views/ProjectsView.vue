<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { listProjectsApi } from '@/api/project'
import { listProjectTagsApi } from '@/api/project-tag'
import ProjectCard from '@/components/project/ProjectCard.vue'
import ProjectCardSkeleton from '@/components/project/ProjectCardSkeleton.vue'
import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import HeaderProject from '../components/project/HeaderProject.vue'
import LayoutContainer from '../layouts/LayoutContainer.vue'
import { useDebouncedValue } from '../composables/useDebouncedValue.js'
import { useI18n } from '@/composables/useI18n'
import PaginationComponent from '../components/about/PaginationComponent.vue'

const tags = ref([])
const search = reactive({
  keyword: undefined,
  keyTags: '',
})
const keyWordRef = computed(() => search.keyword)
const debouncedKeyword = useDebouncedValue(keyWordRef, 400)
const projects = ref([])
const { t } = useI18n()
const isFetchingProjectTags = ref(false)
async function getTags() {
  isFetchingProjectTags.value = true

  try {
    tags.value = await listProjectTagsApi()
  } catch (error) {
    console.error('project tags api error:', error)
  } finally {
    isFetchingProjectTags.value = false
  }
}
const isFetchingProjects = ref(false)
const pagination = reactive({
  page: 1,
  limit: 5,
  total: undefined,
})
const showProjectSkeleton = computed(() => isFetchingProjects.value && projects.value.length === 0)
async function fetchProjects() {
  isFetchingProjects.value = true

  try {
    const response = await listProjectsApi({
      search: debouncedKeyword.value || undefined,
      tag: search.keyTags || undefined,
      page: pagination.page,
      limit: pagination.limit,
    })
    projects.value = response.data.projects
    pagination.total = response.meta.totalPages
    console.log('projects api response:', response)
  } catch (error) {
    console.error('projects api error:', error)
  } finally {
    isFetchingProjects.value = false
  }
}
function handlePageChange(page) {
  pagination.page = page
}
function updateSearch(nextSearch) {
  Object.assign(search, nextSearch)
}
watch(
  [debouncedKeyword, () => search.keyTags],
  ([nextKeyword, nextTag], [oldKeyword, oldTag] = []) => {
    if (nextKeyword !== oldKeyword || nextTag !== oldTag) {
      pagination.page = 1
    }
  },
)
watch(
  [debouncedKeyword, () => search.keyTags, () => pagination.page],
  () => {
    fetchProjects()
  },
  { immediate: true },
)
onMounted(() => {
  getTags()
})
</script>

<template>
  <div class="relative">
    <InteractiveNetwork :density="2.6" />

    <LayoutContainer>
      <div class="relative z-10">
        <HeaderProject
          :tags="tags"
          :search="search"
          :loading-tags="isFetchingProjectTags"
          @update:search="updateSearch"
        />
      </div>

      <section class="relative z-10 pb-24">
        <p class="mb-4 font-mono text-xs tracking-[0.24em] text-zinc-600">01</p>
        <h2 class="mb-6 text-3xl font-bold text-[var(--fg)]">{{ t('projects.featured') }}</h2>

        <div
          class="grid w-full gap-x-8 gap-y-12 transition-opacity duration-200 md:grid-cols-2"
          :class="{ 'opacity-60': isFetchingProjects && projects.length }"
        >
          <template v-if="showProjectSkeleton">
            <ProjectCardSkeleton v-for="index in 4" :key="`project-skeleton-${index}`" />
          </template>
          <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
        </div>

        <PaginationComponent
          :page="pagination.page"
          :limit="pagination.limit"
          :total-pages="pagination.total"
          @change="handlePageChange"
        />
      </section>
    </LayoutContainer>
  </div>
</template>
