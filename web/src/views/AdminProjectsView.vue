<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import ProjectToolbar from '@/components/admin/projects/ProjectToolbar.vue'
import ProjectTable from '@/components/admin/projects/ProjectTable.vue'
import ProjectFormModal from '@/components/admin/projects/ProjectFormModal.vue'
import {
  createProject,
  deleteProject,
  getProjectRelations,
  getProjects,
  updateProject,
} from '@/services/admin-project.service'
import { projectTagService } from '@/services/project-tag.service'
import { technologyService } from '@/services/technology.service'
import { toast } from 'vue3-toastify'
import axios from 'axios'
import DeleteProjectModal from '../components/admin/projects/DeleteProjectModal.vue'
import ProjectPagination from '../components/admin/projects/ProjectPagination.vue'

const projects = ref([])
const tags = ref([])
const technologies = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const status = ref('all')
const page = ref(1)
const limit = ref(5)
const pagination = ref({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 0,
})
const editingProject = ref(null)
const showForm = ref(false)
const newTagName = ref('')
const newTechnologyName = ref('')
const newTechnologyType = ref('FRAMEWORK')
const isLoadingCreate = ref(false)
const isDeleting = ref(false)
const showFormDelete = ref(false)
const deletingProject = ref(null)
function messageFromError(err, fallback) {
  return axios.isAxiosError(err) ? err.response?.data?.error?.message || fallback : fallback
}
async function changePage(newPage) {
  if (newPage < 1) return
  if (newPage > pagination.value.totalPages) return
  if (newPage === page.value) return

  page.value = newPage

  await loadProjects()
}
async function loadProjects() {
  loading.value = true
  error.value = ''

  try {
    const params = {
      page: page.value,
      limit: limit.value,
    }

    if (search.value.trim()) {
      params.search = search.value.trim()
    }

    if (status.value !== 'all') {
      params.status = status.value
    }

    const result = await getProjects(params)

    projects.value = result.projects
    pagination.value = result.meta
  } catch (err) {
    error.value = messageFromError(err, 'Unable to load projects.')
  } finally {
    loading.value = false
  }
}

async function loadRelations() {
  try {
    const relations = await getProjectRelations()

    tags.value = relations.tags
    technologies.value = relations.technologies
  } catch (err) {
    error.value = messageFromError(err, 'Unable to load project relations.')
  }
}
function openCreate() {
  editingProject.value = null
  showForm.value = true
}

function openEdit(project) {
  editingProject.value = project
  showForm.value = true
}
function openDelete(project) {
  showFormDelete.value = true
  deletingProject.value = project
}

async function addTag() {
  const name = newTagName.value.trim()
  if (!name) return

  try {
    tags.value.push(await projectTagService.create({ name }))
    newTagName.value = ''
  } catch (err) {
    error.value = messageFromError(err, 'Unable to load projects.')
  }
}

async function addTechnology() {
  const name = newTechnologyName.value.trim()
  if (!name) return

  try {
    technologies.value.push(await technologyService.create({ name, type: newTechnologyType.value }))
    newTechnologyName.value = ''
  } catch (err) {
    error.value = messageFromError(err, 'Unable to load projects.')
  }
}
async function handleSave(form) {
  try {
    isLoadingCreate.value = true
    error.value = ''
    if (editingProject.value) {
      await updateProject(editingProject.value.id, form)
      toast.success('Update project successfully!')
    } else {
      await createProject(form)
      toast.success('Create project successfully!')
    }
    await loadProjects()
    showForm.value = false
    editingProject.value = null
  } catch (err) {
    error.value = messageFromError(err, 'Unable to load projects.')
  } finally {
    setTimeout(() => {
      isLoadingCreate.value = false
    }, 5000)
  }
}

async function removeProject() {
  const project = deletingProject.value
  if (!project) return

  try {
    isDeleting.value = true
    error.value = ''
    await deleteProject(project.id)
    projects.value = projects.value.filter((item) => item.id !== project.id)
    showFormDelete.value = false
    deletingProject.value = null
    toast.success('Delete project successfully!')
  } catch (err) {
    error.value = messageFromError(err, 'Unable to load projects.')
  } finally {
    isDeleting.value = false
  }
}

let searchTimer = null

watch(search, () => {
  page.value = 1

  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    loadProjects()
  }, 400)
})
watch(status, () => {
  page.value = 1
  loadProjects()
})
onMounted(() => {
  loadProjects()
  loadRelations()
})
onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>

<template>
  <div class="mx-auto max-w-[1600px]">
    <section class="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">Overview</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Projects</h1>
        <p class="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
          Create projects, upload thumbnails, select tags and technologies.
        </p>
      </div>
    </section>

    <p
      v-if="error"
      class="mb-4 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
    >
      {{ error }}
    </p>

    <ProjectToolbar v-model:search="search" v-model:status="status" @create="openCreate" />

    <div class="mb-4 grid gap-3 rounded-lg border border-zinc-800 bg-[#18181b] p-4 lg:grid-cols-2">
      <form class="flex gap-2" @submit.prevent="addTag">
        <input
          v-model="newTagName"
          class="min-w-0 flex-1 rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
          placeholder="New tag"
        />
        <button class="rounded-md bg-white px-3 py-2 text-sm font-medium text-black" type="submit">
          Add Tag
        </button>
      </form>

      <form class="flex gap-2" @submit.prevent="addTechnology">
        <input
          v-model="newTechnologyName"
          class="min-w-0 flex-1 rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
          placeholder="New technology"
        />
        <select
          v-model="newTechnologyType"
          class="rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
        >
          <option value="LANGUAGE">Language</option>
          <option value="FRAMEWORK">Framework</option>
          <option value="LIBRARY">Library</option>
          <option value="DATABASE">Database</option>
          <option value="TOOL">Tool</option>
          <option value="OTHER">Other</option>
        </select>
        <button class="rounded-md bg-white px-3 py-2 text-sm font-medium text-black" type="submit">
          Add Tech
        </button>
      </form>
    </div>

    <ProjectTable :projects="projects" :loading="loading" @edit="openEdit" @delete="openDelete" />
    <ProjectPagination
      :page="pagination.page"
      :total-pages="pagination.totalPages"
      :total="pagination.total"
      :loading="loading"
      @change="changePage"
    />
    <ProjectFormModal
      v-if="showForm"
      @save="handleSave"
      @exit="() => (showForm = false)"
      :tags="tags"
      :technologies="technologies"
      :is-loading="isLoadingCreate"
      :error="error"
      :project="editingProject"
    />
    <DeleteProjectModal
      v-if="showFormDelete"
      :project="deletingProject"
      :is-loading="isDeleting"
      @cancel="() => (showFormDelete = false)"
      @confirm="removeProject"
    />
  </div>
</template>
