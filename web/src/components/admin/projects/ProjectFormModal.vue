<script setup>
import { computed, onUnmounted, reactive, ref } from 'vue'

import FormField from '@/components/form/FormField.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { projectSchema } from '@/schemas/project.schema.js'

const formatDateTimeLocal = (value) => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (number) => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const props = defineProps({
  project: {
    type: Object,
    default: null,
  },

  tags: {
    type: Array,
    default: () => [],
  },

  technologies: {
    type: Array,
    default: () => [],
  },

  isLoading: {
    type: Boolean,
    default: false,
  },

  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['save', 'exit'])

const isEditMode = computed(() => !!props.project)

const form = reactive({
  title: props.project?.title ?? '',
  summary: props.project?.summary ?? '',
  content: props.project?.content ?? '',
  status: props.project?.status ?? 'DRAFT',
  year: props.project?.year ?? new Date().getFullYear(),

  publishedAt: formatDateTimeLocal(props.project?.publishedAt),

  featured: props.project?.featured ?? false,

  demoUrl: props.project?.demoUrl ?? '',
  githubUrl: props.project?.githubUrl ?? '',
  sourceUrl: props.project?.sourceUrl ?? '',

  thumbnail: null,

  tagIds: props.project?.tags?.map((tag) => tag.id) ?? [],

  technologyIds: props.project?.technologies?.map((technology) => technology.id) ?? [],
})

const fields = [
  {
    key: 'title',
    label: 'Title',
    component: 'input',
    type: 'text',
    colSpan: 'sm:col-span-2',
    placeholder: 'Project title',
  },

  {
    key: 'summary',
    label: 'Summary',
    component: 'textarea',
    rows: 2,
    colSpan: 'sm:col-span-2',
    placeholder: 'Short project summary',
  },

  {
    key: 'content',
    label: 'Content',
    component: 'textarea',
    rows: 5,
    colSpan: 'sm:col-span-2',
    placeholder: 'Project content',
  },

  {
    key: 'status',
    label: 'Status',
    component: 'select',
    options: [
      {
        label: 'Draft',
        value: 'DRAFT',
      },
      {
        label: 'Published',
        value: 'PUBLISHED',
      },
      {
        label: 'Archived',
        value: 'ARCHIVED',
      },
    ],
  },

  {
    key: 'year',
    label: 'Year',
    component: 'input',
    type: 'number',
  },

  {
    key: 'publishedAt',
    label: 'Published at',
    component: 'input',
    type: 'datetime-local',
  },

  {
    key: 'demoUrl',
    label: 'Demo URL',
    component: 'input',
    type: 'url',
    placeholder: 'https://example.com',
  },

  {
    key: 'githubUrl',
    label: 'Github URL',
    component: 'input',
    type: 'url',
    placeholder: 'https://github.com/...',
  },

  {
    key: 'sourceUrl',
    label: 'Source URL',
    component: 'input',
    type: 'url',
    colSpan: 'sm:col-span-2',
    placeholder: 'https://...',
  },
]

const errors = ref({})

const clearError = (field) => {
  if (!errors.value[field]) {
    return
  }

  delete errors.value[field]
}

const validateForm = () => {
  const result = projectSchema.safeParse(form)

  errors.value = {}

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0]

      if (field && !errors.value[field]) {
        errors.value[field] = issue.message
      }
    })
  }

  return result
}

const fileInput = ref(null)

const existingThumbnailUrl = ref(props.project?.thumbnailUrl ?? '')

const newThumbnailPreviewUrl = ref('')

const thumbnailPreview = computed(() => {
  return newThumbnailPreviewUrl.value || existingThumbnailUrl.value
})

const handleFile = (event) => {
  const file = event.target.files?.[0] ?? null

  if (newThumbnailPreviewUrl.value) {
    URL.revokeObjectURL(newThumbnailPreviewUrl.value)

    newThumbnailPreviewUrl.value = ''
  }

  form.thumbnail = file

  clearError('thumbnail')

  if (file) {
    newThumbnailPreviewUrl.value = URL.createObjectURL(file)
  }
}

const removeNewThumbnail = () => {
  if (newThumbnailPreviewUrl.value) {
    URL.revokeObjectURL(newThumbnailPreviewUrl.value)
  }

  newThumbnailPreviewUrl.value = ''

  form.thumbnail = null

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  clearError('thumbnail')
}

const toggleValue = (array, value) => {
  const index = array.indexOf(value)

  if (index === -1) {
    array.push(value)
  } else {
    array.splice(index, 1)
  }
}

const submit = () => {
  const result = validateForm()

  if (!result.success) {
    return
  }

  emit('save', result.data)
}

