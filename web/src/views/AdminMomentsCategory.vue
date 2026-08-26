<script setup>
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import axios from 'axios'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import {
  createAdminMomentCategoryApi,
  deleteAdminMomentCategoryApi,
  getAdminMomentCategoriesApi,
  updateAdminMomentCategoryApi,
} from '@/api/admin-moment'
import { useDebouncedValue } from '../composables/useDebouncedValue'
import MomentCategoriesTableSkeleton from '../components/admin/skeleton/MomentCategoriesTableSkeleton.vue'
import ModalCustom from '../components/admin/moments/categories/ModalCustom.vue'
import { Search } from 'lucide-vue-next'

const keyword = ref('')
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const categories = ref([])
const isOpen = ref(false)
const editingCategory = ref(null)
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})
const keyWordRef = computed(() => keyword.value)
const debouncedKeyword = useDebouncedValue(keyWordRef, 400)

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
const hasLoaded = ref(false)
async function loadCategories() {
  loading.value = true

  try {
    const response = await getAdminMomentCategoriesApi({
      page: pagination.page,
      limit: pagination.limit,
      search: debouncedKeyword.value,
    })
    categories.value = response.data.categories
    pagination.total = response.meta.total
  } finally {
    loading.value = false
    hasLoaded.value = true
  }
}
function messageFromError(err, fallback) {
  if (!axios.isAxiosError(err)) return fallback
  return err.response?.data?.error?.message || fallback
}

function openCreate() {
  editingCategory.value = null
  isOpen.value = true
}

function openEdit(record) {
  editingCategory.value = record
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
  editingCategory.value = null
}

const handleSubmit = async (form) => {
  if (saving.value) return

  saving.value = true
  try {
    if (editingCategory.value) {
      await updateAdminMomentCategoryApi(editingCategory.value.id, form)
      toast.success('Update category successfully!')
    } else {
      await createAdminMomentCategoryApi(form)
      toast.success('Create category successfully!')
    }
    closeModal()
    await loadCategories()
  } catch (err) {
    toast.error(messageFromError(err, 'Unable to save category.'))
  } finally {
    saving.value = false
  }
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
function handleEdit(record) {
  openEdit(record)
}

async function handleDelete(record) {
  if (deleting.value) return

  deleting.value = true
  try {
    await deleteAdminMomentCategoryApi(record.id)
    toast.success('Delete category successfully!')
    if (categories.value.length === 1 && pagination.page > 1) pagination.page -= 1
    await loadCategories()
  } catch (err) {
    toast.error(messageFromError(err, 'Unable to delete category.'))
  } finally {
    deleting.value = false
  }
}

function handleTableChange(nextPagination) {
  pagination.page = nextPagination.current
  pagination.limit = nextPagination.pageSize
  loadCategories()
}

watch(debouncedKeyword, () => {
  pagination.page = 1
  loadCategories()
})
onMounted(loadCategories)
</script>

<template>
  <div class="mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1600px] flex-col">
    <section class="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">Overview</p>

        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Moments categories
        </h1>

        <p class="mt-2 max-w-xl text-sm leading-6 text-zinc-500">Create categories</p>
      </div>
    </section>

    <div class="flex items-center justify-between gap-4">
      <div class="w-[350px]">
        <a-input
          v-model:value="keyword"
          placeholder="Search categories..."
          :loading="loading"
          allow-clear
          size="large"
          class="!border-zinc-700 !bg-transparent hover:!border-zinc-600 focus-within:!border-zinc-500 focus-within:!shadow-none"
        >
          <template #prefix>
            <Search class="mr-1 h-4 w-4 text-zinc-100" />
          </template>
        </a-input>
      </div>

      <div>
        <a-button
          @click="openCreate"
          size="large"
          class="!flex !h-11 !items-center !justify-center !gap-2 !rounded-xl !bg-zinc-100 !px-6 !font-semibold !text-black"
        >
          <PlusCircleOutlined />
          <span>New Categories</span>
        </a-button>
      </div>
    </div>

    <div class="mt-10">
      <MomentCategoriesTableSkeleton v-if="loading && !hasLoaded" :rows="5" />

      <a-table
        v-else
        row-key="id"
        :data-source="categories"
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
      :category="editingCategory"
      :loading="saving"
      @closed="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>
