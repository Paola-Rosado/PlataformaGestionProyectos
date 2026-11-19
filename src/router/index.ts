import {
  createRouter,
  createWebHistory
} from 'vue-router'

import LoginView from '../views/LoginView.vue'
import AdminPanel from '../views/AdminPanel.vue'
import SystemsView from '../views/SystemsView.vue'
import UsuariosView from '../views/UsersView.vue'
import HistoriasView from '../views/HistoriasView.vue'

import { ref } from 'vue'
import type { Sistema } from '../interfaces/Sistema'

// CAMBIO AÑADIDO: Manejo de cookies.
import Cookies from 'js-cookie'
// FIN DEL CAMBIO AÑADIDO.

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

  return {
    sistemaSeleccionadoGlobal,
    seleccionarSistema
  }
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

  // ======================================================
  // CAMBIO AÑADIDO: VALIDACIÓN DE LA COOKIE DE SESIÓN.
  //
  // Recupera la cookie creada desde LoginComponent.vue.
  //
  // Si la cookie no existe o ha expirado, el usuario
  // no podrá acceder a las rutas protegidas.
  //
  // Se eliminan únicamente los datos de la sesión
  // y se redirige al inicio de sesión.
  // ======================================================

  const cookieSesion = Cookies.get('sesion')

  if (to.meta.requiresAuth && !cookieSesion) {

    localStorage.removeItem('user')
    localStorage.removeItem('plataforma:sistemaActivo')

    sistemaSeleccionadoGlobal.value = null

    return { name: 'login' }
  }

  // FIN DEL CAMBIO AÑADIDO.

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

    // CAMBIO AÑADIDO:
    // Elimina la cookie si ocurre un error en la sesión.
    Cookies.remove('sesion', { path: '/' })
    // FIN DEL CAMBIO AÑADIDO.

    return { name: 'login' }
  }

  if (to.meta.requiresAuth && !usuario) {

    // CAMBIO AÑADIDO:
    // Elimina la cookie si no existen datos del usuario.
    Cookies.remove('sesion', { path: '/' })
    // FIN DEL CAMBIO AÑADIDO.

    return { name: 'login' }
  }

  // ======================================================
  // CAMBIO AÑADIDO:
  // Comprueba que la cookie corresponda a los mismos
  // datos de sesión guardados en localStorage.
  //
  // Si los datos no coinciden, solicita iniciar sesión
  // nuevamente.
  // ======================================================

  if (to.meta.requiresAuth && cookieSesion !== usuarioGuardado) {

    Cookies.remove('sesion', { path: '/' })

    localStorage.removeItem('user')
    localStorage.removeItem('plataforma:sistemaActivo')

    sistemaSeleccionadoGlobal.value = null

    return { name: 'login' }
  }

  // FIN DEL CAMBIO AÑADIDO.

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

      // CAMBIO AÑADIDO:
      // Elimina la cookie si el usuario no tiene
      // permisos para acceder a ningún módulo.
      Cookies.remove('sesion', { path: '/' })
      // FIN DEL CAMBIO AÑADIDO.

      return { name: 'login' }
    }
  }

  return true
})

export default router