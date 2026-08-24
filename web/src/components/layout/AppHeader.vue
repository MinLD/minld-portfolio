<script setup>
import { ref } from 'vue'
import { Menu, Search, X } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'

import AppLogo from '@/components/shared/AppLogo.vue'
import LanguageToggle from '@/components/shared/LanguageToggle.vue'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import { useI18n } from '@/composables/useI18n'
import { mainNavigation } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth.store'
import LayoutContainer from '../../layouts/LayoutContainer.vue'

const route = useRoute()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const { t } = useI18n()

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--page)]/95 backdrop-blur"
  >
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
                ? 'bg-[var(--surface)] text-[var(--fg)]'
                : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]'
            "
          >
            {{ t(item.labelKey) }}
          </RouterLink>
        </nav>

        <div class="ml-auto hidden items-center gap-3 lg:flex">
          <label class="relative block">
            <Search
              :size="16"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="search"
              :placeholder="t('common.search')"
              class="h-10 w-52 rounded-lg border border-[var(--border)] bg-[var(--bg)] pl-9 pr-3 text-sm text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
            />
          </label>

          <div class="flex w-20 justify-center">
            <span
              v-if="!authStore.initialized"
              class="h-9 w-16 rounded-lg bg-[var(--surface)]"
              aria-label="Loading auth state"
            ></span>

            <RouterLink
              v-else-if="!authStore.isAuthenticated"
              to="/login"
              class="rounded-lg px-3 py-2 text-sm font-bold text-[var(--fg)] transition hover:bg-[var(--surface)]"
            >
              {{ t('auth.login') }}
            </RouterLink>

            <RouterLink
              v-else
              to="/admin"
              class="rounded-lg px-3 py-2 text-sm font-bold text-[var(--fg)] transition hover:bg-[var(--surface)]"
            >
              {{ t('common.admin') }}
            </RouterLink>
          </div>

          <!-- <a
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
          /></a> -->
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <button
          type="button"
          class="ml-auto inline-flex size-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)] md:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>

      <div v-if="mobileMenuOpen" class="border-t border-[var(--border)] py-3 md:hidden">
        <nav class="flex flex-col gap-1" aria-label="Mobile navigation">
          <RouterLink
            v-for="item in mainNavigation"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-2.5 text-sm transition"
            :class="
              isActive(item.to)
                ? 'bg-[var(--surface)] text-[var(--fg)]'
                : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]'
            "
            @click="closeMobileMenu"
          >
            {{ t(item.labelKey) }}
          </RouterLink>

          <RouterLink
            v-if="authStore.initialized && !authStore.isAuthenticated"
            to="/login"
            class="rounded-lg px-3 py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            @click="closeMobileMenu"
          >
            {{ t('auth.login') }}
          </RouterLink>

          <RouterLink
            v-else-if="authStore.initialized"
            to="/admin"
            class="rounded-lg px-3 py-2.5 text-left text-sm text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            @click="closeMobileMenu"
          >
            {{ t('common.admin') }}
          </RouterLink>

          <div class="mt-2 border-t border-[var(--border)] pt-3">
            <div class="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </LayoutContainer>
  </header>
</template>
