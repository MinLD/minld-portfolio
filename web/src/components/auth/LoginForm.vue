<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginSchema } from '../../schemas/auth.schema'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})
const errors = ref({
  email: '',
  password: '',
})

function validateForm() {
  const result = loginSchema.safeParse(form)
  errors.value = {
    email: '',
    password: '',
  }
  if (result.success) {
    return result.data
  }
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (field && !errors.value[field]) {
      errors.value[field] = issue.message
    }
  }

  return null
}
function getRedirectPath() {
  const redirect = route.query.redirect

  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    return redirect
  }

  return '/'
}

function clearError(field) {
  errors.value[field] = ''
}

async function submitLogin() {
  authStore.clearError()
  const credentials = validateForm()
  if (!credentials) {
    return
  }

  try {
    await authStore.login(credentials)
    await router.replace(getRedirectPath())
  } catch {
    // authStore.login() đã xử lý và set authStore.error
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-6">
    <form class="flex w-full flex-col gap-4" @submit.prevent="submitLogin" novalidate>
      <div>
        <label class="mb-1 block text-sm text-zinc-300" for="email">Email</label>
        <input
          id="email"
          v-model.trim="form.email"
          class="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
          :class="{
            'border-red-500': errors.email,
            'focus:border-white': !errors.email,
          }"
          placeholder="you@example.com"
          type="email"
          autocomplete="email"
          required
          @input="clearError('email')"
        />
        <div class="mt-1 h-3">
          <p v-show="errors.email" class="text-sm text-red-400">
            {{ errors.email }}
          </p>
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm text-zinc-300" for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          class="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
          :class="{
            'border-red-500': errors.password,
            'focus:border-white': !errors.password,
          }"
          placeholder="••••••••"
          type="password"
          autocomplete="current-password"
          required
          @input="clearError('password')"
        />
        <div class="mt-1 h-3">
          <p v-show="errors.password" class="text-sm text-red-400">
            {{ errors.password }}
          </p>
        </div>
      </div>

      <button
        class="rounded-xl bg-white px-4 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        :disabled="authStore.loading"
      >
        {{ authStore.loading ? '...' : 'Login' }}
      </button>
      <p class="min-h-5 text-sm text-red-400" role="alert">
        {{ authStore.error }}
      </p>
    </form>

    <!-- <p class="text-center text-sm text-zinc-400">
      Chưa có tài khoản?
      <RouterLink class="font-semibold text-white hover:text-yellow-300" to="/register">
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
