<script setup>
import { ref } from 'vue'
import { Menu, Search, X } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'

import AppLogo from '@/components/shared/AppLogo.vue'
import { mainNavigation } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth.store'
import LayoutContainer from '../../layouts/LayoutContainer.vue'

const route = useRoute()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#151515]/95 backdrop-blur">
    <LayoutContainer>
      <div class="flex h-16 items-center gap-6">
        <AppLogo />

        <nav class="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <RouterLink
            v-for="item in mainNavigation"
            :key="item.to"
            :to="item.to"
            class="rounded-full px-3.5 py-2 text-sm transition"
            :class="
              isActive(item.to)
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
            "
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="ml-auto hidden items-center gap-3 lg:flex">
          <label class="relative block">
            <Search
              :size="16"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <input
              type="search"
              placeholder="Search..."
              class="h-10 w-52 rounded-lg border border-zinc-800 bg-[#121212] pl-9 pr-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-zinc-700"
            />
          </label>

          <span
            v-if="!authStore.initialized"
            class="h-9 w-16 rounded-lg bg-zinc-800"
            aria-label="Loading auth state"
          ></span>

          <RouterLink
            v-else-if="!authStore.isAuthenticated"
            to="/login"
            class="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            Login
          </RouterLink>

          <RouterLink
            v-else
            to="/admin"
            class="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            Admin
          </RouterLink>

          <a
            href="https://www.buymeacoffee.com/minld"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden sm:inline-flex h-9 items-center hover:scale-105 transition-transform"
            ><img
              alt="Buy Me A Coffee"
              width="130"
              height="36"
              decoding="async"
              data-nimg="1"
              class="h-full w-auto max-h-9"
              style="color: transparent; width: auto; height: 100%"
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          /></a>
        </div>

        <button
          type="button"
          class="ml-auto inline-flex size-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition hover:bg-zinc-900 hover:text-white md:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>

      <div v-if="mobileMenuOpen" class="border-t border-zinc-800 py-3 md:hidden">
        <nav class="flex flex-col gap-1" aria-label="Mobile navigation">
          <RouterLink
            v-for="item in mainNavigation"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-2.5 text-sm transition"
            :class="
              isActive(item.to)
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            "
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </RouterLink>

          <RouterLink
            v-if="authStore.initialized && !authStore.isAuthenticated"
            to="/login"
            class="rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            @click="closeMobileMenu"
          >
            Login
          </RouterLink>

          <RouterLink
            v-else-if="authStore.initialized"
            to="/admin"
            class="rounded-lg px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            @click="closeMobileMenu"
          >
            Admin
          </RouterLink>
        </nav>
      </div>
    </LayoutContainer>
  </header>
</template>
