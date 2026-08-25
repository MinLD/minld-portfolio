<script setup>
import { computed, reactive, ref } from 'vue'

import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import FormField from '@/components/form/FormField.vue'
import { createMomentSchema } from '@/schemas/moment.schema'
import UploadImage from '../../shared/uploadImage.vue'

const formatDateTimeLocal = (value) => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const pad = (number) => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const props = defineProps({
  moment: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['save', 'exit'])

const isEditMode = computed(() => !!props.moment)

const form = reactive({
  content: props.moment?.content ?? '',
  status: props.moment?.status ?? 'DRAFT',
  publishedAt: formatDateTimeLocal(props.moment?.publishedAt),
  categoryIds: props.moment?.categories?.map((category) => category.id) ?? [],
  tagIds: props.moment?.tags?.map((tag) => tag.id) ?? [],
  images: [],
})

const fields = [
  {
    key: 'content',
    label: 'Content',
    component: 'textarea',
    colSpan: 'sm:col-span-2',
    placeholder: 'Write your moment...',
    rows: 5,
  },
  {
    key: 'status',
    label: 'Status',
    component: 'select',
    colSpan: 'sm:col-span-2',
    options: [
      { label: 'Draft', value: 'DRAFT' },
      { label: 'Published', value: 'PUBLISHED' },
      { label: 'Archived', value: 'ARCHIVED' },
    ],
  },
]

const errors = ref({})
const uploadedImageUrl = ref(props.moment?.images?.[0]?.url ?? '')
const imageTouched = ref(false)

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field]
}

const setImage = (image) => {
  form.images = [image]
  imageTouched.value = true
}

const clearImage = () => {
  form.images = []
  uploadedImageUrl.value = ''
  imageTouched.value = true
}

const toggleValue = (array, value) => {
  const index = array.indexOf(value)

  if (index === -1) {
    array.push(value)
    return
  }

  array.splice(index, 1)
}

const submit = () => {
  const result = createMomentSchema.safeParse(form)

  errors.value = {}

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      if (field && !errors.value[field]) errors.value[field] = issue.message
    })
    return
  }

  const publishedAt =
    result.data.status === 'PUBLISHED'
      ? result.data.publishedAt
        ? new Date(result.data.publishedAt).toISOString()
        : new Date().toISOString()
      : isEditMode.value
        ? null
        : undefined

  const payload = {
    content: result.data.content,
    status: result.data.status,
    publishedAt,
    categoryIds: result.data.categoryIds,
    tagIds: result.data.tagIds,
  }

  if (!isEditMode.value || imageTouched.value) payload.images = result.data.images

  emit('save', payload)
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      @click.self="emit('exit')"
    >
      <div
        class="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-800 bg-[#18181b] shadow-2xl"
      >
        <div class="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 class="font-semibold text-white">
              {{ isEditMode ? 'Edit Moment' : 'Create Moment' }}
            </h2>
            <p class="mt-1 text-xs text-zinc-500">Fill moment content, status, categories and hashtags.</p>
          </div>

          <button
            type="button"
            :disabled="props.isLoading"
            class="rounded-md px-2 py-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            @click="emit('exit')"
          >
            ×
          </button>
        </div>

        <form class="max-h-[calc(92vh-73px)] overflow-y-auto" @submit.prevent="submit">
          <div class="grid gap-4 p-6 sm:grid-cols-2">
            <FormField
              v-for="field in fields"
              :key="field.key"
              v-model="form[field.key]"
              :label="field.label"
              :component="field.component"
              :type="field.type"
              :rows="field.rows"
              :options="field.options"
              :col-span="field.colSpan"
              :placeholder="field.placeholder"
              :error="errors[field.key]"
              @update:model-value="clearError(field.key)"
            />
            <UploadImage
              v-model="uploadedImageUrl"
              folder="moments"
              :disabled="props.isLoading"
              @uploaded="setImage"
              @clear="clearImage"
            />
            <div class="sm:col-span-2">
              <p class="mb-2 text-sm text-zinc-300">Categories</p>

              <div v-if="props.categories.length" class="flex flex-wrap gap-2">
                <button
                  v-for="category in props.categories"
                  :key="category.id"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs transition"
                  :class="
                    form.categoryIds.includes(category.id)
                      ? 'border-white bg-white text-black'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  "
                  @click="toggleValue(form.categoryIds, category.id)"
                >
                  {{ category.name }}
                </button>
              </div>

              <p v-else class="text-xs text-zinc-500">No categories available.</p>
              <p class="mt-1 min-h-5 text-xs text-red-400">{{ errors.categoryIds }}</p>
            </div>
            <div class="sm:col-span-2">
              <p class="mb-2 text-sm text-zinc-300">Hashtags</p>

              <div v-if="props.tags.length" class="flex flex-wrap gap-2">
                <button
                  v-for="tag in props.tags"
                  :key="tag.id"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs transition"
                  :class="
                    form.tagIds.includes(tag.id)
                      ? 'border-white bg-white text-black'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  "
                  @click="toggleValue(form.tagIds, tag.id)"
                >
                  {{ tag.name }}
                </button>
              </div>

              <p v-else class="text-xs text-zinc-500">No tags available.</p>
              <p class="mt-1 min-h-5 text-xs text-red-400">{{ errors.tagIds }}</p>
            </div>

            <p v-if="props.error" class="sm:col-span-2 text-sm text-red-400">{{ props.error }}</p>
          </div>

          <div
            class="sticky bottom-0 flex justify-end gap-2 border-t border-zinc-800 bg-[#18181b] px-6 py-4"
          >
            <button
              type="button"
              :disabled="props.isLoading"
              class="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              @click="emit('exit')"
            >
              Cancel
            </button>

            <button
              type="submit"
              :disabled="props.isLoading"
              class="flex min-w-32 items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LoadingSpinner v-if="props.isLoading" size="size-4" />
              <span>{{
                props.isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Moment'
              }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
