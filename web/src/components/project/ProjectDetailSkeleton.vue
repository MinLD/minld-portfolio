<template>
  <div class="relative z-10 animate-pulse">
    <section class="min-h-[620px] bg-[var(--surface)]">
      <div class="mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-28 sm:px-6 lg:px-8">
        <div class="w-full max-w-5xl">
          <div class="h-10 w-40 rounded-md bg-white/15"></div>
          <div class="mt-8 h-16 w-full max-w-3xl rounded bg-white/15 md:h-24"></div>
          <div class="mt-5 h-6 w-full max-w-2xl rounded bg-white/10"></div>
          <div class="mt-3 h-6 w-3/4 max-w-xl rounded bg-white/10"></div>
          <div class="mt-8 flex gap-3">
            <div class="h-11 w-32 rounded-md bg-white/20"></div>
            <div class="h-11 w-36 rounded-md bg-white/10"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="-mt-20 pb-24">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[26rem_minmax(0,1fr)] lg:items-start lg:px-8">
        <aside class="space-y-6">
          <div v-for="index in 4" :key="index" class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-6">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-lg bg-[var(--surface)]"></div>
              <div class="h-6 w-36 rounded bg-[var(--surface)]"></div>
            </div>
            <div class="mt-6 space-y-4">
              <div class="h-4 w-full rounded bg-[var(--surface)]"></div>
              <div class="h-4 w-5/6 rounded bg-[var(--surface)]"></div>
              <div class="h-4 w-2/3 rounded bg-[var(--surface)]"></div>
            </div>
          </div>
        </aside>

        <div class="space-y-8">
          <article class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-8 md:p-12">
            <div class="h-10 w-72 max-w-full rounded bg-[var(--surface)]"></div>
            <div class="mt-8 space-y-5">
              <div class="h-5 w-full rounded bg-[var(--surface)]"></div>
              <div class="h-5 w-full rounded bg-[var(--surface)]"></div>
              <div class="h-5 w-11/12 rounded bg-[var(--surface)]"></div>
              <div class="h-5 w-4/5 rounded bg-[var(--surface)]"></div>
            </div>
          </article>

          <section class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-8 md:p-12">
            <div class="h-8 w-40 rounded bg-[var(--surface)]"></div>
            <div class="mt-8 rounded-xl border border-[var(--border)] p-6">
              <div class="h-6 w-32 rounded bg-[var(--surface)]"></div>
              <div class="mt-7 h-10 w-full rounded bg-[var(--surface)]"></div>
              <div class="mt-4 h-28 w-full rounded bg-[var(--surface)]"></div>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>
