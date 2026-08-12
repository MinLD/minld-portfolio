<script setup>
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  displayName: '',
  email: '',
  password: '',
})

async function submitRegister() {
  await authStore.register(form)
  router.push('/login')
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-6">
    <form class="flex w-full flex-col gap-4" @submit.prevent="submitRegister">
      <div>
        <label class="mb-1 block text-sm text-zinc-300" for="displayName">Tên hiển thị</label>
        <input
          id="displayName"
          v-model.trim="form.displayName"
          class="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="MinLD"
          autocomplete="name"
          required
        />
      </div>

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
          placeholder="Ít nhất 8 ký tự"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
        />
      </div>

      <p v-if="authStore.error" class="text-sm text-red-400">{{ authStore.error }}</p>

      <button
        class="rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        :disabled="authStore.loading"
      >
        {{ authStore.loading ? 'Đang đăng ký...' : 'Đăng ký' }}
      </button>
    </form>

    <p class="text-center text-sm text-zinc-400">
      Đã có tài khoản?
      <RouterLink class="font-semibold text-yellow-400 hover:text-yellow-300" to="/login">
        Đăng nhập
      </RouterLink>
    </p>
  </div>
</template>
