<template>
  <main class="grid min-h-dvh place-items-center bg-[var(--bg)] px-6 text-[var(--fg)]">
    <div class="flex flex-col items-center gap-5">
      <div class="relative size-14">
        <span class="absolute inset-0 rounded-full border border-[var(--border)]"></span>
        <span
          class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--action-bg)]"
        ></span>
      </div>
      <div class="text-center">
        <p class="font-serif text-2xl font-semibold">MinLD</p>
        <p class="mt-1 text-sm text-[var(--muted)]">Restoring session...</p>
      </div>
    </div>
  </main>
</template>
