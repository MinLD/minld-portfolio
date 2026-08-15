<script setup>
import ProjectStatusBadge from './ProjectStatusBadge.vue'

defineProps({
  projects: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-zinc-800 bg-[#18181b]">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[900px]">
        <thead>
          <tr class="border-b border-zinc-800 bg-[#111111]">
            <th class="w-[40%] px-4 py-3 text-left text-xs font-medium text-zinc-400">Project</th>
            <th class="w-[20%] px-4 py-3 text-left text-xs font-medium text-zinc-400">Tags</th>
            <th class="w-[25%] px-4 py-3 text-left text-xs font-medium text-zinc-400">Tech</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400">Status</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-zinc-400">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-14 text-center text-sm text-zinc-500">
              Loading projects...
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="project in projects"
              :key="project.id"
              class="border-b border-zinc-800/80 transition last:border-0 hover:bg-zinc-800/30"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="project.thumbnailUrl"
                    :src="project.thumbnailUrl"
                    alt=""
                    class="size-12 rounded-lg object-cover"
                  />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-zinc-200">{{ project.title }}</p>
                    <p class="mt-1 line-clamp-2 text-xs text-zinc-500">{{ project.summary }}</p>
                  </div>
                </div>
              </td>

              <td class="px-4 py-4 text-sm text-zinc-400">
                {{ project.tags?.map((tag) => tag.name).join(', ') || '—' }}
              </td>

              <td class="px-4 py-4 text-sm text-zinc-400">
                {{ project.technologies?.map((technology) => technology.name).join(', ') || '—' }}
              </td>

              <td class="px-4 py-4">
                <ProjectStatusBadge :status="project.status" />
              </td>

              <td class="px-4 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    title="Edit project"
                    class="rounded-md px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    @click="emit('edit', project)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    title="Delete project"
                    class="rounded-md px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40"
                    @click="emit('delete', project)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!loading && projects.length === 0">
            <td colspan="5" class="px-4 py-14 text-center">
              <p class="text-sm text-zinc-400">No projects found</p>
              <p class="mt-1 text-xs text-zinc-600">Create your first project.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
