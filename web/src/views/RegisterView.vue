<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue'
import AppContainer from '@/components/shared/AppContainer.vue'
</script>

<template>
  <AppContainer>
    <section class="py-16">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">Register</p>
        <h1 class="mt-3 text-4xl font-bold text-white">Tạo tài khoản</h1>
        <p class="mt-3 text-zinc-400">BE tạo user, gửi email xác thực, không set token khi register.</p>
      </div>

      <RegisterForm />
    </section>
  </AppContainer>
</template>
