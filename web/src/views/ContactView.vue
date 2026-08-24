<script setup>
import { reactive, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { Building2, Mail, MessageSquare, Phone, Send, Tag, User } from 'lucide-vue-next'

import { sendContactMessageApi } from '@/api/contact'
import { useI18n } from '@/composables/useI18n'
import LoadingButton from '@/components/loading/LoadingButton.vue'
import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import LayoutContainer from '@/layouts/LayoutContainer.vue'

const { t } = useI18n()

const categories = ['GENERAL_INQUIRY', 'BUSINESS_OPPORTUNITY', 'TECHNICAL_SUPPORT', 'FEEDBACK']

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  category: 'GENERAL_INQUIRY',
  subject: '',
  message: '',
})

const isSendingContact = ref(false)
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
  isSendingContact.value = true

  try {
    await sendContactMessageApi({ ...form })
    toast.success(t('contact.success'))
    resetForm()
  } catch (err) {
    error.value = err.response?.data?.error?.message || t('contact.error')
  } finally {
    isSendingContact.value = false
  }
}
</script>

<template>
  <main class="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[var(--page)] text-[var(--fg)]">
    <InteractiveNetwork :density="1.15" />

    <LayoutContainer>
      <section class="relative z-10 py-16 sm:py-24">
        <div class="mx-auto max-w-4xl text-center">
          <p class="font-mono text-sm font-semibold uppercase tracking-[0.4em] text-[var(--muted)]">
            {{ t('contact.eyebrow') }}
          </p>
          <h1 class="mt-6 font-serif text-6xl font-semibold leading-none text-[var(--fg)] sm:text-7xl lg:text-8xl">
            {{ t('contact.title') }}
          </h1>
          <p class="mt-6 text-lg text-[var(--muted)] sm:text-xl">
            {{ t('contact.description') }}
          </p>
        </div>

        <form class="mx-auto mt-20 max-w-3xl space-y-6" @submit.prevent="submitContact">
          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-[var(--fg)]">{{
              t('contact.name')
            }}</span>
            <span class="relative block">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" :size="20" />
              <input
                v-model.trim="form.name"
                required
                :placeholder="t('contact.namePlaceholder')"
                class="h-14 w-full rounded-lg border border-[var(--border)] bg-[var(--page)]/75 pl-12 pr-4 text-base text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-[var(--fg)]">{{
              t('common.email')
            }}</span>
            <span class="relative block">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" :size="20" />
              <input
                v-model.trim="form.email"
                required
                type="email"
                placeholder="example@abc.com"
                class="h-14 w-full rounded-lg border border-[var(--border)] bg-[var(--page)]/75 pl-12 pr-4 text-base text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-[var(--fg)]">{{
              t('contact.phone')
            }}</span>
            <span class="relative block">
              <Phone class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" :size="20" />
              <input
                v-model.trim="form.phone"
                placeholder="+84 123 456 789"
                class="h-14 w-full rounded-lg border border-[var(--border)] bg-[var(--page)]/75 pl-12 pr-4 text-base text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-[var(--fg)]"
              >{{ t('contact.company') }}</span
            >
            <span class="relative block">
              <Building2
                class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                :size="20"
              />
              <input
                v-model.trim="form.company"
                :placeholder="t('contact.companyPlaceholder')"
                class="h-14 w-full rounded-lg border border-[var(--border)] bg-[var(--page)]/75 pl-12 pr-4 text-base text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-[var(--fg)]">{{
              t('contact.category')
            }}</span>
            <span class="relative block">
              <Tag class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" :size="20" />
              <select
                v-model="form.category"
                class="h-14 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--page)]/75 pl-12 pr-4 text-base text-[var(--fg)] outline-none transition focus:border-[var(--muted)]"
              >
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ t(`contact.categories.${category}`) }}
                </option>
              </select>
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-[var(--fg)]">{{
              t('contact.subject')
            }}</span>
            <span class="relative block">
              <MessageSquare
                class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                :size="20"
              />
              <input
                v-model.trim="form.subject"
                required
                :placeholder="t('contact.subjectPlaceholder')"
                class="h-14 w-full rounded-lg border border-[var(--border)] bg-[var(--page)]/75 pl-12 pr-4 text-base text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
              />
            </span>
          </label>

          <label class="block">
            <span class="mb-2.5 block text-base font-semibold text-[var(--fg)]">{{
              t('contact.message')
            }}</span>
            <textarea
              v-model.trim="form.message"
              required
              rows="8"
              minlength="10"
              :placeholder="t('contact.messagePlaceholder')"
              class="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--page)]/75 px-4 py-4 text-base text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
            ></textarea>
          </label>

          <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

          <LoadingButton
            type="submit"
            :loading="isSendingContact"
            class="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--action-bg)] text-base font-medium text-[var(--action-fg)] transition hover:bg-[var(--action-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send v-if="!isSendingContact" :size="16" />
            <span>{{ isSendingContact ? t('contact.sending') : t('contact.send') }}</span>
          </LoadingButton>
        </form>
      </section>
    </LayoutContainer>
  </main>
</template>
