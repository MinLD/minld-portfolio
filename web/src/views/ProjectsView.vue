<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { listProjectsApi } from '@/api/project'
import { listProjectTagsApi } from '@/api/project-tag'
import ProjectCard from '@/components/project/ProjectCard.vue'
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
async function getTags() {
  tags.value = await listProjectTagsApi()
}
const isLoadingLoadData = ref(false)
const pagination = reactive({
  page: 1,
  limit: 5,
  total: undefined,
})
async function fetchProject(payload) {
  isLoadingLoadData.value = true

  try {
    const response = await listProjectsApi({
      search: payload.keyword || undefined,
      tag: payload.keyTags || undefined,
      page: pagination.page,
      limit: pagination.limit,
    })
    projects.value = response.data.projects
    pagination.total = response.meta.totalPages
    console.log('projects api response:', response)
  } catch (error) {
    console.error('projects api error:', error)
  } finally {
    isLoadingLoadData.value = false
  }
}
function handlePageChange(page) {
  pagination.page = page
}
watch(() => pagination.page, fetchProject, { immediate: true })
function updateSearch(nextSearch) {
  Object.assign(search, nextSearch)
}
watch(
  [debouncedKeyword, () => search.keyTags],
  () => {
    console.log('call api với 2 thuộc tính: ', debouncedKeyword.value, search.keyTags)
    const payload = {
      keyword: debouncedKeyword.value,
      keyTags: search.keyTags,
    }
    fetchProject(payload)
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
        <HeaderProject :tags="tags" :search="search" @update:search="updateSearch" />
      </div>

      <section class="relative z-10 pb-24">
        <p class="mb-4 font-mono text-xs tracking-[0.24em] text-zinc-600">01</p>
        <h2 class="mb-6 text-3xl font-bold text-[var(--fg)]">{{ t('projects.featured') }}</h2>

        <div class="grid w-full gap-x-8 gap-y-12 md:grid-cols-2">
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
