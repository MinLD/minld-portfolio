<script setup>
import {
  FileText,
  FolderKanban,
  MessageSquareText,
  RefreshCw,
  Send,
  Users,
  Zap,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import DashboardStatCard from '@/components/admin/DashboardStatCard.vue'
import * as adminService from '@/services/admin.service'

const loading = ref(true)
const error = ref('')
const dashboard = ref(null)

const stats = computed(() => {
  const data = dashboard.value

  return [
    {
      title: 'Projects',
      value: data?.projects ?? 0,
      description: `${data?.publishedProjects ?? 0} published`,
      icon: FolderKanban,
    },
    {
      title: 'Project Comments',
      value: data?.projectComments ?? 0,
      description: 'Comments across all projects',
      icon: MessageSquareText,
    },
    {
      title: 'Moments',
      value: data?.moments ?? 0,
      description: `${data?.publishedMoments ?? 0} published`,
      icon: Zap,
    },
    {
      title: 'Moment Comments',
      value: data?.momentComments ?? 0,
      description: 'Comments across all moments',
      icon: FileText,
    },
  ]
})

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    const data = await adminService.getDashboard()

    dashboard.value = data.dashboard
  } catch (err) {
    console.error(err)

    error.value = 'Unable to load dashboard data.'
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="mx-auto max-w-[1600px]">
    <section class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">Overview</p>

        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Dashboard</h1>

        <p class="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
          Monitor and manage your portfolio content from one place.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        :disabled="loading"
        @click="loadDashboard"
      >
        <RefreshCw :size="16" :class="{ 'animate-spin': loading }" />

        Refresh
      </button>
    </section>

    <div
      v-if="error"
      class="mt-6 flex items-center justify-between rounded-xl border border-red-950 bg-red-950/20 px-4 py-3"
    >
      <p class="text-sm text-red-400">
        {{ error }}
      </p>

      <button
        type="button"
        class="text-sm font-medium text-red-300 hover:text-red-200"
        @click="loadDashboard"
      >
        Try again
      </button>
    </div>

    <section class="mt-8">
      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="item in 4"
          :key="item"
          class="h-40 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50"
        ></div>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard v-for="stat in stats" :key="stat.title" v-bind="stat" />
      </div>
    </section>

    <section class="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <div class="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h2 class="font-semibold text-zinc-100">Content overview</h2>

            <p class="mt-1 text-sm text-zinc-600">Current publishing status</p>
          </div>
        </div>

        <div class="space-y-6 p-5">
          <div>
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm text-zinc-400"> Published projects </span>

              <span class="text-sm font-medium text-zinc-200">
                {{ dashboard?.publishedProjects ?? 0 }}
                /
                {{ dashboard?.projects ?? 0 }}
              </span>
            </div>

            <div class="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                class="h-full rounded-full bg-zinc-300 transition-all"
                :style="{
                  width: `${
                    dashboard?.projects
                      ? (dashboard.publishedProjects / dashboard.projects) * 100
                      : 0
                  }%`,
                }"
              ></div>
            </div>
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm text-zinc-400"> Published moments </span>

              <span class="text-sm font-medium text-zinc-200">
                {{ dashboard?.publishedMoments ?? 0 }}
                /
                {{ dashboard?.moments ?? 0 }}
              </span>
            </div>

            <div class="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                class="h-full rounded-full bg-zinc-300 transition-all"
                :style="{
                  width: `${
                    dashboard?.moments ? (dashboard.publishedMoments / dashboard.moments) * 100 : 0
                  }%`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <div class="border-b border-zinc-800 px-5 py-4">
          <h2 class="font-semibold text-zinc-100">Quick actions</h2>

          <p class="mt-1 text-sm text-zinc-600">Common admin tasks</p>
        </div>

        <div class="grid gap-2 p-3">
          <button
            type="button"
            disabled
            class="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-zinc-500 transition disabled:cursor-not-allowed"
          >
            <div
              class="flex size-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <FolderKanban :size="18" />
            </div>

            <div>
              <p class="text-sm font-medium">Create project</p>

              <p class="mt-0.5 text-xs text-zinc-700">Project management coming next</p>
            </div>
          </button>

          <button
            type="button"
            disabled
            class="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-zinc-500 disabled:cursor-not-allowed"
          >
            <div
              class="flex size-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <Send :size="18" />
            </div>

            <div>
              <p class="text-sm font-medium">Create moment</p>

              <p class="mt-0.5 text-xs text-zinc-700">Moment management coming next</p>
            </div>
          </button>
        </div>
      </div>
    </section>

    <section class="mt-6 grid gap-4 sm:grid-cols-2">
      <div class="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div
          class="flex size-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-500"
        >
          <Users :size="20" />
        </div>

        <div>
          <p class="text-sm text-zinc-500">Registered users</p>

          <p class="mt-1 text-xl font-semibold text-white">
            {{ dashboard?.users ?? 0 }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div
          class="flex size-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-500"
        >
          <MessageSquareText :size="20" />
        </div>

        <div>
          <p class="text-sm text-zinc-500">Total comments</p>

          <p class="mt-1 text-xl font-semibold text-white">
            {{ (dashboard?.projectComments ?? 0) + (dashboard?.momentComments ?? 0) }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
