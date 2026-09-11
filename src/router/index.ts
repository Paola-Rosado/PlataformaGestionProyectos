import { createRouter, createWebHistory } from 'vue-router'

import panel from '../views/panel.vue'
import LoginComponent from '../components/LoginComponent.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: LoginComponent
    },
    {
      path: '/panel',
      component: panel
    }
  ]
})

export default router