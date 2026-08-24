<script setup>
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LoadingButton from '@/components/loading/LoadingButton.vue'

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
        <label class="mb-1 block text-sm text-[var(--soft)]" for="displayName">Tên hiển thị</label>
        <input
          id="displayName"
          v-model.trim="form.displayName"
          class="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--focus)]"
          placeholder="MinLD"
          autocomplete="name"
          required
        />
      </div>

      <div>
        <label class="mb-1 block text-sm text-[var(--soft)]" for="email">Email</label>
        <input
          id="email"
          v-model.trim="form.email"
          class="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--focus)]"
          placeholder="you@example.com"
          type="email"
          autocomplete="email"
          required
        />
      </div>

      <div>
        <label class="mb-1 block text-sm text-[var(--soft)]" for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          class="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--focus)]"
          placeholder="Ít nhất 8 ký tự"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
        />
      </div>

      <p v-if="authStore.error" class="text-sm text-red-400">{{ authStore.error }}</p>

      <LoadingButton
        class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--action-bg)] px-4 py-3 font-semibold text-[var(--action-fg)] transition hover:bg-[var(--action-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        :loading="authStore.loading"
      >
        <span>{{ authStore.loading ? 'Đang đăng ký...' : 'Đăng ký' }}</span>
      </LoadingButton>
    </form>

    <p class="text-center text-sm text-[var(--muted)]">
      Đã có tài khoản?
      <RouterLink class="font-semibold text-[var(--fg)] hover:underline" to="/login">
        Đăng nhập
      </RouterLink>
    </p>
  </div>
</template>
