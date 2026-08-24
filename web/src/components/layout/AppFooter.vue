<script setup>
import { ArrowUp, Github, Linkedin, Mail, Send } from 'lucide-vue-next'

import AppLogo from '@/components/shared/AppLogo.vue'
import { footerNavigation } from '@/config/navigation'
import LayoutContainer from '../../layouts/LayoutContainer.vue'

const currentYear = new Date().getFullYear()

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="z-50 border-t border-[var(--border)] bg-[var(--page)]">
    <LayoutContainer>
      <!-- Main footer -->
      <div class="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <section class="lg:col-span-5">
          <AppLogo />

          <p class="mt-5 max-w-sm text-sm leading-6 text-[var(--muted)]">
            Full Stack Developer building thoughtful web experiences and sharing the journey through
            code.
          </p>

          <div class="mt-8 flex items-center gap-3">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              class="inline-flex size-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--fg)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
              aria-label="GitHub"
            >
              <Github :size="18" />
            </a>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              class="inline-flex size-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--fg)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
              aria-label="LinkedIn"
            >
              <Linkedin :size="18" />
            </a>

            <a
              href="mailto:hello@example.com"
              class="inline-flex size-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--fg)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
              aria-label="Email"
            >
              <Mail :size="18" />
            </a>
          </div>
        </section>

        <section class="lg:col-span-2">
          <h2 class="text-sm font-semibold text-[var(--fg)]">Explore</h2>

          <nav class="mt-5 flex flex-col gap-3">
            <RouterLink
              v-for="item in footerNavigation"
              :key="item.to"
              :to="item.to"
              class="w-fit text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
            >
              {{ item.label }}
            </RouterLink>
          </nav>
        </section>

        <section class="lg:col-span-2">
          <h2 class="text-sm font-semibold text-[var(--fg)]">Connect</h2>

          <div class="mt-5 flex flex-col gap-3">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              class="w-fit text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              class="w-fit text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
            >
              LinkedIn
            </a>
            <a
              href="dodangminhluan@gmail.com"
              class="w-fit text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
            >
              Email me
            </a>
          </div>
        </section>

        <section class="lg:col-span-3">
          <h2 class="text-sm font-semibold text-[var(--fg)]">Newsletter</h2>
          <p class="mt-2 text-xs leading-5 text-[var(--muted)]">
            Subscribe UI is ready. Connect it to your API later.
          </p>

          <form
            class="mt-4 flex rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1 focus-within:border-[var(--muted)]"
            @submit.prevent
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              class="min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted)]"
            />

            <button
              type="submit"
              class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--fg)]"
              aria-label="Subscribe"
            >
              <Send :size="17" />
            </button>
          </form>
        </section>
      </div>

      <!-- Footer bottom -->
      <div
        class="flex flex-col gap-4 border-t border-[var(--border)] py-7 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© {{ currentYear }} MinLD. All rights reserved.</p>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href="#" class="transition hover:text-[var(--fg)]">Privacy Policy</a>
          <a href="#" class="transition hover:text-[var(--fg)]">Terms of Service</a>

          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--fg)]"
            aria-label="Scroll to top"
            @click="scrollToTop"
          >
            <ArrowUp :size="16" />
          </button>
        </div>
      </div>
    </LayoutContainer>
  </footer>
</template>