onUnmounted(() => {
  if (newThumbnailPreviewUrl.value) {
    URL.revokeObjectURL(newThumbnailPreviewUrl.value)
  }
})
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
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 class="font-semibold text-white">
              {{ isEditMode ? 'Edit Project' : 'Create Project' }}
            </h2>

            <p class="mt-1 text-xs text-zinc-500">
              Fill project information, tags, technologies and thumbnail.
            </p>
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

        <!-- Form -->
        <form class="max-h-[calc(92vh-73px)] overflow-y-auto" @submit.prevent="submit">
          <div class="grid gap-4 p-6 sm:grid-cols-2">
            <!-- Dynamic fields -->
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

            <!-- Featured -->
            <div>
              <span class="mb-1.5 block text-sm text-zinc-300"> Featured </span>

              <label
                class="flex h-[42px] cursor-pointer items-center gap-2 rounded-md border border-zinc-700 bg-[#111111] px-3"
              >
                <input v-model="form.featured" type="checkbox" class="size-4 accent-white" />

                <span class="text-sm text-zinc-300"> Featured project </span>
              </label>

              <p class="mt-1 min-h-5 text-xs text-red-400">
                {{ errors.featured }}
              </p>
            </div>

            <!-- Thumbnail -->
            <div class="sm:col-span-2">
              <span class="mb-1.5 block text-sm text-zinc-300"> Thumbnail </span>

              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="w-full rounded-md border bg-[#111111] px-3 py-2.5 text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-black"
                :class="errors.thumbnail ? 'border-red-500' : 'border-zinc-700'"
                @change="handleFile"
              />

              <p class="mt-1 min-h-5 text-xs text-red-400">
                {{ errors.thumbnail }}
              </p>

              <!-- Thông tin file MỚI -->
              <div
                v-if="form.thumbnail"
                class="mb-3 flex items-center justify-between text-xs text-zinc-500"
              >
                <span class="truncate">
                  {{ form.thumbnail.name }}
                </span>

                <span class="ml-4 shrink-0">
                  {{ (form.thumbnail.size / 1024).toFixed(1) }}
                  KB
                </span>
              </div>

              <!-- Preview ảnh -->
              <div
                v-if="thumbnailPreview"
                class="relative overflow-hidden rounded-lg border border-zinc-700 bg-[#111111]"
              >
                <img
                  :src="thumbnailPreview"
                  alt="Thumbnail preview"
                  class="h-64 w-full object-cover"
                />

                <!-- Đang hiển thị ảnh MỚI -->
                <button
                  v-if="form.thumbnail"
                  type="button"
                  class="absolute right-3 top-3 rounded-md bg-black/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black"
                  @click="removeNewThumbnail"
                >
                  Remove new image
                </button>

                <!-- Đang hiển thị ảnh CŨ -->
                <span
                  v-else-if="existingThumbnailUrl"
                  class="absolute bottom-3 left-3 rounded-md bg-black/80 px-3 py-1.5 text-xs text-white"
                >
                  Current thumbnail
                </span>
              </div>

              <!-- Edit mode nhưng project không có ảnh -->
              <p v-else-if="isEditMode" class="text-xs text-zinc-500">
                This project has no thumbnail.
              </p>
            </div>

            <!-- Tags -->
            <div class="sm:col-span-2">
              <p class="mb-2 text-sm text-zinc-300">Tags</p>

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

              <p class="mt-1 min-h-5 text-xs text-red-400">
                {{ errors.tagIds }}
              </p>
            </div>

            <!-- Technologies -->
            <div class="sm:col-span-2">
              <p class="mb-2 text-sm text-zinc-300">Technologies</p>

              <div v-if="props.technologies.length" class="flex flex-wrap gap-2">
                <button
                  v-for="technology in props.technologies"
                  :key="technology.id"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs transition"
                  :class="
                    form.technologyIds.includes(technology.id)
                      ? 'border-white bg-white text-black'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  "
                  @click="toggleValue(form.technologyIds, technology.id)"
                >
                  {{ technology.name }}
                </button>
              </div>

              <p v-else class="text-xs text-zinc-500">No technologies available.</p>

              <p class="mt-1 min-h-5 text-xs text-red-400">
                {{ errors.technologyIds }}
              </p>
            </div>

            <!-- Server error -->
            <p v-if="props.error" class="sm:col-span-2 text-sm text-red-400">
              {{ props.error }}
            </p>
          </div>

          <!-- Footer -->
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

              <span v-if="props.isLoading"> Saving... </span>

              <span v-else>
                {{ isEditMode ? 'Save Changes' : 'Create Project' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
