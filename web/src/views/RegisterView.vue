<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue'
import LayoutContainer from '../layouts/LayoutContainer.vue'
</script>

<template>
  <LayoutContainer>
    <section class="py-16">
      <div class="mb-8 text-center">
        <h1 class="mt-3 text-4xl font-bold text-[var(--fg)]">Tạo tài khoản</h1>
      </div>

      <RegisterForm />
    </section>
  </LayoutContainer>
</template>
