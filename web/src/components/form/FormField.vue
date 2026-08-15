<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    default: 'text',
  },

  component: {
    type: String,
    default: 'input',
  },

  rows: {
    type: Number,
    default: 3,
  },

  options: {
    type: Array,
    default: () => [],
  },

  colSpan: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
})

const model = defineModel() // cho phép component v-model
</script>
<template>
  <label :class="colSpan">
    <span class="mb-1.5 block text-sm text-zinc-300">
      {{ label }}
    </span>

    <!-- Input -->
    <input
      v-if="component === 'input'"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none transition focus:border-zinc-500"
    />

    <!-- Textarea -->
    <textarea
      v-else-if="component === 'textarea'"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      class="w-full resize-y rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none transition focus:border-zinc-500"
    />

    <!-- Select -->
    <select
      v-else-if="component === 'select'"
      v-model="model"
      class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none transition focus:border-zinc-500"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <p class="mt-1 min-h-5 text-xs text-red-400">
      {{ error }}
    </p>
  </label>
</template>
