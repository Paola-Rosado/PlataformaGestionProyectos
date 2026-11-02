<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Variable para mostrar u ocultar la contraseña
const mostrarPassword = ref(false)

// Datos del formulario
const correo = ref('')
const password = ref('')

// Variable reactiva para mostrar el mensaje de credenciales inválidas
const CInvalida = ref(false)

// Variables para validar campos vacíos
const camposVacios = ref(false)
const correoVacio = ref(false)
const passwordVacio = ref(false)

/*
  NUEVO:
  Se agregó el rol a cada usuario para identificar
  qué tipo de usuario está iniciando sesión.
*/
const usuarios = [
  {
    correo: 'paola@gmail.com',
    password: '1234',
    rol: 'administrador'
  },
  {
    correo: 'Rubyl@gmail.com',
    password: '5678',
    rol: 'invitado'
  },
  {
    correo: 'Monsen@gmail.com',
    password: 'admin123',
    rol: 'externo'
  }
]

/*
  NUEVO: Esta función permite rellenar automáticamente el correo y la contraseña dependiendo del rol
  seleccionado en los botones de acceso rápido.
*/
const llenarCredenciales = (rol: string) => {

  const usuario = usuarios.find(
    usuario => usuario.rol === rol
  )

  if (usuario) {
    correo.value = usuario.correo
    password.value = usuario.password

    // Limpiar mensajes de error
    CInvalida.value = false
    camposVacios.value = false
    correoVacio.value = false
    passwordVacio.value = false
  }
}

/*
  Función para validar las credenciales
  e iniciar sesión.
*/
const iniciarSesion = () => {

  // Limpiar mensajes anteriores
  CInvalida.value = false
  camposVacios.value = false
  correoVacio.value = false
  passwordVacio.value = false

  // Verificar si los campos están vacíos
  correoVacio.value = correo.value === ''
  passwordVacio.value = password.value === ''

  // Si algún campo está vacío
  if (correoVacio.value || passwordVacio.value) {
    camposVacios.value = true
    return
  }

  /*
    Buscar un usuario que tenga exactamente
    el correo y contraseña ingresados.
  */
  const usuarioEncontrado = usuarios.find(
    usuario =>
      usuario.correo === correo.value &&
      usuario.password === password.value
  )

  /*
    Si no se encuentra el usuario,
    se muestra el mensaje "Credenciales inválidas".
  */
  if (!usuarioEncontrado) {
    CInvalida.value = true
    return
  }

  /*
    NUEVO:
    Si las credenciales son correctas se guarda
    el rol del usuario.

    El Panel utilizará este dato para mostrar
    u ocultar módulos dependiendo del rol.
  */
  localStorage.setItem(
    'rolUsuario',
    usuarioEncontrado.rol
  )

  // Ocultar mensaje de error
  CInvalida.value = false

  // Redirigir al Panel
  router.push('/panel')
}

</script>

<template>

  <div class="login-page">

    <div class="login-card">

      <!--
        NUEVO:
        Se agregó el nombre del sistema para identificar
        la plataforma a la que está accediendo el usuario.
      -->
      <div class="encabezado-login">

        <div class="logo">
          ◆
        </div>

        <p class="bienvenida">
          BIENVENIDO
        </p>

        <h1>
          Plataforma de Gestión de Proyectos
        </h1>

        <p class="descripcion">
          Ingresa tus credenciales para continuar
        </p>

      </div>

      <h2>Iniciar sesión</h2>

      <form @submit.prevent="iniciarSesion">

        <!-- CORREO -->
        <div class="campo">

          <label>Correo</label>

          <input
            v-model="correo"
            type="email"
            placeholder="Correo electrónico"
            :class="{
              'input-error': correoVacio || CInvalida
            }"
          />

        </div>

        <!-- CONTRASEÑA -->
        <div class="campo">

          <label>Contraseña</label>

          <div class="password-container">

            <input
              v-model="password"
              :type="mostrarPassword ? 'text' : 'password'"
              placeholder="Contraseña"
              :class="{
                'input-error': passwordVacio || CInvalida
              }"
            />

            <span
              class="ojo"
              @click="mostrarPassword = !mostrarPassword"
            >
              {{ mostrarPassword ? '👁️⃠' : '👁️' }}
            </span>

          </div>

        </div>

        <!-- Mensaje cuando faltan campos -->
        <div
          v-if="camposVacios"
          class="mensaje-error"
        >
          <span class="icono-error">!</span>

          <span>
            Por favor completa todos los campos
          </span>
        </div>

        <!--
          Mensaje solicitado por el profesor.
          Solo aparece cuando CInvalida cambia a true.
        -->
        <div
          v-if="CInvalida"
          class="mensaje-error"
        >
          <span class="icono-error">!</span>

          <span>
            Credenciales inválidas
          </span>
        </div>

        <!-- BOTÓN PRINCIPAL -->
        <button
          type="submit"
          class="boton-entrar"
        >
          Entrar
        </button>

      </form>

      <!--
        NUEVO:
        Botones para probar rápidamente los diferentes roles.
        Al presionar uno se rellenan automáticamente
        el correo y la contraseña correspondientes.
      -->
      <div class="accesos-prueba">

        <div class="separador">
          <span></span>
          <p>Accesos de prueba</p>
          <span></span>
        </div>

        <p class="texto-prueba">
          Selecciona un rol para completar las credenciales
        </p>

        <div class="botones-roles">

          <button
            type="button"
            class="boton-rol"
            @click="llenarCredenciales('administrador')"
          >
            Administrador
          </button>

          <button
            type="button"
            class="boton-rol"
            @click="llenarCredenciales('invitado')"
          >
            Invitado
          </button>

          <button
            type="button"
            class="boton-rol"
            @click="llenarCredenciales('externo')"
          >
            Externo
          </button>

        </div>

      </div>

    </div>

  </div>

