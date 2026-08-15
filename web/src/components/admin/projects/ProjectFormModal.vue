<script setup>
import { computed, reactive, ref } from 'vue'
import { projectSchema } from '@/schemas/project.schema'

const props = defineProps({
  project: { type: Object, default: null },
  tags: { type: Array, default: () => [] },
  technologies: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

const isEditMode = computed(() => Boolean(props.project))
const error = ref('')

const form = reactive({
  title: props.project?.title ?? '',
  summary: props.project?.summary ?? '',
  content: props.project?.content ?? '',
  status: props.project?.status ?? 'DRAFT',
  featured: props.project?.featured ?? false,
  year: props.project?.year ?? new Date().getFullYear(),
  publishedAt: props.project?.publishedAt?.slice(0, 16) ?? '',
  demoUrl: props.project?.demoUrl ?? '',
  githubUrl: props.project?.githubUrl ?? '',
  sourceUrl: props.project?.sourceUrl ?? '',
  tagIds: props.project?.tags?.map((tag) => tag.id) ?? [],
  technologyIds: props.project?.technologies?.map((technology) => technology.id) ?? [],
  thumbnail: null,
})

function toggle(list, id) {
  const index = list.indexOf(id)
  if (index === -1) {
    list.push(id)
    return
  }

  list.splice(index, 1)
}

function handleFile(event) {
  form.thumbnail = event.target.files?.[0] ?? null
}

function normalizePayload(data) {
  return {
    ...data,
    publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : '',
  }
}

function handleSubmit() {
  error.value = ''
  const result = projectSchema.safeParse({ ...form })

  if (!result.success) {
    error.value = result.error.issues[0]?.message ?? 'Invalid project data.'
    return
  }

  emit('save', normalizePayload(result.data))
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" @click.self="emit('close')">
      <div class="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-800 bg-[#18181b] shadow-2xl">
        <div class="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 class="text-base font-semibold text-white">{{ isEditMode ? 'Edit Project' : 'Create Project' }}</h2>
            <p class="mt-1 text-xs text-zinc-500">Select tags, technologies, optional thumbnail.</p>
          </div>

          <button type="button" class="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-800 hover:text-white" @click="emit('close')">×</button>
        </div>

        <form class="max-h-[calc(92vh-73px)] overflow-y-auto" @submit.prevent="handleSubmit">
          <div class="grid gap-4 p-6 sm:grid-cols-2">
            <label class="sm:col-span-2">
              <span class="mb-1.5 block text-sm text-zinc-300">Title</span>
              <input v-model.trim="form.title" class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500" />
            </label>

            <label class="sm:col-span-2">
              <span class="mb-1.5 block text-sm text-zinc-300">Summary</span>
              <textarea v-model.trim="form.summary" rows="2" class="w-full resize-none rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500" />
            </label>

            <label class="sm:col-span-2">
              <span class="mb-1.5 block text-sm text-zinc-300">Content</span>
              <textarea v-model.trim="form.content" rows="5" class="w-full resize-y rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500" />
            </label>

            <label>
              <span class="mb-1.5 block text-sm text-zinc-300">Status</span>
              <select v-model="form.status" class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>

            <label>
              <span class="mb-1.5 block text-sm text-zinc-300">Year</span>
              <input v-model="form.year" type="number" class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500" />
            </label>

            <label>
              <span class="mb-1.5 block text-sm text-zinc-300">Published at</span>
              <input v-model="form.publishedAt" type="datetime-local" class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500" />
            </label>

            <label class="flex items-end gap-2 pb-2 text-sm text-zinc-300">
              <input v-model="form.featured" type="checkbox" class="size-4 accent-white" /> Featured
            </label>

            <label>
              <span class="mb-1.5 block text-sm text-zinc-300">Demo URL</span>
              <input v-model.trim="form.demoUrl" class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500" />
            </label>

            <label>
              <span class="mb-1.5 block text-sm text-zinc-300">Github URL</span>
              <input v-model.trim="form.githubUrl" class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500" />
            </label>

            <label class="sm:col-span-2">
              <span class="mb-1.5 block text-sm text-zinc-300">Source URL</span>
              <input v-model.trim="form.sourceUrl" class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500" />
            </label>

            <label class="sm:col-span-2">
              <span class="mb-1.5 block text-sm text-zinc-300">Thumbnail</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" class="w-full rounded-md border border-zinc-700 bg-[#111111] px-3 py-2.5 text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-black" @change="handleFile" />
            </label>

            <div class="sm:col-span-2">
              <p class="mb-2 text-sm text-zinc-300">Tags</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="tag in tags" :key="tag.id" type="button" class="rounded-full border px-3 py-1.5 text-xs transition" :class="form.tagIds.includes(tag.id) ? 'border-white bg-white text-black' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'" @click="toggle(form.tagIds, tag.id)">{{ tag.name }}</button>
              </div>
            </div>

            <div class="sm:col-span-2">
              <p class="mb-2 text-sm text-zinc-300">Technologies</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="technology in technologies" :key="technology.id" type="button" class="rounded-full border px-3 py-1.5 text-xs transition" :class="form.technologyIds.includes(technology.id) ? 'border-white bg-white text-black' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'" @click="toggle(form.technologyIds, technology.id)">{{ technology.name }}</button>
              </div>
            </div>

            <p v-if="error" class="sm:col-span-2 text-sm text-red-400">{{ error }}</p>
          </div>

          <div class="flex justify-end gap-2 border-t border-zinc-800 px-6 py-4">
            <button type="button" class="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800" @click="emit('close')">Cancel</button>
            <button type="submit" class="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-60" :disabled="saving">{{ saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project' }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
