<script setup>
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import ProjectToolbar from '../components/admin/projects/ProjectToolbar.vue'
import DeleteMomentModal from '../components/admin/moments/DeleteMomentModal.vue'
import MomentsFormModal from '../components/admin/moments/MomentsFormModal.vue'
import MomentsTable from '../components/admin/moments/MomentsTable.vue'
import { useDebouncedValue } from '../composables/useDebouncedValue.js'
import { useMomentRelationsQuery, useMomentsQuery } from '../queries/admin-moment.query.js'
import {
  useCreateMomentMutation,
  useDeleteMomentMutation,
  useUpdateMomentMutation,
} from '../queries/admin-moment.mutation.js'
import ProjectPagination from '../components/admin/projects/ProjectPagination.vue'
import { useDelayedLoading } from '../composables/useDelayedLoading.js'
import ProjectTableSkeleton from '../components/admin/skeleton/ProjectTableSkeleton.vue'
import { useI18n } from '@/composables/useI18n'
const search = ref('')
const status = ref('all')
const page = ref(1)
const limit = ref(10)
const debouncedSearch = useDebouncedValue(search, 400)
const actionError = ref('')
const { t } = useI18n()
const isOpenCreate = ref(false)
const isOpenDelete = ref(false)
const editingMoment = ref(null)
const deletingMoment = ref(null)

const mommentQuery = useMomentsQuery({
  page,
  limit,
  search: debouncedSearch,
  status,
})
const pagination = computed(() => {
  return (
    mommentQuery.data.value?.meta ?? {
      page: page.value,
      limit: limit.value,
      total: 0,
      totalPages: 0,
    }
  )
})
const changePage = (newPage) => {
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
const isMomentsPending = mommentQuery.isPending
const isMomentsFetching = mommentQuery.isFetching
const relationsQuery = useMomentRelationsQuery()
const createMomentMutation = useCreateMomentMutation()
const updateMomentMutation = useUpdateMomentMutation()
const deleteMomentMutation = useDeleteMomentMutation()
const Moments = computed(() => mommentQuery.data.value?.moments ?? [])
const tags = computed(() => relationsQuery.data.value?.tags ?? [])
const isLoading = computed(() => isMomentsPending.value || isMomentsFetching.value)
const isSaving = computed(
  () => createMomentMutation.isPending.value || updateMomentMutation.isPending.value,
)
const showInitialSkeleton = useDelayedLoading(isMomentsPending, {
  delay: 10,
  minDuration: 300,
})
const isDeleting = deleteMomentMutation.isPending
const error = computed(
  () =>
    actionError.value ||
    mommentQuery.error.value?.response?.data?.error?.message ||
    relationsQuery.error.value?.response?.data?.error?.message ||
    mommentQuery.error.value?.message ||
    relationsQuery.error.value?.message ||
    '',
)

watch([debouncedSearch, status], () => {
  page.value = 1
})

const openCreate = () => {
  actionError.value = ''
  editingMoment.value = null
  isOpenCreate.value = true
}

const isOpenUpdate = ref(false)
const openUpdate = (moment) => {
  actionError.value = ''
  editingMoment.value = moment
  isOpenUpdate.value = true
}

const closeForm = () => {
  isOpenCreate.value = false
  isOpenUpdate.value = false
  editingMoment.value = null
  actionError.value = ''
}

const closeDelete = () => {
  isOpenDelete.value = false
  deletingMoment.value = null
  actionError.value = ''
}

const messageFromError = (err, fallback) => {
  if (!axios.isAxiosError(err)) return fallback

  return err.response?.data?.error?.message || fallback
}

const handleSave = async (form) => {
  if (isSaving.value) return

  actionError.value = ''

  try {
    if (editingMoment.value) {
      await updateMomentMutation.mutateAsync({ id: editingMoment.value.id, data: form })
      toast.success('Update moment successfully!')
    } else {
      await createMomentMutation.mutateAsync(form)
      toast.success('Create moment successfully!')
    }

    closeForm()
  } catch (err) {
    actionError.value = messageFromError(err, 'Unable to save moment.')
  }
}
const openDelete = (moment) => {
  actionError.value = ''
  deletingMoment.value = moment
  isOpenDelete.value = true
}

const confirmDelete = async () => {
  if (!deletingMoment.value || isDeleting.value) return

  actionError.value = ''

  try {
    await deleteMomentMutation.mutateAsync({ id: deletingMoment.value.id })
    toast.success('Delete moment successfully!')
    closeDelete()
  } catch (err) {
    actionError.value = messageFromError(err, 'Unable to delete moment.')
  }
}
</script>
<template>
  <div class="mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1600px] flex-col">
    <section class="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">{{ t('admin.overview') }}</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{{ t('admin.moments') }}</h1>
        <p class="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
          {{ t('admin.createMoment') }}
        </p>
      </div>
    </section>

    <p
      v-if="error"
      class="mb-4 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
    >
      {{ error }}
    </p>

    <ProjectToolbar
      v-model:search="search"
      v-model:status="status"
      :search-placeholder="t('admin.searchMoments')"
      :create-label="t('admin.newMoment')"
      @create="openCreate"
    />

    <div class="flex flex-1 flex-col">
      <MomentsTable
        v-if="!showInitialSkeleton"
        class="flex-1"
        @edit="openUpdate"
        @delete="openDelete"
        :moments="Moments"
        :loading="isLoading"
      />
      <ProjectTableSkeleton v-if="showInitialSkeleton" :rows="limit" />

      <ProjectPagination
        :page="page"
        :limit="limit"
        :total-pages="pagination.totalPages"
        :total="pagination.total"
        :item-label="t('admin.moments').toLowerCase()"
        :loading="isMomentsFetching"
        @change="changePage"
      />
    </div>
  </div>

  <MomentsFormModal
    v-if="isOpenCreate"
    :tags="tags"
    :is-loading="isSaving"
    :error="actionError"
    @exit="closeForm"
    @save="handleSave"
  />
  <MomentsFormModal
    v-if="isOpenUpdate"
    :moment="editingMoment"
    :tags="tags"
    :is-loading="isSaving"
    :error="actionError"
    @exit="closeForm"
    @save="handleSave"
  />
  <DeleteMomentModal
    v-if="isOpenDelete"
    :moment="deletingMoment"
    :is-loading="isDeleting"
    @cancel="closeDelete"
    @confirm="confirmDelete"
  />
</template>
