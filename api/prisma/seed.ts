import { z } from 'zod'
import { hashPassword } from '../src/common/auth/password.js'
import { authRepository } from '../src/modules/auth/auth.repository.js'
import { runTransaction } from '../src/database/transaction.js'

const seedEnvSchema = z.object({
  ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email()),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_NAME: z.string().trim().min(1),
})

const seedEnv = seedEnvSchema.parse(process.env)

const projectTags = [
  ['Web Application', 'web-application'],
  ['SaaS', 'saas'],
  ['E-commerce', 'e-commerce'],
  ['Portfolio', 'portfolio'],
  ['Landing Page', 'landing-page'],
  ['Dashboard', 'dashboard'],
  ['Admin Panel', 'admin-panel'],
  ['Content Management', 'content-management'],
  ['Authentication', 'authentication'],
  ['API', 'api'],
  ['Realtime', 'realtime'],
  ['Automation', 'automation'],
  ['AI', 'ai'],
  ['Machine Learning', 'machine-learning'],
  ['Data Visualization', 'data-visualization'],
  ['Mobile App', 'mobile-app'],
  ['Desktop App', 'desktop-app'],
  ['DevOps', 'devops'],
  ['Open Source', 'open-source'],
  ['UI/UX', 'ui-ux'],
  ['Frontend', 'frontend'],
  ['Backend', 'backend'],
  ['Full Stack', 'full-stack'],
  ['Cloud', 'cloud'],
] as const

const technologies = [
  ['JavaScript', 'javascript', 'LANGUAGE'],
  ['TypeScript', 'typescript', 'LANGUAGE'],
  ['Python', 'python', 'LANGUAGE'],
  ['Java', 'java', 'LANGUAGE'],
  ['C#', 'c-sharp', 'LANGUAGE'],
  ['Go', 'go', 'LANGUAGE'],
  ['Rust', 'rust', 'LANGUAGE'],
  ['PHP', 'php', 'LANGUAGE'],
  ['Ruby', 'ruby', 'LANGUAGE'],
  ['Kotlin', 'kotlin', 'LANGUAGE'],
  ['Swift', 'swift', 'LANGUAGE'],
  ['Dart', 'dart', 'LANGUAGE'],
  ['HTML', 'html', 'LANGUAGE'],
  ['CSS', 'css', 'LANGUAGE'],
  ['SQL', 'sql', 'LANGUAGE'],
  ['Vue.js', 'vue-js', 'FRAMEWORK'],
  ['Nuxt', 'nuxt', 'FRAMEWORK'],
  ['React', 'react', 'LIBRARY'],
  ['Next.js', 'next-js', 'FRAMEWORK'],
  ['Angular', 'angular', 'FRAMEWORK'],
  ['Svelte', 'svelte', 'FRAMEWORK'],
  ['Node.js', 'node-js', 'FRAMEWORK'],
  ['Express', 'express', 'FRAMEWORK'],
  ['NestJS', 'nestjs', 'FRAMEWORK'],
  ['Laravel', 'laravel', 'FRAMEWORK'],
  ['Django', 'django', 'FRAMEWORK'],
  ['FastAPI', 'fastapi', 'FRAMEWORK'],
  ['Spring Boot', 'spring-boot', 'FRAMEWORK'],
  ['ASP.NET Core', 'asp-net-core', 'FRAMEWORK'],
  ['Flutter', 'flutter', 'FRAMEWORK'],
  ['React Native', 'react-native', 'FRAMEWORK'],
  ['Tailwind CSS', 'tailwind-css', 'FRAMEWORK'],
  ['Bootstrap', 'bootstrap', 'FRAMEWORK'],
  ['Pinia', 'pinia', 'LIBRARY'],
  ['Redux', 'redux', 'LIBRARY'],
  ['TanStack Query', 'tanstack-query', 'LIBRARY'],
  ['Axios', 'axios', 'LIBRARY'],
  ['Zod', 'zod', 'LIBRARY'],
  ['Prisma', 'prisma', 'TOOL'],
  ['PostgreSQL', 'postgresql', 'DATABASE'],
  ['MySQL', 'mysql', 'DATABASE'],
  ['MongoDB', 'mongodb', 'DATABASE'],
  ['Redis', 'redis', 'DATABASE'],
  ['SQLite', 'sqlite', 'DATABASE'],
  ['Docker', 'docker', 'TOOL'],
  ['Kubernetes', 'kubernetes', 'TOOL'],
  ['Git', 'git', 'TOOL'],
  ['GitHub Actions', 'github-actions', 'TOOL'],
  ['Vite', 'vite', 'TOOL'],
  ['Vitest', 'vitest', 'TOOL'],
  ['Playwright', 'playwright', 'TOOL'],
  ['Jest', 'jest', 'TOOL'],
  ['Cloudinary', 'cloudinary', 'TOOL'],
  ['AWS', 'aws', 'OTHER'],
  ['Google Cloud', 'google-cloud', 'OTHER'],
  ['Firebase', 'firebase', 'OTHER'],
  ['Vercel', 'vercel', 'OTHER'],
  ['Netlify', 'netlify', 'OTHER'],
] as const

await runTransaction(async (tx) => {
  await authRepository.createAdmin(
    {
      email: seedEnv.ADMIN_EMAIL,
      displayName: seedEnv.ADMIN_NAME,
      passwordHash: await hashPassword(seedEnv.ADMIN_PASSWORD),
    },
    tx,
  )

  for (const [name, slug] of projectTags) {
    await tx.category.upsert({ where: { slug }, update: { name }, create: { name, slug } })
  }

  for (const [name, slug, type] of technologies) {
    await tx.technology.upsert({ where: { slug }, update: { name, type }, create: { name, slug, type } })
  }
})
