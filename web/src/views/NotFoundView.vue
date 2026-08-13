<template>
  <main class="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
    <div class="text-center">
      <p class="text-sm text-zinc-500">404</p>

      <h1 class="mt-3 text-4xl font-bold text-white">Page not found</h1>

      <p class="mt-3 text-zinc-400">
        The page you're looking for doesn't exist or you don't have permission to access it.
      </p>

      <RouterLink
        to="/"
        class="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950"
      >
        Back to home
      </RouterLink>
    </div>
  </main>
</template>
