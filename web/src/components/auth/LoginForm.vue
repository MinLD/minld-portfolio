<script setup>
import { reactive } from 'vue'
import {  useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

async function submitLogin() {
  await authStore.login(form)
  router.push(String(route.query.redirect || '/'))
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-6">
    <form class="flex w-full flex-col gap-4" @submit.prevent="submitLogin">
      <div>
        <label class="mb-1 block text-sm text-zinc-300" for="email">Email</label>
        <input
          id="email"
          v-model.trim="form.email"
          class="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="you@example.com"
          type="email"
          autocomplete="email"
          required
        />
      </div>

      <div>
        <label class="mb-1 block text-sm text-zinc-300" for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          class="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="••••••••"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <p v-if="authStore.error" class="text-sm text-red-400">{{ authStore.error }}</p>

      <button
        class="rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        :disabled="authStore.loading"
      >
        {{ authStore.loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
      </button>
    </form>

    <!-- <p class="text-center text-sm text-zinc-400">
      Chưa có tài khoản?
      <RouterLink class="font-semibold text-yellow-400 hover:text-yellow-300" to="/register">
        Đăng ký
      </RouterLink>
    </p> -->
    <div class="flex items-center gap-3">
      <div class="h-px flex-1 bg-zinc-700"></div>

      <span class="whitespace-nowrap text-sm text-zinc-400"> or login account </span>

      <div class="h-px flex-1 bg-zinc-700"></div>
    </div>

    <!-- Social login -->
    <div class="flex items-center justify-center gap-5">
      <div>Google</div>
      <div>GitHub</div>
    </div>
  </div>
</template>
