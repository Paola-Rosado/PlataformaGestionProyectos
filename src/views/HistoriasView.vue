<script setup lang="ts">

/*
  VISTA: HISTORIAS DE USUARIO

  Esta vista corresponde al módulo
  "Historias de Usuario" del Panel.

  Por el momento solamente dejamos preparada
  la estructura visual del módulo.

  Posteriormente aquí se podrán agregar las
  funciones correspondientes a las historias
  de usuario que tenemos en el Planner.
*/

</script>

<template>

  <!-- Contenedor principal del módulo -->
  <section class="modulo">

    <!-- Encabezado del módulo -->
    <header class="encabezado-modulo">

      <!-- Indica qué módulo fue seleccionado -->
      <p class="etiqueta">
        MÓDULO SELECCIONADO
      </p>

      <!-- Nombre del módulo -->
      <h2>
        Historias de Usuario
      </h2>

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

      <p>
        Esta es la vista base del módulo Historias de Usuario.
        Aquí se agregarán posteriormente las funciones
        correspondientes a las historias definidas en el Planner.
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

  h2 {
    font-size: 23px;
  }

  .tarjeta {
    padding: 20px;
  }

}

</style>