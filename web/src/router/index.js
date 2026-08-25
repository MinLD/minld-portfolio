import { createRouter, createWebHistory } from 'vue-router'
import { registerGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      meta: { layout: 'user' },
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      meta: { layout: 'user' },
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/resume',
      name: 'resume',
      meta: { layout: 'user' },
      component: () => import('@/views/ResumeView.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      meta: { layout: 'user' },
      component: () => import('@/views/ProjectsView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      meta: { layout: 'user' },
      component: () => import('@/views/ContactView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      meta: { guestOnly: true, layout: 'user' },
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/Login',
      redirect: '/login',
    },

    {
      path: '/photo',
      name: 'Gallery',
      meta: { layout: 'user' },
      component: () => import('@/views/GalleyView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin'],
        layout: 'admin',
      },
    },
    {
      path: '/admin/projects',
      name: 'admin-projects',
      component: () => import('@/views/AdminProjectsView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin'],
        layout: 'admin',
      },
    },
    {
      path: '/admin/moments',
      name: 'admin-moments',
      component: () => import('@/views/AdminMomentsView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin'],
        layout: 'admin',
      },
    },
    {
      path: '/admin/moments/category',
      name: 'admin-moments/categories',
      component: () => import('@/views/AdminMomentsCategory.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin'],
        layout: 'admin',
      },
    },
    {
      path: '/admin/moments/hagtag',
      name: 'admin-moments/hagtag',
      component: () => import('@/views/AdminMomentsHagtags.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin'],
        layout: 'admin',
      },
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: {
        layout: 'blank',
      },
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

registerGuards(router)

export default router
