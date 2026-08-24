<script setup>
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'

import ProjectToolbar from '@/components/admin/projects/ProjectToolbar.vue'
import ProjectTable from '@/components/admin/projects/ProjectTable.vue'
import ProjectTableSkeleton from '@/components/admin/skeleton/ProjectTableSkeleton.vue'
import ProjectPagination from '@/components/admin/projects/ProjectPagination.vue'
import ProjectFormModal from '@/components/admin/projects/ProjectFormModal.vue'
import DeleteProjectModal from '@/components/admin/projects/DeleteProjectModal.vue'
import LoadingButton from '@/components/loading/LoadingButton.vue'

import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { useDelayedLoading } from '@/composables/useDelayedLoading'
import { useI18n } from '@/composables/useI18n'

import { useProjectRelationsQuery, useProjectsQuery } from '@/queries/admin-project.query'

import {
  useCreateProjectMutation,
  useCreateProjectTagMutation,
  useCreateTechnologyMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from '@/queries/admin-project.mutation'

const search = ref('')
const status = ref('all')

const page = ref(1)
const limit = ref(5)

const debouncedSearch = useDebouncedValue(search, 400)

const showForm = ref(false)
const editingProject = ref(null)

const showFormDelete = ref(false)
const deletingProject = ref(null)

const newTagName = ref('')

const newTechnologyName = ref('')
const newTechnologyType = ref('FRAMEWORK')

const actionError = ref('')
const { t } = useI18n()

const projectQuery = useProjectsQuery({
  page,
  limit,
  search: debouncedSearch,
  status,
})

const relationsQuery = useProjectRelationsQuery()

const createProjectMutation = useCreateProjectMutation()

const updateProjectMutation = useUpdateProjectMutation()

const deleteProjectMutation = useDeleteProjectMutation()

const createTagMutation = useCreateProjectTagMutation()

const createTechnologyMutation = useCreateTechnologyMutation()

const projects = computed(() => {
  return projectQuery.data.value?.projects ?? []
})

const pagination = computed(() => {
  return (
    projectQuery.data.value?.meta ?? {
      page: page.value,
      limit: limit.value,
      total: 0,
      totalPages: 0,
    }
  )
})

const tags = computed(() => {
  return relationsQuery.data.value?.tags ?? []
})

const technologies = computed(() => {
  return relationsQuery.data.value?.technologies ?? []
})

const isProjectsPending = projectQuery.isPending

const isProjectsFetching = projectQuery.isFetching

const isSavingProject = computed(() => {
  return createProjectMutation.isPending.value || updateProjectMutation.isPending.value
})

const isDeletingProject = deleteProjectMutation.isPending

const isCreatingTag = createTagMutation.isPending

const isCreatingTechnology = createTechnologyMutation.isPending

const showInitialSkeleton = useDelayedLoading(isProjectsPending, {
  delay: 10,
  minDuration: 300,
})

function messageFromError(err, fallback) {
  if (!axios.isAxiosError(err)) {
    return fallback
  }

  return err.response?.data?.error?.message || fallback
}

const pageError = computed(() => {
  if (actionError.value) {
    return actionError.value
  }

  if (projectQuery.isError.value) {
    return messageFromError(projectQuery.error.value, 'Unable to load projects.')
  }

  if (relationsQuery.isError.value) {
    return messageFromError(relationsQuery.error.value, 'Unable to load project relations.')
  }

  return ''
})

watch(
  [debouncedSearch, status],
  () => {
    page.value = 1
  },
  {
    flush: 'sync',
  },
)

function changePage(newPage) {
  if (newPage < 1) {
    return
  }

  if (newPage > pagination.value.totalPages) {
    return
  }

  if (newPage === page.value) {
    return
  }

  page.value = newPage
}

function openCreate() {
  actionError.value = ''

  editingProject.value = null
  showForm.value = true
}

function openEdit(project) {
  actionError.value = ''

  editingProject.value = project
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingProject.value = null

  actionError.value = ''
}

function openDelete(project) {
  actionError.value = ''

  deletingProject.value = project
  showFormDelete.value = true
}

function closeDelete() {
  showFormDelete.value = false
  deletingProject.value = null
}

async function addTag() {
  const name = newTagName.value.trim()

  if (!name) {
    return
  }

  if (isCreatingTag.value) {
    return
  }

  actionError.value = ''

  try {
    await createTagMutation.mutateAsync({
      name,
    })

    newTagName.value = ''

    toast.success('Create tag successfully!')
  } catch (err) {
    actionError.value = messageFromError(err, 'Unable to create tag.')
  }
}

async function addTechnology() {
  const name = newTechnologyName.value.trim()

  if (!name) {
    return
  }

  if (isCreatingTechnology.value) {
    return
  }

  actionError.value = ''

  try {
    await createTechnologyMutation.mutateAsync({
      name,
      type: newTechnologyType.value,
    })

    newTechnologyName.value = ''

    toast.success('Create technology successfully!')
  } catch (err) {
    actionError.value = messageFromError(err, 'Unable to create technology.')
  }
}

async function handleSave(form) {
  if (isSavingProject.value) {
    return
  }

  actionError.value = ''

  try {
    if (editingProject.value) {
      await updateProjectMutation.mutateAsync({
        id: editingProject.value.id,
        data: form,
      })

      toast.success('Update project successfully!')
    } else {
      await createProjectMutation.mutateAsync(form)

      toast.success('Create project successfully!')
    }

    closeForm()
  } catch (err) {
    actionError.value = messageFromError(
      err,
      editingProject.value ? 'Unable to update project.' : 'Unable to create project.',
    )
  }
}

async function removeProject() {
  const project = deletingProject.value

  if (!project) {
    return
  }

  if (isDeletingProject.value) {
    return
  }

  actionError.value = ''

  const shouldGoPreviousPage = projects.value.length === 1 && page.value > 1

  try {
    await deleteProjectMutation.mutateAsync(project.id)

    if (shouldGoPreviousPage) {
      page.value -= 1
    }

    closeDelete()

    toast.success('Delete project successfully!')
  } catch (err) {
    actionError.value = messageFromError(err, 'Unable to delete project.')
  }
}
</script>

<template>
  <div class="mx-auto max-w-[1600px]">
    <!-- Page heading -->
    <section class="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">{{ t('admin.overview') }}</p>

        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{{ t('admin.projects') }}</h1>

        <p class="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
          {{ t('admin.createProject') }}
        </p>
      </div>
    </section>

    <!-- Error -->
    <p
      v-if="pageError"
      class="mb-4 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
    >
      {{ pageError }}
    </p>

    <!-- Toolbar -->
    <ProjectToolbar
      v-model:search="search"
      v-model:status="status"
      :search-placeholder="t('admin.searchProjects')"
      :create-label="t('admin.newProject')"
      @create="openCreate"
    />

    <!-- Relations -->
    <div class="mb-4 grid gap-3 rounded-lg border border-zinc-800 bg-[#18181b] p-4 lg:grid-cols-2">
      <!-- Add tag -->
      <form class="flex gap-2" @submit.prevent="addTag">
        <input
          v-model="newTagName"
          :disabled="isCreatingTag"
          class="min-w-0 flex-1 rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="New tag"
        />

        <LoadingButton
          :loading="isCreatingTag"
          class="rounded-md bg-white px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
        >
          <span>{{ isCreatingTag ? 'Adding...' : 'Add Tag' }}</span>
        </LoadingButton>
      </form>

      <!-- Add technology -->
      <form class="flex gap-2" @submit.prevent="addTechnology">
        <input
          v-model="newTechnologyName"
          :disabled="isCreatingTechnology"
          class="min-w-0 flex-1 rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="New technology"
        />

        <select
          v-model="newTechnologyType"
          :disabled="isCreatingTechnology"
          class="rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="LANGUAGE">Language</option>

          <option value="FRAMEWORK">Framework</option>

          <option value="LIBRARY">Library</option>

          <option value="DATABASE">Database</option>

          <option value="TOOL">Tool</option>

          <option value="OTHER">Other</option>
        </select>

        <LoadingButton
          :loading="isCreatingTechnology"
          class="rounded-md bg-white px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
        >
          <span>{{ isCreatingTechnology ? 'Adding...' : 'Add Tech' }}</span>
        </LoadingButton>
      </form>
    </div>

    <div
      class="flex min-h-[560px] flex-col transition-opacity duration-200"
      :class="{
        'pointer-events-none opacity-50': isProjectsFetching && !isProjectsPending,
      }"
    >
      <ProjectTableSkeleton v-if="showInitialSkeleton" :rows="limit" />

      <ProjectTable
        v-else-if="!isProjectsPending"
        :projects="projects"
        @edit="openEdit"
        @delete="openDelete"
      />

      <div v-else class="flex-1" />

      <ProjectPagination
        :page="page"
        :limit="limit"
        :total-pages="pagination.totalPages"
        :total="pagination.total"
        :loading="isProjectsFetching"
        :item-label="t('admin.projects').toLowerCase()"
        @change="changePage"
      />
    </div>

    <ProjectFormModal
      v-if="showForm"
      :tags="tags"
      :technologies="technologies"
      :is-loading="isSavingProject"
      :error="actionError"
      :project="editingProject"
      @save="handleSave"
      @exit="closeForm"
    />

    <DeleteProjectModal
      v-if="showFormDelete"
      :project="deletingProject"
      :loading="isDeletingProject"
      @cancel="closeDelete"
      @confirm="removeProject"
    />
  </div>
</template>
