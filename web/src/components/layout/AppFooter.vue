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
  <footer class="border-t border-zinc-800 bg-[#151515] z-50">
    <LayoutContainer>
      <!-- Main footer -->
      <div class="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <section class="lg:col-span-5">
          <AppLogo />

          <p class="mt-5 max-w-sm text-sm leading-6 text-zinc-500">
            Full Stack Developer building thoughtful web experiences and sharing the journey through
            code.
          </p>

          <div class="mt-8 flex items-center gap-3">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              class="inline-flex size-10 items-center justify-center rounded-full bg-[#f3ead9] text-zinc-700 transition hover:-translate-y-0.5 hover:bg-white"
              aria-label="GitHub"
            >
              <Github :size="18" />
            </a>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              class="inline-flex size-10 items-center justify-center rounded-full bg-[#f3ead9] text-zinc-700 transition hover:-translate-y-0.5 hover:bg-white"
              aria-label="LinkedIn"
            >
              <Linkedin :size="18" />
            </a>

            <a
              href="mailto:hello@example.com"
              class="inline-flex size-10 items-center justify-center rounded-full bg-[#f3ead9] text-zinc-700 transition hover:-translate-y-0.5 hover:bg-white"
              aria-label="Email"
            >
              <Mail :size="18" />
            </a>
          </div>
        </section>

        <section class="lg:col-span-2">
          <h2 class="text-sm font-semibold text-zinc-100">Explore</h2>

          <nav class="mt-5 flex flex-col gap-3">
            <RouterLink
              v-for="item in footerNavigation"
              :key="item.to"
              :to="item.to"
              class="w-fit text-sm text-zinc-500 transition hover:text-zinc-100"
            >
              {{ item.label }}
            </RouterLink>
          </nav>
        </section>

        <section class="lg:col-span-2">
          <h2 class="text-sm font-semibold text-zinc-100">Connect</h2>

          <div class="mt-5 flex flex-col gap-3">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              class="w-fit text-sm text-zinc-500 transition hover:text-zinc-100"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              class="w-fit text-sm text-zinc-500 transition hover:text-zinc-100"
            >
              LinkedIn
            </a>
            <a
              href="mailto:hello@example.com"
              class="w-fit text-sm text-zinc-500 transition hover:text-zinc-100"
            >
              Email me
            </a>
          </div>
        </section>

        <section class="lg:col-span-3">
          <h2 class="text-sm font-semibold text-zinc-100">Newsletter</h2>
          <p class="mt-2 text-xs leading-5 text-zinc-600">
            Subscribe UI is ready. Connect it to your API later.
          </p>

          <form
            class="mt-4 flex rounded-xl border border-zinc-800 bg-black p-1 focus-within:border-zinc-700"
            @submit.prevent
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              class="min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            />

            <button
              type="submit"
              class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Subscribe"
            >
              <Send :size="17" />
            </button>
          </form>
        </section>
      </div>

      <!-- Footer bottom -->
      <div
        class="flex flex-col gap-4 border-t border-zinc-800 py-7 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© {{ currentYear }} MinLD. All rights reserved.</p>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href="#" class="transition hover:text-zinc-300">Privacy Policy</a>
          <a href="#" class="transition hover:text-zinc-300">Terms of Service</a>

          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 transition hover:border-zinc-700 hover:text-white"
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
