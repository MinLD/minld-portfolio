<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import ProjectToolbar from '@/components/admin/projects/ProjectToolbar.vue'
import ProjectTable from '@/components/admin/projects/ProjectTable.vue'
import ProjectFormModal from '@/components/admin/projects/ProjectFormModal.vue'
import { createProject, deleteProject, getProjectRelations, getProjects, updateProject } from '@/services/admin-project.service'
import { projectTagService } from '@/services/project-tag.service'
import { technologyService } from '@/services/technology.service'

const projects = ref([])
const tags = ref([])
const technologies = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const status = ref('all')
const editingProject = ref(null)
const showForm = ref(false)
const newTagName = ref('')
const newTechnologyName = ref('')
const newTechnologyType = ref('FRAMEWORK')

const filteredProjects = computed(() => {
  const term = search.value.trim().toLowerCase()

  return projects.value.filter((project) => {
    const matchesStatus = status.value === 'all' || project.status === status.value
    const matchesSearch = !term || [project.title, project.summary, project.slug].some((value) => value?.toLowerCase().includes(term))

    return matchesStatus && matchesSearch
  })
})

function messageFromError(err, fallback) {
  return axios.isAxiosError(err) ? err.response?.data?.error?.message || fallback : fallback
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const [projectList, relations] = await Promise.all([getProjects(), getProjectRelations()])
    projects.value = projectList
    tags.value = relations.tags
    technologies.value = relations.technologies
  } catch (err) {
    error.value = messageFromError(err, 'Unable to load projects.')
  } finally {
    loading.value = false
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

async function saveProject(payload) {
  saving.value = true
  error.value = ''

  try {
    const saved = editingProject.value ? await updateProject(editingProject.value.id, payload) : await createProject(payload)
    const index = projects.value.findIndex((project) => project.id === saved.id)

    if (index === -1) {
      projects.value.unshift(saved)
    } else {
      projects.value[index] = saved
    }

    showForm.value = false
    editingProject.value = null
  } catch (err) {
    error.value = messageFromError(err, 'Unable to save project.')
  } finally {
    saving.value = false
  }
}

async function removeProject(project) {
  if (!window.confirm(`Delete project "${project.title}"?`)) return

  error.value = ''

  try {
    await deleteProject(project.id)
    projects.value = projects.value.filter((item) => item.id !== project.id)
  } catch (err) {
    error.value = messageFromError(err, 'Unable to delete project.')
  }
}

async function addTag() {
  const name = newTagName.value.trim()
  if (!name) return

  try {
    tags.value.push(await projectTagService.create({ name }))
    newTagName.value = ''
  } catch (err) {
    error.value = messageFromError(err, 'Unable to create tag.')
  }
}

async function addTechnology() {
  const name = newTechnologyName.value.trim()
  if (!name) return

  try {
    technologies.value.push(await technologyService.create({ name, type: newTechnologyType.value }))
    newTechnologyName.value = ''
  } catch (err) {
    error.value = messageFromError(err, 'Unable to create technology.')
  }
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-[1600px]">
    <section class="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">Overview</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Projects</h1>
        <p class="mt-2 max-w-xl text-sm leading-6 text-zinc-500">Create projects, upload thumbnails, select tags and technologies.</p>
      </div>
    </section>

    <p v-if="error" class="mb-4 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{{ error }}</p>

    <ProjectToolbar v-model:search="search" v-model:status="status" @create="openCreate" />

    <div class="mb-4 grid gap-3 rounded-lg border border-zinc-800 bg-[#18181b] p-4 lg:grid-cols-2">
      <form class="flex gap-2" @submit.prevent="addTag">
        <input v-model="newTagName" class="min-w-0 flex-1 rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500" placeholder="New tag" />
        <button class="rounded-md bg-white px-3 py-2 text-sm font-medium text-black" type="submit">Add Tag</button>
      </form>

      <form class="flex gap-2" @submit.prevent="addTechnology">
        <input v-model="newTechnologyName" class="min-w-0 flex-1 rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500" placeholder="New technology" />
        <select v-model="newTechnologyType" class="rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500">
          <option value="LANGUAGE">Language</option>
          <option value="FRAMEWORK">Framework</option>
          <option value="LIBRARY">Library</option>
          <option value="DATABASE">Database</option>
          <option value="TOOL">Tool</option>
          <option value="OTHER">Other</option>
        </select>
        <button class="rounded-md bg-white px-3 py-2 text-sm font-medium text-black" type="submit">Add Tech</button>
      </form>
    </div>

    <ProjectTable :projects="filteredProjects" :loading="loading" @edit="openEdit" @delete="removeProject" />

    <ProjectFormModal v-if="showForm" :project="editingProject" :tags="tags" :technologies="technologies" :saving="saving" @close="showForm = false" @save="saveProject" />
  </div>
</template>
