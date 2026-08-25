<script setup>
import { reactive, watch } from 'vue'
import { categorySchema } from '../../../../schemas/moment.schema'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  category: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
const form = reactive({
  name: '',
})
const errors = reactive({
  name: '',
})

const fields = [
  {
    key: 'name',
    label: 'Category name',
    placeholder: 'Example: Music',
    required: true,
  },
]

const emit = defineEmits(['update:open', 'closed', 'submit'])

function resetForm() {
  form.name = props.category?.name ?? ''
  errors.name = ''
}

watch(() => [props.open, props.category], resetForm, { immediate: true })

function close() {
  emit('update:open', false)
  emit('closed')
}

const submit = () => {
  errors.name = ''
  const result = categorySchema.safeParse(form)
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      if (field && !errors[field]) errors[field] = issue.message
    })
    return
  }

  emit('submit', result.data)
}
</script>
<template>
  <a-modal
    :open="open"
    :title="category ? 'Edit Category' : 'Create Category'"
    :confirm-loading="loading"
    :ok-text="category ? 'Save Changes' : 'Create Category'"
    @cancel="close"
    @ok="submit"
  >
    <a-form layout="vertical">
      <a-form-item
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :required="field.required"
      >
        <a-input
          v-model:value="form[field.key]"
          :placeholder="field.placeholder"
          :status="errors[field.key] ? 'error' : undefined"
          @input="errors[field.key] = ''"
        />
        <p class="mt-1 min-h-5 text-xs text-red-400">{{ errors[field.key] }}</p>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
