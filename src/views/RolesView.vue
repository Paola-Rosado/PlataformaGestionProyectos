<script setup lang="ts">
/*
  Vista base para la gestión de Roles.

  Muestra el sistema actualmente seleccionado desde el composable global.
  Aquí posteriormente podrán agregarse:
  - Crear roles.
  - Editar roles.
  - Asignar permisos.
  - Asignar roles a usuarios.
*/
import { SistemaActivo } from '../router/index'

const { sistemaSeleccionadoGlobal } = SistemaActivo ()
</script>

<template>
  <section class="modulo">
    <header>
      <div class="encabezado-titulo">
        <div>
          <p class="etiqueta">
            MÓDULO SELECCIONADO
          </p>

          <h2>Roles</h2>
        </div>

        <!-- ETIQUETA QUE MUESTRA EL SISTEMA SELECCIONADO AL LADO DERECHO -->
        <div v-if="sistemaSeleccionadoGlobal" class="badge-sistema">
          <span class="punto-activo">●</span>
          <span class="texto-sistema">{{ sistemaSeleccionadoGlobal.nombre }}</span>
        </div>
        <div v-else class="badge-sistema sin-seleccion">
          <span>Sin sistema seleccionado</span>
        </div>
      </div>

      <p>
        Gestión de roles y permisos del sistema.
      </p>
    </header>

    <div class="tarjeta">
      <h3>Módulo de Roles</h3>

      <p v-if="sistemaSeleccionadoGlobal">
        Actualmente estás administrando los roles y permisos del sistema: <strong>{{ sistemaSeleccionadoGlobal.nombre }}</strong>.
      </p>
      <p v-else>
        Esta vista queda preparada para gestionar los roles de los usuarios y sus permisos de acceso a los diferentes módulos. Selecciona un sistema en el módulo <strong>Sistemas</strong> para comenzar.
      </p>

      <!-- Explicación de los niveles utilizados -->
      <div class="permisos">
        <div>
          <strong>1</strong>
          <span>Desactivado</span>
        </div>

        <div>
          <strong>2</strong>
          <span>Lectura</span>
        </div>

        <div>
          <strong>3</strong>
          <span>Escritura</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.modulo {
  width: 100%;
}

header {
  margin-bottom: 25px;
}

.encabezado-titulo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.etiqueta {
  margin: 0 0 7px;
  color: #B62A2D;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

h2 {
  margin: 0;
  color: #222223;
  font-size: 28px;
}

header p:last-child {
  margin-top: 8px;
  color: #777777;
}

/* ESTILOS DE LA ETIQUETA DEL SISTEMA (DERECHA) */
.badge-sistema {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background-color: #222223;
  color: #ffffff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.punto-activo {
  color: #256B32;
  font-size: 10px;
}

.badge-sistema.sin-seleccion {
  background-color: #F7F7F7;
  color: #888888;
  border: 1px dashed #CCCCCC;
  box-shadow: none;
  font-weight: 500;
}

.tarjeta {
  padding: 30px;
  border: 1px solid #eeeeee;
  border-radius: 12px;
  background: #FEFEFE;
  box-shadow: 0 5px 18px rgba(34, 34, 35, 0.06);
}

.tarjeta h3 {
  margin-top: 0;
  color: #222223;
}

.tarjeta p {
  color: #666666;
  line-height: 1.6;
}

.permisos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 25px;
}

.permisos div {
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-radius: 8px;
  background: #f8eaea;
  text-align: center;
}

.permisos strong {
  color: #B62A2D;
  font-size: 20px;
}

.permisos span {
  margin-top: 4px;
  color: #222223;
  font-size: 13px;
}

@media (max-width: 500px) {
  .encabezado-titulo {
    flex-direction: column;
    align-items: flex-start;
  }

  .permisos {
    grid-template-columns: 1fr;
  }
}
</style>