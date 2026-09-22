<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
// App.vue es el componente principal.
// RouterView muestra la vista correspondiente según la ruta actual.
</script>

<style>
/* Estilos generales de toda la aplicación */

* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
}

body {
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #f8f6f6;
  color: #222223;
}

button,
input,
select,
textarea {
  font-family: inherit;
}
</style>