<script setup lang="ts">

/*
  Vista base del módulo Usuarios.

  Se deja preparada para que posteriormente
  se agreguen las funciones del Planner.
*/

</script>

<template>

  <section class="modulo">

    <header>

      <p class="etiqueta">
        MÓDULO SELECCIONADO
      </p>

      <h2>Usuarios</h2>

      <p>
        Administración de los usuarios del sistema.
      </p>

    </header>

    <div class="tarjeta">

      <h3>Módulo de Usuarios</h3>

      <p>
        Esta es la vista base del módulo Usuarios.
        Posteriormente se podrán agregar las funciones
        para registrar, consultar y administrar usuarios.
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