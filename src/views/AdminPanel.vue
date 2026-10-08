<script setup lang="ts">
import { Eye, Pencil } from 'lucide-vue-next'
// ======================================================
// 1. IMPORTACIONES
// ======================================================

// computed permite crear valores calculados y reactivos.
import { computed } from 'vue'

// Router se utiliza para cerrar sesión y cambiar de página.
import { useRouter } from 'vue-router'

// Importamos los iconos que representarán cada módulo.
import {
  MonitorCog,     // Sistemas
  UsersRound,     // Usuarios
  ShieldCheck,    // Roles
  ClipboardList   // Historias de Usuario
} from 'lucide-vue-next'

// Instancia del router.
const router = useRouter()


// ======================================================
// 2. OBTENER INFORMACIÓN DEL USUARIO
// ======================================================

/**
 * Obtiene del navegador los datos del usuario
 * que fueron guardados durante el Login.
 */
const usuarioGuardado = localStorage.getItem('user')

/**
 * Si existe un usuario, convierte el JSON nuevamente
 * en un objeto de JavaScript.
 *
 * Si no existe, devuelve null.
 */
const usuario = usuarioGuardado
  ? JSON.parse(usuarioGuardado)
  : null


// ======================================================
// 3. VERIFICAR PERMISOS
// ======================================================

/**
 * puedeVer()
 *
 * Comprueba si un módulo debe aparecer.
 *
 * Niveles:
 * 1 = Desactivado, no aparece.
 * 2 = Lectura, aparece.
 * 3 = Escritura, aparece.
 *
 * Recibe el nombre del módulo.
 */
const puedeVer = (modulo: string): boolean => {

  // Si no existe un usuario, no permite mostrar módulos.
  if (!usuario) {
    return false
  }

  // Comprueba que el permiso sea mayor que 1.
  return usuario.permisos?.[modulo] > 1
}


// ======================================================
// 4. MOSTRAR NOMBRE DEL PERMISO
// ======================================================

/**
 * nombrePermiso()
 *
 * Convierte el número del permiso en un texto.
 *
 * 3 = Escritura
 * 2 = Lectura
 * 1 = Desactivado
 */
const nombrePermiso = (nivel: number): string => {

  if (nivel === 3) {
    return 'Escritura'
  }

  if (nivel === 2) {
    return 'Lectura'
  }

  return 'Desactivado'
}


// ======================================================
// 5. CONTAR MÓDULOS DISPONIBLES
// ======================================================

/**
 * cantidadModulos
 *
 * Cuenta los módulos a los que puede acceder
 * el usuario actualmente autenticado.
 *
 * computed actualiza el resultado cuando cambian
 * sus dependencias reactivas.
 */
const cantidadModulos = computed(() => {

  // Si no existe un usuario, devuelve cero.
  if (!usuario) {
    return 0
  }

  // Obtiene todos los permisos del usuario.
  return Object.values(usuario.permisos ?? {})

    // Conserva únicamente los permisos mayores que 1.
    .filter((permiso) => Number(permiso) > 1)

    // Cuenta los módulos disponibles.
    .length
})


// ======================================================
// 6. CERRAR SESIÓN
// ======================================================

/**
 * cerrarSesion()
 *
 * Elimina los datos de sesión guardados
 * en el navegador.
 *
 * Después regresa al Login.
 */
const cerrarSesion = (): void => {

  // Elimina la información del usuario.
  localStorage.removeItem('user')

  // Elimina el rol almacenado, si existe.
  localStorage.removeItem('rolUsuario')

  // Redirige al inicio de sesión.
  router.push('/')
}

</script>


