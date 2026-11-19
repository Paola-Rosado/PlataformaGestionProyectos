
import {
  createRouter,
  createWebHistory
} from 'vue-router'

import LoginView from '../views/LoginView.vue'
import AdminPanel from '../views/AdminPanel.vue'
import SystemsView from '../views/SystemsView.vue'
import UsuariosView from '../views/UsersView.vue'
import HistoriasView from '../views/HistoriasView.vue'

////PERMISOS//////
export const NivelPermisos = {
  Desactivado: 1,
  Lectura: 2,
  Escritura: 3,
} as const; 
export type NivelPermisosType = typeof NivelPermisos[keyof typeof NivelPermisos];

// Estado global del sistema seleccionado.
const sistemaSeleccionadoGlobal = ref<Sistema | null>(null)

// Gestión del sistema activo.
export function SistemaActivo() {
  function seleccionarSistema(sistema: Sistema | null) {
    sistemaSeleccionadoGlobal.value = sistema

    if (sistema) {
      localStorage.setItem(
        'plataforma:sistemaActivo',
        String(sistema.id)
      )
    } else {
      localStorage.removeItem('plataforma:sistemaActivo')
    }
  }

export interface Usuario {
  name: string;
  isAdmin: boolean;
  Permisos: PermisosUsuario;
}

// Tipos de módulos permitidos.
type NombreModulo =
  | 'sistemas'
  | 'usuarios'
  | 'historias'

// Configuración del router.
const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/panel',
      component: AdminPanel,
      meta: {
        requiresAuth: true
      },

      children: [
        {
          path: '',
          redirect: '/panel/sistemas'
        },
        {
          path: 'sistemas',
          name: 'sistemas',
          component: SystemsView,
          meta: {
            requiresAuth: true,
            module: 'sistemas'
          }
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: UsuariosView,
          meta: {
            requiresAuth: true,
            module: 'usuarios'
          }
        },
        {
          path: 'historias',
          name: 'historias',
          component: HistoriasView,
          meta: {
            requiresAuth: true,
            module: 'historias'
          }
        }
      ]
    }
  ]
})

// Guard de navegación.
router.beforeEach((to) => {

  if (to.path === '/') {
    return true
  }

  const usuarioGuardado = localStorage.getItem('user')

  let usuario: any = null

  try {
    usuario = usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null
  } catch (error) {
    console.error('Error al recuperar la sesión:', error)

    localStorage.removeItem('user')
    localStorage.removeItem('plataforma:sistemaActivo')

    return { name: 'login' }
  }

  if (to.meta.requiresAuth && !usuario) {
    return { name: 'login' }
  }

  const modulo = to.meta.module as NombreModulo | undefined

  if (modulo && usuario) {

    const permiso = usuario.permisos?.[modulo]

    if (
      typeof permiso !== 'number' ||
      permiso < 2 ||
      permiso > 4
    ) {

      const modulos: NombreModulo[] = [
        'sistemas',
        'usuarios',
        'historias'
      ]

      const primerModuloPermitido = modulos.find(nombre => {
        const nivel = usuario.permisos?.[nombre]

        return (
          typeof nivel === 'number' &&
          nivel >= 2 &&
          nivel <= 4
        )
      })

      if (primerModuloPermitido) {
        return { name: primerModuloPermitido }
      }

      localStorage.removeItem('user')
      localStorage.removeItem('plataforma:sistemaActivo')

      return { name: 'login' }
    }
  }

  return true
})

export default router
