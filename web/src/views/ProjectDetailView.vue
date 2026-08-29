<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  CalendarDays,
  Code2,
  ExternalLink,
  Github,
  Link as LinkIcon,
  Loader2,
  MessageSquare,
  Monitor,
  Send,
  Tag,
} from 'lucide-vue-next'

import { createProjectCommentApi, getProjectBySlugApi, listProjectCommentsApi } from '@/api/project'
import ProjectDetailSkeleton from '@/components/project/ProjectDetailSkeleton.vue'
import InteractiveNetwork from '@/components/shared/InteractiveNetwork.vue'
import { cloudinaryImage } from '@/utils/cloudinary'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const project = ref(null)
const isLoadingData = ref(false)
const isLoadingComments = ref(false)
const isSubmittingComment = ref(false)
const error = ref('')
const commentError = ref('')
const comments = ref([])
const commentForm = reactive({
  authorName: '',
  content: '',
})

const heroImage = computed(() => cloudinaryImage(project.value?.thumbnailUrl, 1600))
const contentBlocks = computed(() =>
  String(project.value?.content || '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean),
)
const sourceUrl = computed(() => project.value?.sourceUrl || project.value?.githubUrl)
const commentCount = computed(() => comments.value.length)

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const loadData = async () => {
  isLoadingData.value = true
  error.value = ''

  try {
    const response = await getProjectBySlugApi(props.slug)
    project.value = response
    document.title = `${response.title} | MinLD`
    await loadComments()
  } catch (err) {
    if (err?.response?.status === 404) {
      router.replace({ name: 'not-found' })
      return
    }
    error.value = 'Unable to load project.'
  } finally {
    isLoadingData.value = false
  }
}

async function loadComments() {
  isLoadingComments.value = true
  commentError.value = ''

  try {
    comments.value = await listProjectCommentsApi(props.slug)
  } catch {
    commentError.value = 'Unable to load comments.'
  } finally {
    isLoadingComments.value = false
  }
}

async function submitComment() {
  if (isSubmittingComment.value) return

  isSubmittingComment.value = true
  commentError.value = ''

  try {
    const comment = await createProjectCommentApi(props.slug, {
      authorName: commentForm.authorName,
      content: commentForm.content,
    })

    comments.value.push(comment)
    commentForm.authorName = ''
    commentForm.content = ''
  } catch {
    commentError.value = 'Unable to post comment.'
  } finally {
    isSubmittingComment.value = false
  }
}

watch(() => props.slug, loadData, { immediate: true })
</script>

<template>
  <main class="relative min-h-screen bg-[var(--page)] text-[var(--fg)]">
    <InteractiveNetwork :density="2.2" />

    <ProjectDetailSkeleton v-if="isLoadingData" />

    <div v-else-if="project">
      <section class="relative z-10 min-h-[620px] overflow-hidden">
        <img
          v-if="heroImage"
          :src="heroImage"
          :alt="project.title"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div v-else class="absolute inset-0 bg-[var(--surface)]" />

        <div
          class="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-[var(--page)]"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

        <div class="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-28 sm:px-6 lg:px-8">
          <div class="max-w-5xl">
            <RouterLink
              to="/projects"
              class="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft :size="16" />
              Back to Projects
            </RouterLink>

            <h1 class="mt-8 max-w-4xl text-5xl font-bold leading-tight text-white md:text-7xl">
              {{ project.title }}
            </h1>

            <p class="mt-5 max-w-3xl text-xl leading-8 text-white/80">
              {{ project.summary }}
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <a
                v-if="project.demoUrl"
                :href="project.demoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                <ExternalLink :size="17" />
                Live Demo
              </a>

              <a
                v-if="sourceUrl"
                :href="sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-md bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25"
              >
                <Github :size="17" />
                Source Code
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="relative z-10 -mt-20 pb-24">
        <div class="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[26rem_minmax(0,1fr)] lg:items-start lg:px-8">
          <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-6 backdrop-blur">
              <div class="flex items-center gap-3">
                <span
                  class="flex size-10 items-center justify-center rounded-lg bg-[var(--surface)]"
                >
                  <CalendarDays :size="20" />
                </span>
                <h2 class="text-xl font-bold">Project Details</h2>
              </div>

              <dl class="mt-6 space-y-4 text-sm">
                <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <dt class="text-[var(--muted)]">Created</dt>
                  <dd class="font-semibold">
                    {{ formatDate(project.publishedAt || project.createdAt) }}
                  </dd>
                </div>
                <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <dt class="text-[var(--muted)]">Year</dt>
                  <dd class="font-semibold">{{ project.year || '-' }}</dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-[var(--muted)]">Status</dt>
                  <dd class="font-semibold">{{ project.status }}</dd>
                </div>
              </dl>
            </div>

            <div
              v-if="project.technologies?.length"
              class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-6 backdrop-blur"
            >
              <div class="flex items-center gap-3">
                <span
                  class="flex size-10 items-center justify-center rounded-lg bg-[var(--surface)]"
                >
                  <Code2 :size="20" />
                </span>
                <h2 class="text-xl font-bold">Tech Stack</h2>
              </div>

              <div class="mt-6 flex flex-wrap gap-2">
                <span
                  v-for="technology in project.technologies"
                  :key="technology.id"
                  class="rounded-md bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
                >
                  {{ technology.name }}
                </span>
              </div>
            </div>

            <div
              v-if="project.tags?.length"
              class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-6 backdrop-blur"
            >
              <div class="flex items-center gap-3">
                <span
                  class="flex size-10 items-center justify-center rounded-lg bg-[var(--surface)]"
                >
                  <Tag :size="20" />
                </span>
                <h2 class="text-xl font-bold">Tags</h2>
              </div>

              <div class="mt-6 flex flex-wrap gap-2">
                <span
                  v-for="tag in project.tags"
                  :key="tag.id"
                  class="rounded-md bg-[var(--surface)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>

            <div class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-6 backdrop-blur">
              <div class="flex items-center gap-3">
                <span
                  class="flex size-10 items-center justify-center rounded-lg bg-[var(--surface)]"
                >
                  <LinkIcon :size="20" />
                </span>
                <h2 class="text-xl font-bold">Links</h2>
              </div>

              <div class="mt-6 grid gap-3">
                <a
                  v-if="project.demoUrl"
                  :href="project.demoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-3 text-sm font-semibold hover:bg-[var(--surface)]"
                >
                  <Monitor :size="17" />
                  Live Demo
                </a>
                <a
                  v-if="sourceUrl"
                  :href="sourceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-3 text-sm font-semibold hover:bg-[var(--surface)]"
                >
                  <Github :size="17" />
                  Source Code
                </a>
              </div>
            </div>
          </aside>

          <div class="space-y-8">
            <article
              class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-8 backdrop-blur md:p-12"
            >
              <h2 class="text-3xl font-bold md:text-4xl">Project Overview</h2>

              <div class="mt-6 space-y-6 text-lg leading-9 text-[var(--fg)]/85">
                <p v-if="!contentBlocks.length">{{ project.summary }}</p>
                <p v-for="block in contentBlocks" :key="block">{{ block }}</p>
              </div>
            </article>

            <section
              class="rounded-xl border border-[var(--border)] bg-[var(--panel)]/90 p-8 backdrop-blur md:p-12"
            >
              <div class="border-l-4 border-[var(--surface-hover)] pl-5">
                <h2 class="text-2xl font-bold">Comments</h2>
              </div>

              <div class="mx-auto mt-8 rounded-xl border border-[var(--border)] p-6">
                <h3 class="text-lg font-bold">Comments ({{ commentCount }})</h3>

                <form class="mt-7 space-y-4" @submit.prevent="submitComment">
                  <input
                    v-model.trim="commentForm.authorName"
                    required
                    maxlength="80"
                    placeholder="Your name"
                    class="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
                  />

                  <div>
                    <textarea
                      v-model.trim="commentForm.content"
                      required
                      maxlength="200"
                      rows="4"
                      placeholder="Write your comment..."
                      class="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--page)] px-3 py-3 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--muted)]"
                    ></textarea>

                    <p class="-mt-1 text-right text-xs text-[var(--muted)]">
                      {{ commentForm.content.length }}/200
                    </p>
                  </div>

                  <div class="flex justify-end">
                    <button
                      type="submit"
                      class="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--action-bg)] px-4 text-sm font-semibold text-[var(--action-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="isSubmittingComment"
                    >
                      <Loader2 v-if="isSubmittingComment" class="animate-spin" :size="15" />
                      <Send v-else :size="15" />
                      Post Comment
                    </button>
                  </div>
                </form>

                <p v-if="commentError" class="mt-4 text-sm text-red-400">{{ commentError }}</p>

                <div class="mt-10">
                  <div
                    v-if="isLoadingComments"
                    class="py-8 text-center text-sm text-[var(--muted)]"
                  >
                    Loading comments...
                  </div>

                  <div
                    v-else-if="!comments.length"
                    class="py-8 text-center text-base text-[var(--muted)]"
                  >
                    No comments yet. Be the first to comment!
                  </div>

                  <div v-else class="space-y-4">
                    <article
                      v-for="comment in comments"
                      :key="comment.id"
                      class="rounded-lg border border-[var(--border)] bg-[var(--page)] p-4"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="flex size-9 items-center justify-center rounded-full bg-[var(--surface)] text-sm font-bold"
                        >
                          <img
                            v-if="comment.user?.avatarUrl"
                            :src="comment.user.avatarUrl"
                            :alt="comment.user.displayName"
                            class="size-full rounded-full object-cover"
                          />
                          <MessageSquare v-else :size="16" />
                        </div>

                        <div>
                          <p class="font-semibold">{{ comment.user?.displayName }}</p>
                          <p class="text-xs text-[var(--muted)]">{{ formatDate(comment.createdAt) }}</p>
                        </div>
                      </div>

                      <p class="mt-3 text-sm leading-6 text-[var(--fg)]/85">{{ comment.content }}</p>
                    </article>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>

    <div v-else>
      <div class="relative z-10 py-24 text-center text-[var(--muted)]">
        {{ error || 'Project not found.' }}
      </div>
    </div>
  </main>
</template>