<template>

  <!-- ==================================================
       1. CONTENEDOR GENERAL DEL PANEL
  ================================================== -->

  <div class="panel">

    <!-- ==================================================
         2. MENÚ LATERAL
    ================================================== -->

    <aside class="sidebar">

      <!-- ENCABEZADO DEL MENÚ -->
      <div class="sidebar-header">

        <p class="marca">
          PGP
        </p>

        <h2>
          Panel Administrador
        </h2>

      </div>


      <!-- ==================================================
           3. INFORMACIÓN DEL USUARIO
      ================================================== -->

      <!--
        Solo se muestra cuando existe un usuario
        con sesión iniciada.
      -->
      <section
        v-if="usuario"
        class="usuario"
      >

        <p class="usuario-etiqueta">
          SESIÓN ACTUAL
        </p>

        <!-- Nombre del usuario -->
        <strong>
          {{ usuario.nombre }}
        </strong>

        <!-- Correo electrónico -->
        <span>
          {{ usuario.correo }}
        </span>

        <!-- Rol del usuario -->
        <span class="rol">
          {{ usuario.rol }}
        </span>

      </section>


      <!-- ==================================================
           4. MENÚ DE NAVEGACIÓN CON ICONOS
      ================================================== -->

      <!--
        Los módulos aparecen únicamente cuando
        el usuario tiene permiso de lectura
        o escritura.

        Cada módulo tiene:
        - Un icono representativo.
        - El nombre del módulo.
        - El nivel de permiso.
      -->

      <nav class="menu">

        <!-- ================================================
             MÓDULO SISTEMAS
        ================================================= -->

        <RouterLink
          v-if="puedeVer('sistemas')"
          to="/panel/sistemas"
        >

          <!-- Icono y nombre -->
          <div class="menu-opcion">

            <!-- Monitor con engranaje -->
            <MonitorCog
              class="menu-icono"
              :size="21"
              :stroke-width="1.8"
              aria-hidden="true"
            />

            <span>
              Sistemas
            </span>

          </div>

          <!-- Nivel de permiso -->
          <Pencil
              v-if="usuario?.permisos?.sistemas === 3"
              class="permiso-icono"
              :size="18"
            />

            <!-- Ojo para lectura -->
            <Eye
              v-else-if="usuario?.permisos?.sistemas === 2"
              class="permiso-icono"
              :size="18"
            />

        </RouterLink>


        <!-- ================================================
             MÓDULO USUARIOS
        ================================================= -->

        <RouterLink
          v-if="puedeVer('usuarios')"
          to="/panel/usuarios"
        >

          <div class="menu-opcion">

            <!-- Grupo de personas -->
            <UsersRound
              class="menu-icono"
              :size="21"
              :stroke-width="1.8"
              aria-hidden="true"
            />

            <span>
              Usuarios
            </span>
            <Pencil
              v-if="usuario?.permisos?.usuarios === 3"
              class="permiso-icono"
              :size="18"
            />
            <Eye
              v-else-if="usuario?.permisos?.usuarios === 2"
              class="permiso-icono"
              :size="18"
            />
          </div>



        </RouterLink>


        <!-- ================================================
             MÓDULO ROLES
        ================================================= -->

        <RouterLink
          v-if="puedeVer('roles')"
          to="/panel/roles"
        >

          <div class="menu-opcion">

            <!-- Escudo de seguridad -->
            <ShieldCheck
              class="menu-icono"
              :size="21"
              :stroke-width="1.8"
              aria-hidden="true"
            />

            <span>
              Roles
            </span>

          </div>

          <Pencil
            v-if="usuario?.permisos?.roles === 3"
            class="permiso-icono"
            :size="18"
          />
          <Eye
            v-else-if="usuario?.permisos?.roles === 2"
            class="permiso-icono"
            :size="18"
          />

        </RouterLink>


        <!-- ================================================
             MÓDULO HISTORIAS DE USUARIO
        ================================================= -->

        <RouterLink
          v-if="puedeVer('historias')"
          to="/panel/historias"
        >

          <div class="menu-opcion">

            <!-- Portapapeles con lista -->
            <ClipboardList
              class="menu-icono"
              :size="21"
              :stroke-width="1.8"
              aria-hidden="true"
            />

            <span>
              Historias de Usuario
            </span>

          </div>

          <Pencil
            v-if="usuario?.permisos?.historias === 3"
            class="permiso-icono"
            :size="18"
          />
          <Eye
            v-else-if="usuario?.permisos?.historias === 2"
            class="permiso-icono"
            :size="18"
          />

        </RouterLink>

      </nav>


      <!-- ==================================================
           5. BOTÓN CERRAR SESIÓN
      ================================================== -->

      <!--
        Se encuentra en la parte inferior
        del menú lateral.
      -->
      <div class="sidebar-footer">

        <button
          type="button"
          @click="cerrarSesion"
        >
          Cerrar sesión
        </button>

      </div>

    </aside>


    <!-- ==================================================
         6. ÁREA PRINCIPAL DEL SISTEMA
    ================================================== -->

    <main class="contenido">

      <!-- ENCABEZADO SUPERIOR -->
      <header class="encabezado">

        <div>

          <p class="etiqueta">
            PLATAFORMA DE GESTIÓN DE PROYECTOS
          </p>

          <h1>
            Panel principal
          </h1>

          <!-- Mensaje de bienvenida -->
          <p v-if="usuario">
            Bienvenido, {{ usuario.nombre }}.
            Tienes acceso a {{ cantidadModulos }} módulo(s).
          </p>

        </div>

        <!-- Rol mostrado en el encabezado -->
        <div
          v-if="usuario"
          class="rol-superior"
        >
          {{ usuario.rol }}
        </div>

      </header>


      <!-- ==================================================
           7. CONTENIDO DINÁMICO
      ================================================== -->

      <!--
        RouterView muestra el componente
        correspondiente a la ruta seleccionada.

        Por ejemplo:

        /panel/sistemas  -> SistemasView
        /panel/usuarios  -> UsuariosView
        /panel/roles     -> RolesView
        /panel/historias -> HistoriasView
      -->

      <section class="area-modulo">

        <RouterView />

      </section>

    </main>

  </div>

