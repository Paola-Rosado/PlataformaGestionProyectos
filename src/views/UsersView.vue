<script setup lang="ts">
/*
  Vista base del módulo Usuarios.
  Muestra el sistema actualmente seleccionado.
*/
import { SistemaActivo } from '../router/index'

const { sistemaSeleccionadoGlobal } = SistemaActivo()
</script>

<template>
  <section class="modulo">
    <header>
      <div class="encabezado-titulo">
        <div>
          <p class="etiqueta">MÓDULO SELECCIONADO</p>
          <h2>Usuarios</h2>
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
        Administración de los usuarios del sistema.
      </p>
    </header>

    <div class="tarjeta">
      <h3>Módulo de Usuarios</h3>

      <p v-if="sistemaSeleccionadoGlobal">
        Actualmente estás trabajando en el sistema: <strong>{{ sistemaSeleccionadoGlobal.nombre }}</strong>.
      </p>
      <p v-else>
        Esta es la vista base del módulo Usuarios. Selecciona un sistema en el módulo <strong>Sistemas</strong> para comenzar a administrar sus usuarios.
      </p>
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

/* ESTILOS DE LA ETIQUETA DEL SISTEMA */
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
  margin-bottom: 0;
  color: #666666;
  line-height: 1.6;
}
</style>