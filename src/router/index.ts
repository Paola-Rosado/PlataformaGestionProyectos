import { createRouter, createWebHistory } from 'vue-router'

import panel from '../views/panel.vue'
import LoginComponent from '../components/LoginComponent.vue'

// Vistas de los módulos
import SistemasView from '../views/SistemasView.vue'
import UsuariosView from '../views/UsuariosView.vue'
import RolesView from '../views/RolesView.vue'
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
    {
      path: '/',
      component: LoginComponent
    },

    {
      path: '/panel',
      component: panel,
      meta: { requiresAuth: true },
      // Aquí estarán las páginas que se mostrarán dentro del panel
      children: [
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
