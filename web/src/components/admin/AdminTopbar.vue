<script setup>
import { LogOut, Menu } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/composables/useI18n'

const emit = defineEmits(['open-sidebar'])

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

async function logout() {
  await authStore.logout()

  await router.replace('/login')
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center border-b border-zinc-800 bg-[#151515]/95 px-4 backdrop-blur sm:px-6"
  >
    <button
      type="button"
      class="mr-3 flex size-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:bg-zinc-900 hover:text-white lg:hidden"
      :aria-label="t('admin.openSidebar')"
      @click="emit('open-sidebar')"
    >
      <Menu :size="20" />
    </button>

    <div>
      <p class="text-sm font-medium text-white">{{ t('admin.panel') }}</p>

      <p class="hidden text-xs text-zinc-500 sm:block">{{ t('admin.panelDescription') }}</p>
    </div>

    <div class="ml-auto flex items-center gap-3">
      <div v-if="authStore.user" class="hidden text-right sm:block">
        <p class="text-sm font-medium text-zinc-200">
          {{ authStore.user.displayName }}
        </p>

        <p class="text-xs text-zinc-600">
          {{ authStore.user.email }}
        </p>
      </div>

      <div
        v-if="authStore.user"
        class="flex size-9 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900"
      >
        <img
          v-if="authStore.user.avatarUrl"
          :src="authStore.user.avatarUrl"
          :alt="authStore.user.displayName"
          class="size-full object-cover"
        />

        <span v-else class="text-sm font-semibold text-zinc-400">
          {{ authStore.user.displayName?.charAt(0)?.toUpperCase() || 'A' }}
        </span>
      </div>

      <button
        type="button"
        class="flex size-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-900 hover:text-red-400"
        :title="t('admin.logout')"
        :aria-label="t('admin.logout')"
        @click="logout"
      >
        <LogOut :size="18" />
      </button>
    </div>
  </header>
</template>
