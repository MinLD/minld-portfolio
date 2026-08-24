<script setup>
import {
  BadgeCheck,
  Braces,
  BriefcaseBusiness,
  Database,
  Dumbbell,
  Github,
  GraduationCap,
  Mail,
  MonitorCog,
  Server,
  ShieldCheck,
  Workflow,
} from 'lucide-vue-next'

defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const brandIcons = {
  TypeScript: 'typescript',
  'JavaScript (ES6+)': 'javascript',
  Python: 'python',
  SQL: 'postgresql',
  React: 'react',
  'Next.js': 'nextdotjs',
  Vue: 'vuedotjs',
  'Tailwind CSS': 'tailwindcss',
  HTML5: 'html5',
  CSS3: 'css',
  'Node.js': 'nodedotjs',
  'Express.js': 'express',
  Flask: 'flask',
  'RESTful API': 'openapiinitiative',
  JWT: 'jsonwebtokens',
  'OAuth 2.0': 'auth0',
  RBAC: 'auth0',
  'Socket.IO': 'socketdotio',
  PostgreSQL: 'postgresql',
  MySQL: 'mysql',
  Prisma: 'prisma',
  SQLAlchemy: 'sqlalchemy',
  MinIO: 'minio',
  Cloudinary: 'cloudinary',
  Redis: 'redis',
  Meilisearch: 'meilisearch',
  Docker: 'docker',
  Nginx: 'nginx',
  Git: 'git',
  GitHub: 'github',
  'GitHub Actions': 'githubactions',
  'CI/CD': 'githubactions',
}

function getTimelineIcon(item) {
  const text = `${item.title} ${item.role}`.toLowerCase()
  return text.includes('university') || text.includes('engineering technology')
    ? GraduationCap
    : BriefcaseBusiness
}

function getSkillIcon(item) {
  const slug = brandIcons[item]
  return slug ? `https://cdn.simpleicons.org/${slug}/d4d4d8` : null
}

function getGroupIcon(groupName) {
  const normalized = groupName.toLowerCase()
  if (normalized.includes('frontend')) return MonitorCog
  if (normalized.includes('backend')) return Server
  if (normalized.includes('database')) return Database
  if (normalized.includes('devops')) return Workflow
  if (normalized.includes('testing')) return ShieldCheck
  return Dumbbell
}

function getActionIcon(action) {
  const label = action.label.toLowerCase()
  if (label.includes('github')) return Github
  if (label.includes('email')) return Mail
  return BadgeCheck
}
</script>

<template>
  <section
    :id="section.id"
    :data-about-section="section.id"
    class="min-h-[calc(100dvh-4rem)] [scroll-snap-align:start] px-6 py-12 sm:px-10 lg:px-24 lg:py-16"
  >
    <div class="w-full max-w-4xl">
      <img
        :src="section.image"
        :alt="section.alt"
        class="mb-8 aspect-[4/3] w-full object-cover lg:hidden"
      />

      <h2 class="mt-4 font-serif text-5xl font-semibold leading-none text-zinc-100 sm:text-6xl">
        {{ section.title }}
      </h2>

      <div
        v-if="section.body?.length"
        class="mt-8 max-w-3xl space-y-5 text-xl leading-9 text-zinc-500 text-justify"
      >
        <p>
          {{ section.body[0] }}
        </p>
        <p>
          {{ section.body[1] }}
        </p>
      </div>

      <blockquote
        v-if="section.quote"
        class="mt-7 border-l-4 border-zinc-200 pl-7 font-serif text-2xl italic leading-9 text-zinc-200"
      >
        {{ section.quote }}
      </blockquote>
      <div
        v-if="section.body?.length"
        class="mt-8 max-w-3xl space-y-5 text-xl leading-9 text-zinc-500 text-justify"
      >
        <p>
          {{ section.body[2] }}
        </p>
        <p>
          {{ section.body[3] }}
        </p>
        <p>
          {{ section.body[4] }}
        </p>
        <p>
          {{ section.body[5] }}
        </p>
        <p>
          {{ section.body[6] }}
        </p>
        <p>
          {{ section.body[7] }}
        </p>
        <p>
          {{ section.body[8] }}
        </p>
      </div>

      <div v-if="section.timeline" class="mt-7 ml-4 border-l border-zinc-800">
        <div
          v-for="item in section.timeline"
          :key="item.title"
          class="relative pb-12 pl-12 last:pb-0"
        >
          <span
            class="absolute -left-4 top-0 flex size-8 items-center justify-center rounded-full border border-zinc-700 bg-[#181818] text-zinc-300 shadow-[0_0_0_8px_#121212]"
          >
            <component :is="getTimelineIcon(item)" :size="16" stroke-width="1.8" />
          </span>
          <p class="font-mono text-sm text-zinc-500">{{ item.period }}</p>
          <h3 class="mt-4 text-2xl font-semibold text-zinc-100">{{ item.title }}</h3>
          <p class="mt-2 text-lg font-medium text-zinc-200">{{ item.role }}</p>
          <template v-if="Array.isArray(item.text)">
            <p
              v-for="paragraph in item.text"
              :key="paragraph"
              class="mt-4 max-w-3xl text-lg leading-8 text-zinc-500"
            >
              {{ paragraph }}
            </p>
          </template>
          <p v-else class="mt-4 max-w-3xl text-lg leading-8 text-zinc-500">
            {{ item.text }}
          </p>
        </div>
      </div>

      <div v-if="section.groups" class="mt-5 space-y-7">
        <div v-for="group in section.groups" :key="group.name">
          <div class="flex items-center gap-5">
            <span class="h-px w-12 bg-zinc-300"></span>
            <span
              class="flex size-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300"
            >
              <component :is="getGroupIcon(group.name)" :size="18" stroke-width="1.8" />
            </span>
            <h3 class="font-serif text-3xl text-zinc-100">{{ group.name }}</h3>
          </div>
          <div class="mt-5 flex flex-wrap gap-3 pl-16">
            <span
              v-for="item in group.items"
              :key="item"
              class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-base text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"
            >
              <img
                v-if="getSkillIcon(item)"
                :src="getSkillIcon(item)"
                :alt="`${item} icon`"
                class="size-4 object-contain"
                loading="lazy"
              />
              <Braces v-else :size="15" stroke-width="1.8" />
              {{ item }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="section.actions" class="mt-5 flex flex-wrap gap-4">
        <a
          v-for="action in section.actions"
          :key="action.href"
          :href="action.href"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          <component :is="getActionIcon(action)" :size="16" stroke-width="2" />
          {{ action.label }}
        </a>
      </div>
    </div>
  </section>
</template>
