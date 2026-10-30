<template>

  <!--
    RouterView carga la vista correspondiente
    dependiendo de la URL actual.
  -->
  <RouterView />

</template>

<style>

/*
  Estilos generales de toda la aplicación.
*/

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;

  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;

  background: #f7f3f3;

  color: #222223;

  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

button,
input {
  font-family: inherit;
}

</style>