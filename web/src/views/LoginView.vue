<script setup>
import LoginForm from '../components/auth/LoginForm.vue'
import LayoutContainer from '../layouts/LayoutContainer.vue';
</script>

<template>
  <LayoutContainer>
    <section class="py-16">
      <div class="mb-8 text-center">
        <h1 class="mt-3 text-3xl font-bold text-white">Login to MinLD</h1>
      </div>

      <LoginForm />
    </section>
  </LayoutContainer>
</template>
