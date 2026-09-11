<template>
  <div>
    <p></p>
    <h1>Bienvenido al Panel Administrador</h1>

    <button @click="logout">
      Cerrar sesión
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  router.push('/')
}
</script>