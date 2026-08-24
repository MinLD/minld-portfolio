<script setup></script>
<template>
  <div class="mt-20 relative flex flex-col items-center text-center pb-5 space-y-6 mb-5">
    <div class="fixed inset-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
      <div
        class="absolute rounded-full blur-[120px] w-96 h-96 top-[-10%] left-[-5%] bg-primary/10"
        style="transform: translateX(-12.738px) translateY(12.738px)"
      ></div>
      <div
        class="absolute rounded-full blur-[120px] w-80 h-80 top-[20%] right-[-5%] bg-secondary/10"
        style="transform: translateX(1.5375px) translateY(-0.3075px)"
      ></div>
      <div
        class="absolute rounded-full blur-[120px] w-64 h-64 bottom-[10%] left-[30%] bg-primary/5"
        style="transform: translateX(-1.845px) translateY(1.38375px)"
      ></div>
    </div>
    <div class="space-y-4">
      <p class="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">GET IN TOUCH</p>
      <h1 class="text-4xl md:text-6xl font-bold tracking-tight font-serif">Contact Me</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
        Have a question or want to work together? I'd love to hear from you.
      </p>
    </div>
  </div>
</template>
