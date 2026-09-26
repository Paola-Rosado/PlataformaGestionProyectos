<script setup lang="ts">

// computed permite crear valores calculados y reactivos.
import { computed } from 'vue'

// Router se utiliza para cerrar sesión y cambiar de página.
import { useRouter } from 'vue-router'
import { Eye, Pencil } from 'lucide-vue-next'

const router = useRouter()

/*
  Obtiene del navegador los datos del usuario
  que fueron guardados durante el Login.
*/
const usuarioGuardado = localStorage.getItem('user')

/*
  Si existe un usuario, convierte el JSON nuevamente
  en un objeto de JavaScript.
*/
const usuario = usuarioGuardado
  ? JSON.parse(usuarioGuardado)
  : null

/*
  Comprueba si un módulo debe aparecer.

  Si el permiso es:
  1 = no aparece.
  2 = aparece con lectura.
  3 = aparece con escritura.
*/
const puedeVer = (modulo: string) => {

  if (!usuario) {
    return false
  }

  return usuario.permisos?.[modulo] > 1
}

/*
  Devuelve un texto entendible para el nivel
  de permiso de cada módulo.


const nombrePermiso = (nivel: number) => {

  if (nivel === 3) {
    return 'Escritura'
  }

  if (nivel === 2) {
    return 'Lectura'
  }

  return 'Desactivado'
}
  */

/*
  Cuenta los módulos a los que puede acceder
  el usuario actualmente autenticado.
*/
const cantidadModulos = computed(() => {

  if (!usuario) {
    return 0
  }

  return Object.values(usuario.permisos)
    .filter((permiso) => Number(permiso) > 1)
    .length
})

/*
  Cierra la sesión.

  Elimina la información almacenada y
  regresa al Login.
*/
const cerrarSesion = () => {

  localStorage.removeItem('user')
  localStorage.removeItem('rolUsuario')

  router.push('/')
}

</script>

<template>

  <div class="panel">

    <!-- MENÚ LATERAL -->
    <aside class="sidebar">

      <div class="sidebar-header">

        <p class="marca">
          PGP
        </p>

        <h2>
          Panel Administrador
        </h2>

      </div>

      <!-- Información del usuario -->
      <section
        v-if="usuario"
        class="usuario"
      >

        <p class="usuario-etiqueta">
          SESIÓN ACTUAL
        </p>

        <strong>
          {{ usuario.nombre }}
        </strong>

        <span>
          {{ usuario.correo }}
        </span>

        <span class="rol">
          {{ usuario.rol }}
        </span>

      </section>

      <!--
        Los módulos solamente aparecen cuando
        el permiso correspondiente es 2 o 3.
      -->
      <nav class="menu">

       <RouterLink
          v-if="puedeVer('sistemas')"
          to="/panel/sistemas"
        >
          <span>Sistemas</span>

          <Pencil
            v-if="usuario.permisos.sistemas === 3"
            :size="18"
          />

          <Eye
            v-else-if="usuario.permisos.sistemas === 2"
            :size="18"
          />
        </RouterLink>

        <RouterLink
          v-if="puedeVer('usuarios')"
          to="/panel/usuarios"
        >
          <span>Usuarios</span>

          <Pencil
            v-if="usuario.permisos.usuarios === 3"
            :size="18"
          />

          <Eye
            v-else-if="usuario.permisos.usuarios === 2"
            :size="18"
          />
        </RouterLink>

        <RouterLink
          v-if="puedeVer('roles')"
          to="/panel/roles"
        >
          <span>Roles</span>

          <Pencil
            v-if="usuario.permisos.roles === 3"
            :size="18"
          />

          <Eye
            v-else-if="usuario.permisos.roles === 2"
            :size="18"
          />
        </RouterLink>

        <RouterLink
          v-if="puedeVer('historias')"
          to="/panel/historias"
        >
          <span>Historias de Usuario</span>

          <Pencil
            v-if="usuario.permisos.historias === 3"
            :size="18"
          />

          <Eye
            v-else-if="usuario.permisos.historias === 2"
            :size="18"
          />
        </RouterLink>

      </nav>

      <!-- Botón ubicado al final del menú -->
      <div class="sidebar-footer">

        <button
          type="button"
          @click="cerrarSesion"
        >
          Cerrar sesión
        </button>

      </div>

    </aside>

    <!-- ÁREA DERECHA -->
    <main class="contenido">

      <header class="encabezado">

        <div>

          <p class="etiqueta">
            PLATAFORMA DE GESTIÓN DE PROYECTOS
          </p>

          <h1>
            Panel principal
          </h1>

          <p v-if="usuario">
            Bienvenido, {{ usuario.nombre }}.
            Tienes acceso a {{ cantidadModulos }} módulo(s).
          </p>

        </div>

        <div
          v-if="usuario"
          class="rol-superior"
        >
          {{ usuario.rol }}
        </div>

      </header>

      <!--
        Aquí Vue muestra SistemasView, UsuariosView,
        RolesView o HistoriasView según la ruta.
      -->
      <section class="area-modulo">

        <RouterView />

      </section>

    </main>

  </div>

