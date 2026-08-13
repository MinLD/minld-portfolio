<script setup>
import {
  Boxes,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  Tags,
  X,
  Zap,
} from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const route = useRoute()

const navigation = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/admin',
    enabled: true,
  },
  {
    label: 'Projects',
    icon: FolderKanban,
    to: '/admin/projects',
    enabled: false,
  },
  {
    label: 'Categories',
    icon: Tags,
    to: '/admin/categories',
    enabled: false,
  },
  {
    label: 'Technologies',
    icon: Boxes,
    to: '/admin/technologies',
    enabled: false,
  },
  {
    label: 'Moments',
    icon: Zap,
    to: '/admin/moments',
    enabled: false,
  },
  {
    label: 'Comments',
    icon: MessageSquareText,
    to: '/admin/comments',
    enabled: false,
  },
]

function isActive(path) {
  if (path === '/admin') {
    return route.path === '/admin'
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-[#111111] transition-transform duration-200 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-16 items-center border-b border-zinc-800 px-5">
      <RouterLink to="/admin" class="flex items-center gap-3" @click="emit('close')">
        <div
          class="flex size-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-black"
        >
          M
        </div>

        <div>
          <p class="text-sm font-semibold text-white">MinLD</p>

          <p class="text-xs text-zinc-500">Administration</p>
        </div>
      </RouterLink>

      <button
        type="button"
        class="ml-auto flex size-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-900 hover:text-white lg:hidden"
        aria-label="Close sidebar"
        @click="emit('close')"
      >
        <X :size="19" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-5">
      <p class="mb-2 px-3 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
        Workspace
      </p>

      <div class="space-y-1">
        <template v-for="item in navigation" :key="item.label">
          <RouterLink
            v-if="item.enabled"
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
            :class="
              isActive(item.to)
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
            "
            @click="emit('close')"
          >
            <component :is="item.icon" :size="18" />

            <span>
              {{ item.label }}
            </span>
          </RouterLink>

          <div
            v-else
            class="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700"
          >
            <component :is="item.icon" :size="18" />

            <span>
              {{ item.label }}
            </span>

            <span
              class="ml-auto rounded-md border border-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600"
            >
              Soon
            </span>
          </div>
        </template>
      </div>
    </nav>

    <div class="border-t border-zinc-800 p-4">
      <a
        href="/"
        target="_blank"
        class="flex items-center justify-center rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
      >
        View portfolio
      </a>
    </div>
  </aside>
</template>
