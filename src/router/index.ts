import { createRouter, createWebHistory } from 'vue-router'

import panel from '../views/panel.vue'
import LoginComponent from '../components/LoginComponent.vue'

// Vistas de los módulos
import SistemasView from '../views/SistemasView.vue'
import UsuariosView from '../views/UsuariosView.vue'
import RolesView from '../views/RolesView.vue'
import HistoriasView from '../views/HistoriasView.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      component: LoginComponent
    },

    {
      path: '/panel',
      component: panel,

      // Aquí estarán las páginas que se mostrarán dentro del panel
      children: [
        {
          path: '',
          redirect: '/panel/sistemas'
        },
        {
          path: 'sistemas',
          component: SistemasView
        },
        {
          path: 'usuarios',
          component: UsuariosView
        },
        {
          path: 'roles',
          component: RolesView
        },
        {
          path: 'historias',
          component: HistoriasView
        }
      ]
    }
  ]
})

export default router