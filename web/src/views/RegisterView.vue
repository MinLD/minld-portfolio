<script setup>
import AppContainer from '@/components/shared/AppContainer.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
</script>

<template>
  <AppContainer>
    <section class="py-16">
      <div class="mb-8 text-center">
        <h1 class="mt-3 text-4xl font-bold text-white">Tạo tài khoản</h1>
      </div>

      <RegisterForm />
    </section>
  </AppContainer>
</template>
