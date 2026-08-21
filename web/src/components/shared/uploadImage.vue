<script setup>
import { ref } from 'vue'
import { uploadImageApi } from '@/api/upload'
import { uploadImageSchema } from '@/schemas/upload-image.schema'

const props = defineProps({
  modelValue: { type: String, default: '' },
  folder: { type: String, default: 'uploads' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'error', 'clear'])

const error = ref('')
const isUploading = ref(false)

const upload = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''

  if (!file || isUploading.value || props.disabled) return

  error.value = ''

  const result = uploadImageSchema.safeParse({ file, folder: props.folder })

  if (!result.success) {
    error.value = result.error.issues[0]?.message || 'Invalid image.'
    emit('error', error.value)
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

const clear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="space-y-3">
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      :disabled="disabled || isUploading"
      class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-black disabled:cursor-not-allowed disabled:opacity-60"
      @change="upload"
    />

    <p v-if="isUploading" class="text-xs text-zinc-500">Uploading...</p>
    <p v-if="error" class="text-xs text-red-400">{{ error }}</p>

    <div
      v-if="modelValue"
      class="relative overflow-hidden rounded-lg border border-zinc-700 bg-[#111111]"
    >
      <img :src="modelValue" alt="Uploaded image preview" class="h-64 w-full object-cover" />

      <button
        type="button"
        :disabled="disabled || isUploading"
        class="absolute right-3 top-3 rounded-md bg-black/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        @click="clear"
      >
        Remove image
      </button>
    </div>
  </div>
</template>
