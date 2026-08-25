<script setup>
import ProjectStatusBadge from '../projects/ProjectStatusBadge.vue'
import { useI18n } from '@/composables/useI18n'

defineProps({
  moments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'delete', 'detail'])
const { t } = useI18n()
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-zinc-800 bg-[#18181b]">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[900px]">
        <thead>
          <tr class="border-b border-zinc-800 bg-[#111111]">
            <th class="w-[40%] px-4 py-3 text-left text-xs font-medium text-zinc-400">
              {{ t('admin.table.moment') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400">
              {{ t('admin.table.status') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-zinc-400">
              {{ t('admin.table.actions') }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-14 text-center text-sm text-zinc-500">
              {{ t('admin.table.loadingMoments') }}
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="moment in moments"
              :key="moment.id"
              class="border-b border-zinc-800/80 transition last:border-0 hover:bg-zinc-800/30"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="moment.images?.[0]?.url"
                    :src="moment.images[0].url"
                    alt=""
                    class="size-12 rounded-lg object-cover"
                  />
                  <div class="min-w-0">
                    <p class="line-clamp-2 text-sm font-medium text-zinc-200">
                      {{ moment.content }}
                    </p>
                    <p class="mt-1 text-xs text-zinc-500">
                      {{
                        moment.categories?.map((category) => category.name).join(', ') ||
                        'No category'
                      }}
                    </p>
                    <p class="text-xs text-zinc-600">
                      {{ moment.tags?.map((tag) => tag.name).join(', ') }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-4 py-4">
                <ProjectStatusBadge :status="moment.status" />
              </td>

              <td class="px-4 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    :title="t('admin.table.edit')"
                    class="rounded-md px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    @click="emit('edit', moment)"
                  >
                    {{ t('admin.table.edit') }}
                  </button>
                  <button
                    type="button"
                    :title="t('admin.table.delete')"
                    class="rounded-md px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40"
                    @click="emit('delete', moment)"
                  >
                    {{ t('admin.table.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!loading && moments.length === 0">
            <td colspan="5" class="px-4 py-14 text-center">
              <a-empty description="No Data not found" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