</template>


<style scoped>

/* ======================================================
   1. CONTENEDOR GENERAL
====================================================== */

.panel {
  width: 100%;
  min-height: 100vh;

  display: flex;

  background: #f7f3f3;

  color: #222223;
}


/* ======================================================
   2. MENÚ LATERAL
====================================================== */

.sidebar {
  width: 285px;
  min-height: 100vh;

  display: flex;
  flex-direction: column;

  padding: 28px 20px;

  background: #222223;

  box-sizing: border-box;

  flex-shrink: 0;
}


/* ======================================================
   3. ENCABEZADO DEL MENÚ
====================================================== */

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


/* ======================================================
   4. TARJETA DEL USUARIO
====================================================== */

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


/* ======================================================
   5. MENÚ DE NAVEGACIÓN
====================================================== */

.menu {
  display: flex;
  flex-direction: column;

  gap: 8px;
}

/* Estilo general de los enlaces */
.menu a {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 10px;

  padding: 13px 12px;

  border-radius: 8px;

  color: #FEFEFE;

  text-decoration: none;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

/* Al pasar el cursor */
.menu a:hover {
  background: #333335;
}

/* Módulo seleccionado */
.menu a.router-link-active {
  background: #B62A2D;
}

/* Texto del permiso */
.menu a small {
  color: #E6A8A8;

  font-size: 10px;

  flex-shrink: 0;
}

/* Permiso del módulo seleccionado */
.menu a.router-link-active small {
  color: #FEFEFE;
}


/* ======================================================
   6. ICONOS PERSONALIZADOS DEL MENÚ
====================================================== */

/*
  Agrupa el icono y el nombre del módulo.

  display: flex los coloca horizontalmente.
  gap establece la separación.
*/
.menu-opcion {
  display: flex;
  align-items: center;

  gap: 10px;

  min-width: 0;
}

/*
  Estilo general de los cuatro iconos.
*/
.menu-icono {
  flex-shrink: 0;

  color: #E6A8A8;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

/*
  Al pasar el cursor sobre el módulo,
  el icono se vuelve blanco y crece ligeramente.
*/
.menu a:hover .menu-icono {
  color: #FFFFFF;

  transform: scale(1.1);
}

/*
  Cuando un módulo está seleccionado,
  su icono permanece blanco.
*/
.menu a.router-link-active .menu-icono {
  color: #FFFFFF;
}

/*
  Texto del nombre del módulo.
*/
.menu-opcion span {
  color: #FEFEFE;

  font-size: 14px;
  font-weight: 500;

  line-height: 1.3;
}

/*
  Resalta el nombre del módulo activo.
*/
.menu a.router-link-active .menu-opcion span {
  font-weight: 700;
}


/* ======================================================
   7. BOTÓN CERRAR SESIÓN
====================================================== */

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


/* ======================================================
   8. ÁREA PRINCIPAL
====================================================== */

.contenido {
  flex: 1;

  min-width: 0;
}


/* ======================================================
   9. ENCABEZADO SUPERIOR
====================================================== */

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


/* ======================================================
   10. ROL DEL USUARIO
====================================================== */

.rol-superior {
  padding: 9px 14px;

  border-radius: 7px;

  background: #E6A8A8;

  color: #222223;

  font-size: 13px;
  font-weight: 700;
}


/* ======================================================
   11. CONTENIDO DE LOS MÓDULOS
====================================================== */

.area-modulo {
  padding: 35px 40px;
}


/* ======================================================
   12. RESPONSIVE PARA TABLETAS
====================================================== */

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


/* ======================================================
   13. RESPONSIVE PARA CELULARES
====================================================== */

@media (max-width: 500px) {

  .encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .menu a {
    width: 100%;
    box-sizing: border-box;
  }

  .menu-opcion {
    gap: 10px;
  }

  .menu-icono {
    width: 20px;
    height: 20px;
  }

  .permiso-icono {
  margin-left: auto;
  flex-shrink: 0;
}

/* Alinea el nombre y el permiso en la misma fila */
.menu a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* Alinea el icono del módulo con su nombre */
.menu-opcion {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.menu-icono {
  flex-shrink: 0;
}

/* Mantiene el ojo o lápiz a la derecha */
.permiso-icono {
  display: block;
  margin-left: auto;
  flex-shrink: 0;
}

}

</style>

