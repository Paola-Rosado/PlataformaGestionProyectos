// Funciones necesarias para configurar Vue Router.
import {
  createRouter,
  createWebHistory
} from 'vue-router'

// Vista del Login.
import LoginView from '../views/LoginView.vue'

// Vista principal del Panel.
import AdminPanel from '../views/AdminPanel.vue'

// Vistas correspondientes a los módulos.
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

export type NombreModulo = 'Sistemas' | 'Usuarios' | 'Roles' | 'Historias';

export type PermisosUsuario = Record<NombreModulo, NivelPermisosType>;

export interface Usuario {
  name: string;
  isAdmin: boolean;
  Permisos: PermisosUsuario;
}

///Funciones para validar acciones de lectura o escritura en las vistas////
export function canRead(user: Usuario, module: NombreModulo): boolean {
  if(user.isAdmin) return true;
  const nivel = user.Permisos[module] ?? NivelPermisos.Desactivado;
  return nivel >= NivelPermisos.Lectura;
}

export function canWrite(user: Usuario, module: NombreModulo): boolean {
  if(user.isAdmin) return true;
  const nivel = user.Permisos[module] ?? NivelPermisos.Desactivado;
  return nivel === NivelPermisos.Escritura;
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

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
      component: panel,
      meta: { requiresAuth: true },
      // Aquí estarán las páginas que se mostrarán dentro del panel
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
          name: 'sistemas', // Añadido name para redirecciones seguras
          component: SistemasView,
          meta: { requiresAuth: true, module: 'Sistemas' as NombreModulo, requiredLevel: NivelPermisos.Lectura }
        },

        {
          path: 'usuarios',
          name: 'usuarios',
          component: UsuariosView,
          meta: { requiresAuth: true, module: 'Usuarios' as NombreModulo, requiredLevel: NivelPermisos.Lectura }
        },
        {
          path: 'roles',
          name: 'roles',
          component: RolesView,
          meta: { requiresAuth: true, module: 'Roles' as NombreModulo, requiredLevel: NivelPermisos.Lectura }
        },

        {
          path: 'historias',
          name: 'historias',
          component: HistoriasView,
          meta: { requiresAuth: true, module: 'Historias' as NombreModulo, requiredLevel: NivelPermisos.Lectura }
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
    sistemas, usuarios o historias.
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

///Bloqueo de permisos////
router.beforeEach((to, from, next)=> {
  // Ignorar validaciones si va directo al login
  if(to.path === '/'){
    return next();
  }

  const currentUserString = localStorage.getItem('user');
  const user = currentUserString ? JSON.parse(currentUserString) : null;

  if (to.meta.requiresAuth){
    if (!user){
      return next({ name: 'login'});
    }

    // El administrador puede acceder a todos los modulos
    if (user.isAdmin) {
      return next();
    }

    const module = to.meta.module as NombreModulo;
    const requiredLevel = (to.meta.requiredLevel as number) || 2;

    if(module) {
      const NivelUsuario = user.Permisos?.[module] ?? 1;

      if(NivelUsuario < requiredLevel) {
        alert("Acceso denegado: No tienes permisos para ingresar a este modulo.");
        return next({ name: 'sistemas'});
      }
    }
  }
  next();
})

export default router;