</template>

<style scoped>

.panel {
  width: 100%;
  min-height: 100vh;

  display: flex;

  background: #f7f3f3;

  color: #222223;
}

.sidebar {
  width: 285px;
  min-height: 100vh;

  display: flex;
  flex-direction: column;

  padding: 28px 20px;

  background: #222223;

  box-sizing: border-box;
}

.sidebar-header {
  margin-bottom: 25px;
}

.marca {
  margin: 0 0 8px;

  color: #E6A8A8;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 3px;
}

.sidebar-header h2 {
  margin: 0;

  color: #FEFEFE;

  font-size: 21px;
}

.usuario {
  display: flex;
  flex-direction: column;

  gap: 5px;

  margin-bottom: 25px;

  padding: 16px;

  border: 1px solid #444444;
  border-radius: 10px;

  background: #2c2c2e;
}

.usuario-etiqueta {
  margin: 0 0 5px;

  color: #E6A8A8;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 1.5px;
}

.usuario strong {
  color: #FEFEFE;

  font-size: 14px;
}

.usuario span {
  color: #cccccc;

  font-size: 12px;

  word-break: break-word;
}

.usuario .rol {
  width: fit-content;

  margin-top: 6px;

  padding: 4px 8px;

  border-radius: 5px;

  background: #E6A8A8;

  color: #222223;

  font-weight: 600;
}

.menu {
  display: flex;
  flex-direction: column;

  gap: 8px;
}

.menu a {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 10px;

  padding: 13px 14px;

  border-radius: 8px;

  color: #FEFEFE;

  text-decoration: none;

  transition: 0.2s;
}

.menu a:hover {
  background: #333335;
}

.menu a.router-link-active {
  background: #B62A2D;
}

.menu a small {
  color: #E6A8A8;

  font-size: 10px;
}

.menu a.router-link-active small {
  color: #FEFEFE;
}

.sidebar-footer {
  margin-top: auto;

  padding-top: 30px;
}

.sidebar-footer button {
  width: 100%;

  padding: 13px;

  border: none;
  border-radius: 8px;

  background: #B62A2D;

  color: #FEFEFE;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.sidebar-footer button:hover {
  background: #D5575E;
}

.contenido {
  flex: 1;

  min-width: 0;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 20px;

  padding: 30px 40px;

  background: #FEFEFE;

  border-bottom: 1px solid #eeeeee;
}

.etiqueta {
  margin: 0 0 6px;

  color: #B62A2D;

  font-size: 11px;
  font-weight: 700;

  letter-spacing: 2px;
}

.encabezado h1 {
  margin: 0;

  color: #222223;

  font-size: 28px;
}

.encabezado p:last-child {
  margin: 7px 0 0;

  color: #777777;

  font-size: 14px;
}

.rol-superior {
  padding: 9px 14px;

  border-radius: 7px;

  background: #E6A8A8;

  color: #222223;

  font-size: 13px;
  font-weight: 700;
}

.area-modulo {
  padding: 35px 40px;
}

/*
  RESPONSIVE DEL PANEL
*/
@media (max-width: 800px) {

  .panel {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-height: auto;
  }

  .sidebar-footer {
    margin-top: 25px;
  }

  .encabezado {
    padding: 25px 20px;
  }

  .area-modulo {
    padding: 25px 20px;
  }

}

@media (max-width: 500px) {

  .encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .menu a {
    width: 100%;

    box-sizing: border-box;
  }

}

</style>