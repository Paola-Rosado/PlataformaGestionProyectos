// Funciones necesarias para configurar Vue Router.
import {
  createRouter,
  createWebHistory
} from 'vue-router'

// Vista del Login.
import LoginView from '../views/LoginView.vue'

// Vista principal del Panel.
import AdminPanel from '../views/AdminPanel.vue'

// Vistas correspondientes a los cuatro módulos.
import SistemasView from '../views/SistemasView.vue'
import UsuariosView from '../views/UsuariosView.vue'
import RolesView from '../views/RolesView.vue'
import HistoriasView from '../views/HistoriasView.vue'

/*
  Nombre permitido para los módulos.

  Esto ayuda a TypeScript a reconocer
  correctamente los nombres utilizados.
*/
type NombreModulo =
  | 'sistemas'
  | 'usuarios'
  | 'roles'
  | 'historias'

/*
  Creación del Router.
*/
const router = createRouter({

  // Utiliza URLs normales del navegador.
  history: createWebHistory(),

  routes: [

    /*
      LOGIN

      Esta es la primera pantalla del sistema.
    */
    {
      path: '/',
      name: 'login',
      component: LoginView
    },

    /*
      PANEL ADMINISTRADOR

      requiresAuth indica que solamente se puede
      acceder después de iniciar sesión.
    */
    {
      path: '/panel',
      component: AdminPanel,
      meta: {
        requiresAuth: true
      },

      /*
        Las cuatro vistas son hijas del Panel.

        Esto permite conservar el menú lateral
        mientras cambia solamente el contenido.
      */
      children: [

        /*
          Al entrar directamente a /panel,
          se redirige a Sistemas.

          Más abajo también validaremos que el
          usuario realmente tenga permiso.
        */
        {
          path: '',
          redirect: '/panel/sistemas'
        },

        {
          path: 'sistemas',
          name: 'sistemas',
          component: SistemasView,

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
          path: 'roles',
          name: 'roles',
          component: RolesView,

          meta: {
            requiresAuth: true,
            module: 'roles'
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

/*
  GUARD DE NAVEGACIÓN

  Se ejecuta antes de entrar a cualquier ruta.

  Sirve para:
  1. Comprobar que exista una sesión.
  2. Validar permisos.
  3. Evitar acceso manual a módulos bloqueados.
*/
router.beforeEach((to) => {

  // El Login siempre puede abrirse.
  if (to.path === '/') {
    return true
  }

  // Recupera la sesión almacenada.
  const usuarioGuardado = localStorage.getItem('user')

  // Convierte la sesión en objeto.
  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null

  /*
    Si la ruta necesita autenticación
    y no existe usuario, vuelve al Login.
  */
  if (to.meta.requiresAuth && !usuario) {

    return {
      name: 'login'
    }
  }

  /*
    Obtiene el módulo que intenta abrir.

    Por ejemplo:
    sistemas, usuarios, roles o historias.
  */
  const modulo = to.meta.module as NombreModulo | undefined

  /*
    Si la ruta corresponde a un módulo,
    comprueba su permiso.
  */
  if (modulo && usuario) {

    const permiso = usuario.permisos?.[modulo]

    /*
      Permiso 1 significa Desactivado.

      También bloqueamos cuando el permiso
      no existe.
    */
    if (!permiso || permiso === 1) {

      /*
        Busca automáticamente el primer módulo
        al que sí tenga acceso.
      */
      const modulos: NombreModulo[] = [
        'sistemas',
        'usuarios',
        'roles',
        'historias'
      ]

      const primerModuloPermitido = modulos.find(
        nombre => usuario.permisos?.[nombre] > 1
      )

      /*
        Si encuentra un módulo disponible,
        manda al usuario a ese módulo.
      */
      if (primerModuloPermitido) {

        return {
          name: primerModuloPermitido
        }
      }

      /*
        Si no tiene acceso a ningún módulo,
        termina la sesión y vuelve al Login.
      */
      localStorage.removeItem('user')

      return {
        name: 'login'
      }
    }
  }

  // Si todas las validaciones son correctas, permite entrar.
  return true
})

export default router