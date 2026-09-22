<script setup lang="ts">

/*
  Esta vista representa la estructura base
  del módulo Sistemas.

  Posteriormente aquí se pueden agregar las
  funciones correspondientes al módulo.
*/

</script>

<template>

  <section class="modulo">

    <header>

      <p class="etiqueta">
        MÓDULO SELECCIONADO
      </p>

      <h2>Sistemas</h2>

      <p>
        Administración y gestión de sistemas.
      </p>

    </header>

    <div class="tarjeta">

      <h3>Módulo de Sistemas</h3>

      <p>
        Esta es la vista base del módulo Sistemas.
        Aquí se agregarán posteriormente las funciones
        correspondientes a este apartado.
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
  color: #777777;
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