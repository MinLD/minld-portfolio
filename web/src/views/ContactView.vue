<script setup>
import { reactive, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { Building2, Mail, MessageSquare, Phone, Send, Tag, User } from 'lucide-vue-next'

import { sendContactMessageApi } from '@/api/contact'
import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import LayoutContainer from '@/layouts/LayoutContainer.vue'

const categories = [
  { label: 'General Inquiry', value: 'GENERAL_INQUIRY' },
  { label: 'Business Opportunity', value: 'BUSINESS_OPPORTUNITY' },
  { label: 'Technical Support', value: 'TECHNICAL_SUPPORT' },
  { label: 'Feedback', value: 'FEEDBACK' },
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  category: 'GENERAL_INQUIRY',
  subject: '',
  message: '',
})

const loading = ref(false)
const error = ref('')

function resetForm() {
  Object.assign(form, {
    name: '',
    email: '',
    phone: '',
    company: '',
    category: 'GENERAL_INQUIRY',
    subject: '',
    message: '',
  })
}

async function submitContact() {
  error.value = ''
  loading.value = true

  try {
    await sendContactMessageApi({ ...form })
    toast.success('Message sent successfully.')
    resetForm()
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Unable to send message.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#151515] text-zinc-100">
    <InteractiveNetwork :density="1.15" />

    <LayoutContainer>
      <section class="relative z-10 py-16 sm:py-24">
        <div class="mx-auto max-w-4xl text-center">
          <p class="font-mono text-sm font-semibold uppercase tracking-[0.4em] text-zinc-500">
            Get in touch
          </p>
          <h1 class="mt-6 font-serif text-6xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
            Contact Me
          </h1>
          <p class="mt-6 text-lg text-zinc-500 sm:text-xl">
            Have a question or want to work together? I’d love to hear from you.
          </p>
        </div>

        <form class="mx-auto mt-20 max-w-3xl space-y-6" @submit.prevent="submitContact">
          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-zinc-200">Your name</span>
            <span class="relative block">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" :size="20" />
              <input
                v-model.trim="form.name"
                required
                placeholder="Your Name"
                class="h-14 w-full rounded-lg border border-zinc-800 bg-[#151515]/75 pl-12 pr-4 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-zinc-200">Email</span>
            <span class="relative block">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" :size="20" />
              <input
                v-model.trim="form.email"
                required
                type="email"
                placeholder="example@abc.com"
                class="h-14 w-full rounded-lg border border-zinc-800 bg-[#151515]/75 pl-12 pr-4 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-zinc-200">Phone (Optional)</span>
            <span class="relative block">
              <Phone class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" :size="20" />
              <input
                v-model.trim="form.phone"
                placeholder="+84 123 456 789"
                class="h-14 w-full rounded-lg border border-zinc-800 bg-[#151515]/75 pl-12 pr-4 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-zinc-200"
              >Company (Optional)</span
            >
            <span class="relative block">
              <Building2
                class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                :size="20"
              />
              <input
                v-model.trim="form.company"
                placeholder="Your company name"
                class="h-14 w-full rounded-lg border border-zinc-800 bg-[#151515]/75 pl-12 pr-4 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-zinc-200">Category</span>
            <span class="relative block">
              <Tag class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" :size="20" />
              <select
                v-model="form.category"
                class="h-14 w-full appearance-none rounded-lg border border-zinc-800 bg-[#151515]/75 pl-12 pr-4 text-base text-zinc-100 outline-none transition focus:border-zinc-600"
              >
                <option
                  v-for="category in categories"
                  :key="category.value"
                  :value="category.value"
                >
                  {{ category.label }}
                </option>
              </select>
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-zinc-200">Subject</span>
            <span class="relative block">
              <MessageSquare
                class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                :size="20"
              />
              <input
                v-model.trim="form.subject"
                required
                placeholder="Subject"
                class="h-14 w-full rounded-lg border border-zinc-800 bg-[#151515]/75 pl-12 pr-4 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-zinc-200">Message</span>
            <textarea
              v-model.trim="form.message"
              required
              rows="8"
              minlength="10"
              placeholder="Your message..."
              class="w-full resize-y rounded-lg border border-zinc-800 bg-[#151515]/75 px-4 py-4 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            ></textarea>
          </label>

          <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-white text-base font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send :size="16" />
            {{ loading ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      </section>
    </LayoutContainer>
  </main>
</template>
