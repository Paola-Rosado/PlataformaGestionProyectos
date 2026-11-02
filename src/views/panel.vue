<template>
  <div class="panel">

    <!-- MENÚ LATERAL -->
    <aside class="sidebar">

      <div>
        <div class="logo">
          <div class="logo-icon">◆</div>

          <div>
            <span>Plataforma de</span>
            <h2>Gestión de Proyectos</h2>
          </div>
        </div>

        <p class="menu-titulo">MENÚ PRINCIPAL</p>

        <nav>
          <RouterLink to="/panel/sistemas">
            <span class="icono">▣</span>
            <span>Sistemas</span>
          </RouterLink>

          <RouterLink to="/panel/usuarios">
            <span class="icono">♟</span>
            <span>Usuarios</span>
          </RouterLink>

          <RouterLink to="/panel/roles">
            <span class="icono">♢</span>
            <span>Roles</span>
          </RouterLink>

          <RouterLink to="/panel/historias">
            <span class="icono">▤</span>
            <span>Historias de Usuario</span>
          </RouterLink>
        </nav>
      </div>

      <div class="sidebar-footer">
        <button class="cerrar-sesion" @click="cerrarSesion">
          <span>↪</span>
          Cerrar sesión
        </button>

        <div class="mensaje">
          <p>Grandes proyectos,</p>
          <p>mejores historias ♡</p>
        </div>
      </div>

    </aside>

    <!-- PARTE DERECHA -->
    <div class="pagina">

      <!-- ENCABEZADO -->
      <header class="header">

        <div>
          <p class="bienvenida">PANEL ADMINISTRADOR</p>
          <h1>Plataforma de Gestión de Proyectos</h1>
        </div>

        <div class="usuario">
          <div class="avatar">A</div>

          <div class="usuario-info">
            <strong>Administrador</strong>
            <span>Panel de administración</span>
          </div>
        </div>

      </header>

      <!-- CONTENIDO DE LAS VISTAS -->
      <main class="contenido">
        <RouterView />
      </main>

    </div>

  </div>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'

const router = useRouter()

const cerrarSesion = () => {
  router.push('/')
}

</script>

<style scoped>

/* =========================
   ESTRUCTURA GENERAL
========================= */

.panel {
  min-height: 100vh;
  display: flex;
  background-color: #f8f6f6;
  font-family: Arial, Helvetica, sans-serif;
}

/* =========================
   SIDEBAR
========================= */

.sidebar {
  width: 270px;
  min-height: 100vh;
  background-color: #222223;
  color: #fefefe;
  padding: 30px 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* LOGO */

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px;
  margin-bottom: 45px;
}

.logo-icon {
  width: 45px;
  height: 45px;
  background-color: #b62a2d;
  border-radius: 12px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 22px;
}

.logo span {
  font-size: 13px;
  color: #e6a8a8;
}

.logo h2 {
  font-size: 17px;
  margin: 3px 0 0;
  color: #fefefe;
}

/* TITULO DEL MENU */

.menu-titulo {
  font-size: 11px;
  letter-spacing: 2px;
  color: #999;
  padding-left: 15px;
  margin-bottom: 15px;
}

/* NAVEGACIÓN */

nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

nav a {
  color: #fefefe;
  text-decoration: none;

  padding: 15px 17px;

  border-radius: 10px;

  display: flex;
  align-items: center;
  gap: 15px;

  font-size: 15px;

  transition: 0.25s;
}

nav a:hover {
  background-color: #333334;
  transform: translateX(3px);
}

.icono {
  font-size: 20px;
  width: 25px;
  text-align: center;
}

/* MÓDULO SELECCIONADO */

nav a.router-link-active {
  background-color: #b62a2d;
  box-shadow: 0 5px 15px rgba(182, 42, 45, 0.25);
}

/* =========================
   CERRAR SESIÓN
========================= */

.sidebar-footer {
  border-top: 1px solid #444;
  padding-top: 20px;
}

.cerrar-sesion {
  width: 100%;

  border: none;
  background: transparent;
  color: #fefefe;

  padding: 14px;

  text-align: left;

  font-size: 14px;
  cursor: pointer;

  border-radius: 8px;

  transition: 0.2s;
}

.cerrar-sesion:hover {
  background-color: #333334;
  color: #e6a8a8;
}

.cerrar-sesion span {
  margin-right: 10px;
}

.mensaje {
  margin-top: 30px;

  padding: 20px;

  border-radius: 15px;

  background: linear-gradient(
    135deg,
    #b62a2d,
    #d5575e
  );

  text-align: center;
}

.mensaje p {
  margin: 4px;
  font-size: 13px;
}

/* =========================
   PARTE DERECHA
========================= */

.pagina {
  flex: 1;
  min-width: 0;
}

/* =========================
   HEADER
========================= */

.header {
  min-height: 100px;
  background-color: #fefefe;

  padding: 20px 40px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  box-sizing: border-box;

  border-bottom: 1px solid #eee;
}

.bienvenida {
  color: #b62a2d;
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: bold;

  margin: 0 0 7px;
}

.header h1 {
  margin: 0;

  font-size: 28px;

  color: #222223;
}

/* USUARIO */

.usuario {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 43px;
  height: 43px;

  border-radius: 50%;

  background-color: #b62a2d;
  color: white;

  display: flex;
  justify-content: center;
  align-items: center;

  font-weight: bold;
}

.usuario-info {
  display: flex;
  flex-direction: column;
}

.usuario-info strong {
  color: #222223;
  font-size: 14px;
}

.usuario-info span {
  color: #888;
  font-size: 12px;
  margin-top: 3px;
}

/* =========================
   CONTENIDO
========================= */

.contenido {
  padding: 35px 40px;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {

  .sidebar {
    width: 220px;
  }

  .header h1 {
    font-size: 22px;
  }

  .contenido {
    padding: 25px;
  }
}

@media (max-width: 700px) {

  .panel {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-height: auto;
    padding: 20px;
  }

  .logo {
    margin-bottom: 20px;
  }

  nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .sidebar-footer {
    margin-top: 20px;
  }

  .mensaje {
    display: none;
  }

  .header {
    padding: 20px;
  }

  .header h1 {
    font-size: 20px;
  }

  .usuario-info {
    display: none;
  }

  .contenido {
    padding: 20px;
  }
}

@media (max-width: 450px) {

  nav {
    grid-template-columns: 1fr;
  }

  .header {
    align-items: flex-start;
  }

  .header h1 {
    font-size: 18px;
  }

}

</style>