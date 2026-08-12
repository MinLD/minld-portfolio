import { createRouter, createWebHistory } from 'vue-router'
import { registerGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/ContactView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      meta: { guestOnly: true },
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { guestOnly: true },
      component: () => import('@/views/RegisterView.vue'),
    },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

registerGuards(router)

export default router
