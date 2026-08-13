<script setup>
import AppContainer from '@/components/shared/AppContainer.vue'
import LoginForm from '../components/auth/LoginForm.vue'
</script>

<template>
  <AppContainer>
    <section class="py-16">
      <div class="mb-8 text-center">
        <h1 class="mt-3 text-3xl font-bold text-white">Login to MinLD</h1>
      </div>

      <LoginForm />
    </section>
  </AppContainer>
</template>
