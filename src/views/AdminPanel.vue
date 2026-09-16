<template>
  <div class="admin-container">

    <!-- MENÚ LATERAL -->
    <aside class="sidebar">
      <h2>Panel Administrador</h2>

      <nav>
        <RouterLink to="/admin/sistemas">
          Sistemas
        </RouterLink>

        <RouterLink to="/admin/usuarios">
          Usuarios
        </RouterLink>

        <RouterLink to="/admin/roles">
          Roles
        </RouterLink>

        <RouterLink to="/admin/historias">
          Historias de Usuario
        </RouterLink>
      </nav>
    </aside>

    <!-- CONTENIDO DEL PANEL -->
    <main class="contenido">
      <RouterView />
    </main>

  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>

.admin-container {
  display: flex;
  min-height: 100vh;
}

/* Menú lateral */

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
}

.sidebar h2 {
  margin-bottom: 30px;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sidebar a {
  color: white;
  text-decoration: none;
  padding: 10px;
  border-radius: 5px;
}

.sidebar a:hover {
  background-color: #34495e;
}

/* Página seleccionada */

.router-link-active {
  background-color: #42b883;
}

/* Área de contenido */

.contenido {
  flex: 1;
  padding: 30px;
  background-color: #f5f5f5;
}

/* RESPONSIVE */

@media (max-width: 768px) {

  .admin-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .sidebar nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

}

</style>