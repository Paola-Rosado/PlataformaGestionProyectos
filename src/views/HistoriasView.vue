<script setup lang="ts">
/*
  VISTA: HISTORIAS DE USUARIO

  Esta vista corresponde al módulo "Historias de Usuario" del Panel.
  Muestra el sistema actualmente seleccionado desde el composable global.
*/
import { SistemaActivo } from '../router/index'

const { sistemaSeleccionadoGlobal } = SistemaActivo ()
</script>

<template>
  <!-- Contenedor principal del módulo -->
  <section class="modulo">

    <!-- Encabezado del módulo -->
    <header class="encabezado-modulo">

      <div class="encabezado-titulo">
        <div>
          <!-- Indica qué módulo fue seleccionado -->
          <p class="etiqueta">
            MÓDULO SELECCIONADO
          </p>

          <!-- Nombre del módulo -->
          <h2>
            Historias de Usuario
          </h2>
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

      <!-- Descripción -->
      <p class="descripcion">
        Administración de las historias de usuario del proyecto.
      </p>

    </header>


    <!-- Tarjeta principal -->
    <div class="tarjeta">

      <h3>
        Módulo de Historias de Usuario
      </h3>

      <p v-if="sistemaSeleccionadoGlobal">
        Actualmente estás consultando las historias de usuario del sistema: <strong>{{ sistemaSeleccionadoGlobal.nombre }}</strong>.
      </p>
      <p v-else>
        Esta es la vista base del módulo Historias de Usuario. Selecciona un sistema en el módulo <strong>Sistemas</strong> para gestionar sus historias de usuario definidas en el Planner.
      </p>

    </div>

  </section>
</template>


<style scoped>

/*
  Contenedor general del módulo.
*/
.modulo {
  width: 100%;
}


/*
  Encabezado superior.
*/
.encabezado-modulo {
  margin-bottom: 25px;
}

.encabezado-titulo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}


/*
  Texto pequeño que indica
  que este es el módulo seleccionado.
*/
.etiqueta {
  margin: 0 0 7px;
  color: #B62A2D;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}


/*
  Título principal.
*/
h2 {
  margin: 0;
  color: #222223;
  font-size: 28px;
}


/*
  Descripción debajo del título.
*/
.descripcion {
  margin-top: 8px;
  color: #777777;
  font-size: 15px;
}


/*
  ESTILOS DE LA ETIQUETA DEL SISTEMA (DERECHA)
*/
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


/*
  Tarjeta donde posteriormente
  colocaremos las funciones del módulo.
*/
.tarjeta {
  padding: 30px;
  border: 1px solid #eeeeee;
  border-radius: 12px;
  background-color: #FEFEFE;
  box-shadow: 0 5px 18px rgba(34, 34, 35, 0.06);
}


/*
  Título de la tarjeta.
*/
.tarjeta h3 {
  margin-top: 0;
  color: #222223;
  font-size: 20px;
}


/*
  Texto de la tarjeta.
*/
.tarjeta p {
  margin-bottom: 0;
  color: #666666;
  line-height: 1.6;
}


/*
  RESPONSIVE

  Reduce los espacios y tamaños
  cuando se utiliza un celular.
*/
@media (max-width: 500px) {

  .encabezado-titulo {
    flex-direction: column;
    align-items: flex-start;
  }

  h2 {
    font-size: 23px;
  }

  .tarjeta {
    padding: 20px;
  }

}

</style>