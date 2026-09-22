<script setup lang="ts">

/*
  Vista base para la gestión de Roles.

  Aquí posteriormente podrán agregarse:
  - Crear roles.
  - Editar roles.
  - Asignar permisos.
  - Asignar roles a usuarios.
*/

</script>

<template>

  <section class="modulo">

    <header>

      <p class="etiqueta">
        MÓDULO SELECCIONADO
      </p>

      <h2>Roles</h2>

      <p>
        Gestión de roles y permisos del sistema.
      </p>

    </header>

    <div class="tarjeta">

      <h3>Módulo de Roles</h3>

      <p>
        Esta vista queda preparada para gestionar
        los roles de los usuarios y sus permisos
        de acceso a los diferentes módulos.
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

  .permisos {
    grid-template-columns: 1fr;
  }

}

</style>