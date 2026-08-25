<script setup>
import { ChevronDown, ExternalLink, X } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'

import { adminNavigation } from '@/config/admin/navigation'
import { useI18n } from '@/composables/useI18n'
import { ref } from 'vue'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const openGroups = ref(new Set(adminNavigation.filter(hasChildren).map((item) => item.to)))
const route = useRoute()
const { t } = useI18n()

function isActive(path) {
  if (path === '/admin') {
    return route.path === '/admin'
  }

  return route.path.startsWith(path)
}

function isExactActive(path) {
  return route.path === path
}

function hasChildren(item) {
  return item.children?.some((child) => child.enabled)
}

function isGroupOpen(item) {
  return openGroups.value.has(item.to) || item.children?.some((child) => isExactActive(child.to))
}

function toggleGroup(item) {
  const next = new Set(openGroups.value)
  if (next.has(item.to)) next.delete(item.to)
  else next.add(item.to)
  openGroups.value = next
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-[#111111] transition-transform duration-200 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <header class="flex h-16 items-center border-b border-zinc-800 px-5">
      <RouterLink to="/admin" class="flex min-w-0 items-center gap-3" @click="emit('close')">
        <div
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-black"
        >
          M
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-white">MinLD</p>

          <p class="truncate text-xs text-zinc-500">{{ t('admin.administration') }}</p>
        </div>
      </RouterLink>

      <button
        type="button"
        class="ml-auto flex size-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-900 hover:text-white lg:hidden"
        :aria-label="t('admin.closeSidebar')"
        @click="emit('close')"
      >
        <X :size="19" />
      </button>
    </header>

    <nav class="flex-1 overflow-y-auto px-3 py-5">
      <p class="mb-2 px-3 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
        {{ t('admin.workspace') }}
      </p>

      <div class="space-y-1">
        <template v-for="item in adminNavigation" :key="item.to">
          <div v-if="item.enabled">
            <button
              v-if="hasChildren(item)"
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
              :class="
                item.children.some((child) => isExactActive(child.to))
                  ? ''
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
              "
              :aria-expanded="isGroupOpen(item)"
              @click="toggleGroup(item)"
            >
              <component :is="item.icon" :size="18" />

              <span class="truncate">
                {{ t(item.labelKey) }}
              </span>

              <ChevronDown
                :size="16"
                class="ml-auto transition-transform"
                :class="isGroupOpen(item) && 'rotate-180'"
              />
            </button>

            <div v-else class="flex items-center gap-1">
              <RouterLink
                :to="item.to"
                class="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
                :class="
                  isActive(item.to)
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
                "
                @click="emit('close')"
              >
                <component :is="item.icon" :size="18" />

                <span class="truncate">
                  {{ t(item.labelKey) }}
                </span>
              </RouterLink>
            </div>

            <div v-if="isGroupOpen(item)" class="ml-7 mt-1 space-y-1 border-l border-zinc-800 pl-3">
              <RouterLink
                v-for="child in item.children?.filter((child) => child.enabled)"
                :key="child.labelKey"
                :to="child.to"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                :class="
                  isExactActive(child.to)
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-200'
                "
                @click="emit('close')"
              >
                <component :is="item.icon" :size="18" />

                <span class="truncate">
                  {{ t(child.labelKey) }}
                </span>
              </RouterLink>
            </div>
          </div>

          <div
            v-else
            class="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700"
          >
            <component :is="item.icon" :size="18" />

            <span>
              {{ t(item.labelKey) }}
            </span>

            <span
              class="ml-auto rounded-md border border-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-600"
            >
              Soon
            </span>
          </div>
        </template>
      </div>
    </nav>

    <footer class="border-t border-zinc-800 p-4">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
      >
        {{ t('admin.viewPortfolio') }}

        <ExternalLink :size="15" />
      </a>
    </footer>
  </aside>
</template>
