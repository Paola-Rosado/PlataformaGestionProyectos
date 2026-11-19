<script setup lang="ts">

// ======================================================
// 1. IMPORTACIONES
// ======================================================

import { ref } from 'vue'
import Cookies from 'js-cookie'
import { Cookie } from 'lucide-vue-next'

// ======================================================
// 2. MOSTRAR AVISO DE COOKIES
// ======================================================

// Muestra el aviso cada vez que se abre el panel principal.
const mostrarAviso = ref(true)

// ======================================================
// 3. ACEPTAR COOKIES
// ======================================================

const aceptarCookies = (): void => {

  // Guarda la preferencia durante 365 días.
  Cookies.set('preferenciasCookies', 'aceptadas', {
    expires: 365,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
    path: '/'
  })

  // Oculta el aviso y el fondo oscuro.
  mostrarAviso.value = false
}

// ======================================================
// 4. RECHAZAR COOKIES OPCIONALES
// ======================================================

const rechazarCookies = (): void => {

  // Guarda la decisión del usuario.
  Cookies.set('preferenciasCookies', 'rechazadas', {
    expires: 365,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
    path: '/'
  })

  // Oculta el aviso y el fondo oscuro.
  mostrarAviso.value = false
}

</script>

<template>

  <!-- FONDO OSCURO + AVISO CENTRADO -->

  <div
    v-if="mostrarAviso"
    class="overlay-cookies"
  >
    <section
      class="aviso-cookies"
      aria-labelledby="titulo-cookies"
    >

      <div class="cookies-encabezado">

        <Cookie
          :size="30"
          :stroke-width="1.8"
          class="cookies-icono"
          aria-hidden="true"
        />

        <h2 id="titulo-cookies">
          Aviso de cookies
        </h2>

      </div>

      <p>
        Utilizamos cookies necesarias para mantener tu sesión
        y permitir el correcto funcionamiento de nuestra
        Plataforma de Gestión de Proyectos.
      </p>

      <p>
        Las cookies necesarias permanecerán activas.
        Actualmente no utilizamos cookies opcionales.
        Puedes guardar tu preferencia para su uso futuro.
      </p>

      <!-- BOTONES DE ACEPTACIÓN Y RECHAZO -->

      <div class="cookies-botones">

        <button
          type="button"
          class="btn-aceptar"
          @click="aceptarCookies"
        >
          Aceptar cookies
        </button>

        <button
          type="button"
          class="btn-rechazar"
          @click="rechazarCookies"
        >
          Rechazar opcionales
        </button>

      </div>

    </section>
  </div>

</template>

<style scoped>

/* ======================================================
   1. FONDO OSCURO TRANSPARENTE
====================================================== */

.overlay-cookies {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.55);

  z-index: 9999;
}

/* ======================================================
   2. CONTENEDOR DEL AVISO
====================================================== */

.aviso-cookies {
  width: 480px;
  max-width: calc(100% - 40px);

  padding: 24px;

  background: #222223;
  color: #FEFEFE;

  border: 1px solid #444444;
  border-radius: 14px;

  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}

/* ======================================================
   3. ENCABEZADO
====================================================== */

.cookies-encabezado {
  display: flex;
  align-items: center;

  gap: 12px;

  margin-bottom: 14px;
}

.cookies-icono {
  color: #E6A8A8;

  flex-shrink: 0;
}

.cookies-encabezado h2 {
  margin: 0;

  color: #FEFEFE;

  font-size: 20px;
  font-weight: 700;
}

/* ======================================================
   4. TEXTO DEL AVISO
====================================================== */

.aviso-cookies p {
  margin: 0 0 12px;

  color: #dddddd;

  font-size: 14px;
  line-height: 1.6;
}

/* ======================================================
   5. BOTONES
====================================================== */

.cookies-botones {
  display: flex;

  gap: 10px;

  margin-top: 20px;
}

.cookies-botones button {
  flex: 1;

  padding: 12px;

  border-radius: 8px;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;
}

/* Botón aceptar cookies */

.btn-aceptar {
  background: #B62A2D;
  color: #FEFEFE;

  border: 1px solid #B62A2D;
}

.btn-aceptar:hover {
  background: #D5575E;
}

/* Botón rechazar cookies */

.btn-rechazar {
  background: transparent;
  color: #FEFEFE;

  border: 1px solid #E6A8A8;
}

.btn-rechazar:hover {
  background: #444444;
}

/* ======================================================
   6. RESPONSIVE PARA CELULARES
====================================================== */

@media (max-width: 500px) {

  .aviso-cookies {
    width: calc(100% - 30px);

    padding: 20px;
  }

  .cookies-botones {
    flex-direction: column;
  }

}

</style>