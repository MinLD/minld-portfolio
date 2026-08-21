<script setup>
import { ref } from 'vue'
import { Eye, ImagePlus, Loader2, Trash2 } from 'lucide-vue-next'
import { uploadImageApi } from '@/api/upload'
import { uploadImageSchema } from '@/schemas/upload-image.schema'

const props = defineProps({
  modelValue: { type: String, default: '' },
  folder: { type: String, default: 'uploads' },
  disabled: { type: Boolean, default: false },
  uploadImmediately: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'error', 'clear'])

const error = ref('')
const fileInput = ref(null)
const isUploading = ref(false)

const uploadFile = async (file) => {
  if (!file || isUploading.value || props.disabled) return

  error.value = ''

  const result = uploadImageSchema.safeParse({ file, folder: props.folder })

  if (!result.success) {
    error.value = result.error.issues[0]?.message || 'Invalid image.'
    emit('error', error.value)
    return
  }

  if (!props.uploadImmediately) {
    emit('update:modelValue', URL.createObjectURL(result.data.file))
    emit('uploaded', result.data.file)
    return
  }

  isUploading.value = true

  try {
    const image = await uploadImageApi(result.data.file, result.data.folder)

    emit('update:modelValue', image.url)
    emit('uploaded', image)
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Unable to upload image.'
    emit('error', error.value)
  } finally {
    isUploading.value = false
  }
}

const upload = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  await uploadFile(file)
}

const drop = async (event) => {
  await uploadFile(event.dataTransfer.files?.[0])
}

const openPicker = () => {
  if (!props.disabled && !isUploading.value) fileInput.value?.click()
}

const clear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const preview = () => {
  if (props.modelValue) window.open(props.modelValue, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="space-y-2">
    <div
      class="group relative h-32 w-32 overflow-hidden rounded-md border border-dashed border-zinc-700 bg-[#111111] text-zinc-400 transition hover:border-zinc-500 hover:text-white"
      @dragover.prevent
      @drop.prevent="drop"
    >
      <button
        type="button"
        :disabled="disabled || isUploading"
        class="absolute inset-0 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Choose image"
        @click="openPicker"
      >
        <img
          v-if="modelValue"
          :src="modelValue"
          alt="Uploaded image preview"
          class="absolute inset-0 h-full w-full object-cover"
        />

        <span
          v-if="modelValue"
          class="absolute inset-0 bg-black/0 transition group-hover:bg-black/40"
        />

        <Loader2 v-if="isUploading" class="relative z-10 size-6 animate-spin text-white" />

        <ImagePlus v-else-if="!modelValue" class="size-7" aria-hidden="true" />
      </button>

      <div
        v-if="modelValue && !isUploading"
        class="absolute inset-0 z-10 flex items-center justify-center gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
      >
        <button
          type="button"
          :disabled="disabled"
          class="flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur"
          title="View image"
          aria-label="View image"
          @click="preview"
        >
          <Eye class="size-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          :disabled="disabled"
          class="flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur"
          title="Remove image"
          aria-label="Remove image"
          @click="clear"
        >
          <Trash2 class="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      :disabled="disabled || isUploading"
      class="sr-only"
      @change="upload"
    />

    <p v-if="isUploading" class="text-xs text-zinc-500">Uploading...</p>
    <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
  </div>
</template>
