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
        <div class="mt-1 h-2">
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
        <div class="mt-1 h-2">
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
      <p class="min-h-2 text-sm text-red-400" role="alert">
        {{ authStore.error }}
      </p>
    </form>

    <div class="flex items-center gap-3">
      <div class="h-px flex-1 bg-zinc-700"></div>

      <span class="whitespace-nowrap text-sm text-zinc-400"> or login account </span>

      <div class="h-px flex-1 bg-zinc-700"></div>
    </div>

    <!-- Social login -->
    <div class="grid grid-cols-2 gap-4">
      <button
        data-slot="button"
        class="backdrop-blur-sm inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs hover:text-accent-foreground dark:border-input h-9 px-4 py-2 has-[&gt;svg]:px-3 w-full bg-white text-black hover:bg-gray-50 border border-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-100"
      >
        <svg
          class="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          ></path>
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          ></path>
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          ></path>
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          ></path></svg
        >Google</button
      ><button
        data-slot="button"
        class="backdrop-blur-sm inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs dark:border-input h-9 px-4 py-2 has-[&gt;svg]:px-3 w-full bg-[#24292e] text-white hover:bg-[#24292e]/90 border-transparent dark:bg-white dark:text-black dark:hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-github mr-2 h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
          ></path>
          <path d="M9 18c-4.51 2-5-2-7-2"></path></svg
        >Github
      </button>
    </div>
  </div>
</template>