</template>

<style scoped>

/* ==========================================
   CONTENEDOR DEL LOGIN
========================================== */

.login-page {
  width: 100%;
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 30px 20px;

  background-color: #f8f6f6;

  box-sizing: border-box;
}

/* ==========================================
   TARJETA
========================================== */

.login-card {
  width: 100%;
  max-width: 430px;

  padding: 35px;

  background-color: #FEFEFE;

  border: 1px solid #f1dddd;
  border-radius: 18px;

  box-shadow: 0 10px 35px rgba(34, 34, 35, 0.10);
}

/* ==========================================
   ENCABEZADO
========================================== */

.encabezado-login {
  text-align: center;
  margin-bottom: 25px;
}

.logo {
  width: 55px;
  height: 55px;

  margin: 0 auto 15px;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #B62A2D;
  color: #FEFEFE;

  border-radius: 14px;

  font-size: 25px;

  box-shadow: 0 5px 15px rgba(182, 42, 45, 0.25);
}

.bienvenida {
  margin: 0 0 7px;

  color: #D5575E;

  font-size: 11px;
  font-weight: bold;

  letter-spacing: 3px;
}

.encabezado-login h1 {
  margin: 0;

  color: #222223;

  font-size: 25px;
  line-height: 1.2;
}

.descripcion {
  margin-top: 10px;

  color: #777;

  font-size: 14px;
}

h2 {
  text-align: center;

  margin-top: 0;
  margin-bottom: 25px;

  color: #222223;

  font-size: 20px;
}

/* ==========================================
   CAMPOS
========================================== */

.campo {
  display: flex;
  flex-direction: column;

  text-align: left;

  margin-bottom: 20px;
}

label {
  margin-bottom: 7px;

  color: #222223;

  font-size: 14px;
  font-weight: 600;
}

input {
  width: 100%;

  box-sizing: border-box;

  padding: 12px 14px;

  border: 1px solid #d7d7d7;
  border-radius: 8px;

  background-color: #FEFEFE;

  color: #222223;

  font-size: 15px;

  transition: 0.2s;
}

input:focus {
  outline: none;

  border-color: #B62A2D;

  box-shadow: 0 0 0 3px rgba(182, 42, 45, 0.10);
}

/* ==========================================
   CONTRASEÑA
========================================== */

.password-container {
  position: relative;
}

.password-container input {
  padding-right: 45px;
}

.ojo {
  position: absolute;

  right: 13px;
  top: 50%;

  transform: translateY(-50%);

  cursor: pointer;

  user-select: none;
}

/* ==========================================
   ERRORES
========================================== */

.mensaje-error {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  margin-top: 5px;
  margin-bottom: 18px;

  padding: 10px;

  background-color: #fbeaea;

  color: #B62A2D;

  border-radius: 7px;

  font-size: 14px;

  text-align: center;
}

.icono-error {
  width: 18px;
  height: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px solid #B62A2D;
  border-radius: 50%;

  font-size: 11px;
  font-weight: bold;

  flex-shrink: 0;
}

.input-error {
  border-color: #B62A2D;
}

/* ==========================================
   BOTÓN ENTRAR
========================================== */

.boton-entrar {
  width: 100%;

  padding: 13px;

  border: none;
  border-radius: 8px;

  background-color: #B62A2D;

  color: #FEFEFE;

  font-size: 15px;
  font-weight: bold;

  cursor: pointer;

  transition: 0.2s;
}

.boton-entrar:hover {
  background-color: #D5575E;

  transform: translateY(-1px);

  box-shadow: 0 5px 12px rgba(182, 42, 45, 0.20);
}

/* ==========================================
   ACCESOS DE PRUEBA
========================================== */

.accesos-prueba {
  margin-top: 30px;
}

.separador {
  display: flex;
  align-items: center;

  gap: 10px;
}

.separador span {
  flex: 1;

  height: 1px;

  background-color: #E6A8A8;
}

.separador p {
  margin: 0;

  color: #777;

  font-size: 12px;
  font-weight: bold;
}

.texto-prueba {
  margin: 12px 0;

  text-align: center;

  color: #888;

  font-size: 12px;
}

.botones-roles {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 8px;
}

.boton-rol {
  padding: 9px 5px;

  border: 1px solid #E6A8A8;
  border-radius: 7px;

  background-color: #FEFEFE;

  color: #B62A2D;

  font-size: 12px;
  font-weight: bold;

  cursor: pointer;

  transition: 0.2s;
}

.boton-rol:hover {
  background-color: #E6A8A8;

  color: #222223;
}

/* ==========================================
   RESPONSIVE
========================================== */

@media (max-width: 500px) {

  .login-page {
    padding: 20px 15px;
  }

  .login-card {
    padding: 25px 20px;
  }

  .encabezado-login h1 {
    font-size: 21px;
  }

  .botones-roles {
    grid-template-columns: 1fr;
  }

  input,
  .boton-entrar {
    font-size: 14px;
  }

}

</style>