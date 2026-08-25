<script setup>
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import {
  createAdminMomentTagApi,
  deleteAdminMomentTagApi,
  getAdminMomentTagsApi,
  updateAdminMomentTagApi,
} from '../api/admin-moment'
import { useDebouncedValue } from '../composables/useDebouncedValue'
import MomentCategoriesTableSkeleton from '../components/admin/skeleton/MomentCategoriesTableSkeleton.vue'
import ModalCustom from '../components/admin/moments/categories/ModalCustom.vue'
import axios from 'axios'

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
const columns = ref([
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Slug',
    dataIndex: 'slug',
    key: 'slug',
  },
  {
    title: 'Moments',
    dataIndex: 'count',
    key: 'count',
    align: 'center',
  },
  {
    title: 'Created at',
    dataIndex: 'createdAt',
    key: 'createdAt',
    customRender: ({ text }) => formatDate(text),
  },
  {
    title: 'Updated at',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    customRender: ({ text }) => formatDate(text),
  },
  {
    title: 'Action',
    key: 'action',
    width: 180,
    fixed: 'right',
  },
])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const hasLoaded = ref(false)
const hashtags = ref([])
const editingHashtag = ref(null)
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})
const isOpen = ref(false)
const search = ref('')
const keyWordRef = computed(() => search.value)
const debouncedKeyword = useDebouncedValue(keyWordRef, 400)

const loadHashtags = async () => {
  loading.value = true
  try {
    const response = await getAdminMomentTagsApi({
      search: debouncedKeyword.value,
      page: pagination.page,
      limit: pagination.limit,
    })
    hashtags.value = response.data.tags
    pagination.total = response.meta.total
  } finally {
    loading.value = false
    hasLoaded.value = true
  }
}

const openCreate = () => {
  editingHashtag.value = null
  isOpen.value = true
}
function messageFromError(err, fallback) {
  if (!axios.isAxiosError(err)) return fallback
  return err.response?.data?.error?.message || fallback
}
const handleDelete = async (record) => {
  if (deleting.value) return

  deleting.value = true
  try {
    await deleteAdminMomentTagApi(record.id)
    toast.success('Delete hashtag successfully!')
    if (hashtags.value.length === 1 && pagination.page > 1) pagination.page -= 1
    await loadHashtags()
  } catch {
    toast.error('Unable to delete hashtag.')
  } finally {
    deleting.value = false
  }
}

const handleEdit = (record) => {
  editingHashtag.value = record
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  editingHashtag.value = null
}

const handleSubmit = async (form) => {
  if (saving.value) return

  saving.value = true
  try {
    if (editingHashtag.value) {
      await updateAdminMomentTagApi(editingHashtag.value.id, form)
      toast.success('Update hashtag successfully!')
    } else {
      await createAdminMomentTagApi(form)
      toast.success('Create hashtag successfully!')
    }
    closeModal()
    await loadHashtags()
  } catch (err) {
    toast.error(messageFromError(err, 'Unable to save hashtag.'))
  } finally {
    saving.value = false
  }
}
function handleTableChange(nextPagination) {
  pagination.page = nextPagination.current
  pagination.limit = nextPagination.pageSize
  loadHashtags()
}

watch(debouncedKeyword, () => {
  pagination.page = 1
  loadHashtags()
})

onMounted(loadHashtags)
</script>
<template>
  <div class="mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1600px] flex-col">
    <section class="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">Overview</p>

        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Moments Hashtags
        </h1>

        <p class="mt-2 max-w-xl text-sm leading-6 text-zinc-500">Create hashtags</p>
      </div>
    </section>

    <div class="flex items-center justify-between gap-4">
      <div class="w-[350px]">
        <a-input-search
          v-model:value="search"
          placeholder="Search hashtags..."
          :loading="loading"
          enter-button
          allow-clear
          size="large"
        />
      </div>

      <div>
        <a-button
          @click="openCreate"
          size="large"
          class="!flex !h-11 !items-center !justify-center !gap-2 !rounded-xl !bg-zinc-100 !px-6 !font-semibold !text-black"
        >
          <PlusCircleOutlined />
          <span>New Hashtag</span>
        </a-button>
      </div>
    </div>

    <div class="mt-10">
      <MomentCategoriesTableSkeleton v-if="loading && !hasLoaded" :rows="5" />

      <a-table
        v-else
        row-key="id"
        :data-source="hashtags"
        :columns="columns"
        :loading="loading"
        :pagination="{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
        }"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex items-center justify-center gap-2 p-2">
              <!-- EDIT -->
              <a-button
                type="text"
                class="!flex !items-center !justify-center"
                @click="handleEdit(record)"
              >
                <template #icon>
                  <EditOutlined />
                </template>

                Edit
              </a-button>

              <!-- DELETE -->
              <a-popconfirm
                title="Delete this category?"
                description="This action cannot be undone."
                ok-text="Delete"
                cancel-text="Cancel"
                @confirm="handleDelete(record)"
              >
                <a-button
                  type="text"
                  danger
                  :loading="deleting"
                  class="!flex !items-center !justify-center"
                >
                  <template #icon>
                    <DeleteOutlined />
                  </template>

                  Delete
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <ModalCustom
      v-model:open="isOpen"
      :category="editingHashtag"
      :loading="saving"
      @closed="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>
