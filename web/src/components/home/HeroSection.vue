<script setup>
const roles = ['Software Engineer', 'Graphic Designer', 'Guitarist']
</script>

<template>
  <section class="relative flex h-dvh w-full items-center justify-center overflow-hidden px-6">
    <div
      class="pointer-events-none relative z-10 flex w-full max-w-4xl flex-col items-center text-c enter"
    >
      <h1
        class="font-serif text-7xl font-medium leading-none tracking-[-0.06em] text-zinc-100 sm:text-8xl md:text-9xl lg:text-[130px]"
      >
        MINLD
      </h1>

      <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
        <span
          v-for="role in roles"
          :key="role"
          class="rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 font-mono text-[11px] tracking-wide text-zinc-500 backdrop-blur-sm"
        >
          {{ role }}
        </span>
      </div>

      <!-- Description -->
      <p class="mt-10 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base sm:leading-8">
        I’m Luan DO (MinLD), and this is my personal space to document what I build, what I learn,
        and how I grow – through code, creativity, and curiosity.

        <br />

        It’s a place where I share my ongoing journey, from small experiments to long-term projects,
        and the lessons I collect along the way.
      </p>

      <!-- Actions -->
      <div class="pointer-events-auto mt-10 flex flex-col items-center gap-7 sm:flex-row">
        <a
          href="/resume.pdf"
          target="_blank"
          class="flex h-12 min-w-[125px] items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-zinc-900 transition duration-300 hover:scale-105 hover:bg-zinc-200"
        >
          Resume
        </a>

        <div class="flex items-center gap-6 text-zinc-500">
          <a href="#" class="transition duration-300 hover:-translate-y-1 hover:text-white">
            Facebook
          </a>

          <a href="#" class="transition duration-300 hover:-translate-y-1 hover:text-white">
            GitHub
          </a>

          <a href="#" class="transition duration-300 hover:-translate-y-1 hover:text-white">
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
