<script setup lang="ts">

// ======================================================
// IMPORTACIONES
// ======================================================

// ref permite crear variables reactivas en Vue.
import { ref } from 'vue'

// useRouter permite cambiar de página mediante Vue Router.
import { useRouter } from 'vue-router'

// Instancia del router.
const router = useRouter()


// ======================================================
// CAMPOS DEL FORMULARIO
// ======================================================

const correo = ref('')
const password = ref('')


// ======================================================
// VARIABLES PARA MOSTRAR ERRORES
// ======================================================

// Credenciales incorrectas.
const CInvalida = ref(false)

// Alguno de los campos está vacío.
const camposVacios = ref(false)

// Permiten identificar qué campo está vacío.
const correoVacio = ref(false)
const passwordVacio = ref(false)


// ======================================================
// USUARIOS DEL SISTEMA
// ======================================================

/**
 * PERMISOS DEL SISTEMA
 *
 * 1 = Desactivado
 * 2 = Lectura
 * 3 = Escritura
 *
 * Cada usuario tiene:
 * - Nombre
 * - Correo
 * - Contraseña
 * - Rol
 * - Permisos
 */

const usuarios = [

  // ====================================================
  // ADMINISTRADOR
  // ====================================================
  {
    nombre: 'Paola Pech',
    correo: 'paola@gmail.com',
    password: '1234',
    rol: 'Administrador',

    // El administrador tiene acceso completo.
    permisos: {
      sistemas: 3,
      usuarios: 3,
      roles: 3,
      historias: 3
    }
  },


  // ====================================================
  // INVITADO
  // ====================================================
  {
    nombre: 'Ruby Sosa',
    correo: 'Rubyl@gmail.com',
    password: '5678',
    rol: 'Invitado',

    // El invitado tiene permisos limitados.
    permisos: {
      sistemas: 2,
      usuarios: 1,
      roles: 1,
      historias: 2
    }
  },


  // ====================================================
  // EXTERNO - MONSERRATH
  // ====================================================
  {
    nombre: 'Monserrath Dzul',
    correo: 'monserrath@gmail.com',
    password: '5678',
    rol: 'Externo',

    // Permisos de Monserrath.
    permisos: {
      sistemas: 2,
      usuarios: 1,
      roles: 1,
      historias: 2
    }
  },


  // ====================================================
  // EXTERNO - GABRIELA
  // ====================================================
  {
    nombre: 'Gabriela Cuellar',
    correo: 'gabriela@gmail.com',
    password: '9012',
    rol: 'Externo',

    // Permisos de Gabriela.
    permisos: {
      sistemas: 1,
      usuarios: 1,
      roles: 1,
      historias: 2
    }
  }

]


// ======================================================
// MOSTRAR USUARIOS EXTERNOS
// ======================================================

// false = las opciones están ocultas.
// true = muestra Monserrath y Gabriela.
const mostrarExternos = ref(false)


// ======================================================
// LIMPIAR MENSAJES DE ERROR
// ======================================================

const limpiarErrores = () => {

  CInvalida.value = false
  camposVacios.value = false
  correoVacio.value = false
  passwordVacio.value = false

}


// ======================================================
// SELECCIONAR UN USUARIO ESPECÍFICO
// ======================================================

/**
 * Se utiliza cuando existen varios usuarios
 * con el mismo rol.
 *
 * En este caso:
 * - Monserrath = Externo
 * - Gabriela = Externo
 */

const seleccionarUsuario = (
  usuario: typeof usuarios[number]
) => {

  // Coloca automáticamente las credenciales.
  correo.value = usuario.correo
  password.value = usuario.password

  // Limpia posibles mensajes de error.
  limpiarErrores()

  // Después de seleccionar a una persona,
  // oculta nuevamente las opciones.
  mostrarExternos.value = false
}


// ======================================================
// RELLENAR CREDENCIALES SEGÚN EL ROL
// ======================================================

/**
 * Esta función se utiliza para:
 *
 * Administrador
 * Invitado
 *
 * Externo se maneja de forma diferente porque
 * tenemos dos personas con ese mismo rol.
 */

const llenarCredenciales = (rol: string) => {

  // Busca el primer usuario que tenga ese rol.
  const usuario = usuarios.find(
    usuario => usuario.rol === rol
  )

  // Si encuentra al usuario.
  if (usuario) {

    // Coloca automáticamente sus credenciales.
    correo.value = usuario.correo
    password.value = usuario.password

    // Limpia errores anteriores.
    limpiarErrores()

    // Oculta las opciones de externos.
    mostrarExternos.value = false
  }
}


// ======================================================
// BOTÓN EXTERNO
// ======================================================

/**
 * Al presionar el botón "Externo"
 * NO se llenan inmediatamente las credenciales.
 *
 * En su lugar se muestran:
 *
 * Monserrath Dzul
 * Gabriela Cuellar
 */

const mostrarUsuariosExternos = () => {

  mostrarExternos.value = !mostrarExternos.value

  // Limpia posibles mensajes anteriores.
  limpiarErrores()
}


// ======================================================
// INICIAR SESIÓN
// ======================================================

const iniciarSesion = () => {

  // Limpia los errores de intentos anteriores.
  limpiarErrores()


  // ----------------------------------------------------
  // VALIDAR CAMPOS VACÍOS
  // ----------------------------------------------------

  correoVacio.value = correo.value.trim() === ''

  passwordVacio.value = password.value.trim() === ''


  // Si alguno está vacío, no continúa.
  if (correoVacio.value || passwordVacio.value) {

    camposVacios.value = true

    return
  }


  // ----------------------------------------------------
  // BUSCAR USUARIO
  // ----------------------------------------------------

  /**
   * Busca una persona cuyo correo y contraseña
   * coincidan con los datos ingresados.
   */

  const usuarioEncontrado = usuarios.find(

    usuario =>

      usuario.correo === correo.value &&

      usuario.password === password.value

  )


  // ----------------------------------------------------
  // CREDENCIALES INCORRECTAS
  // ----------------------------------------------------

  if (!usuarioEncontrado) {

    CInvalida.value = true

    return
  }


  // ----------------------------------------------------
  // GUARDAR USUARIO EN LOCALSTORAGE
  // ----------------------------------------------------

  /**
   * Guardamos los datos necesarios para que
   * AdminPanel y Vue Router puedan conocer:
   *
   * - Nombre
   * - Correo
   * - Rol
   * - Permisos
   *
   * Por seguridad no guardamos la contraseña.
   */

  const usuarioSesion = {

    nombre: usuarioEncontrado.nombre,

    correo: usuarioEncontrado.correo,

    rol: usuarioEncontrado.rol,

    permisos: usuarioEncontrado.permisos

  }


  localStorage.setItem(
    'user',
    JSON.stringify(usuarioSesion)
  )


  // ----------------------------------------------------
  // REDIRECCIÓN
  // ----------------------------------------------------

  // Solamente llega aquí cuando las credenciales
  // son correctas.

  router.push('/panel')

}

</script>


<template>

  <!-- ==================================================
       CONTENEDOR GENERAL
  =================================================== -->

  <main class="login-page">


    <!-- =================================================
         TARJETA DEL LOGIN
    ================================================== -->

    <section class="login-card">


      <!-- ===============================================
           ENCABEZADO
      ================================================ -->

      <header class="login-header">

        <p class="etiqueta">
          PLATAFORMA
        </p>

        <h1>
          Plataforma de Gestión de Proyectos
        </h1>

        <p class="descripcion">
          Ingresa tus credenciales para acceder al sistema.
        </p>

      </header>


      <h2>
        Iniciar sesión
      </h2>


      <!-- ===============================================
           FORMULARIO
      ================================================ -->

      <form @submit.prevent="iniciarSesion">


        <!-- CORREO -->

        <div class="campo">

          <label for="correo">
            Correo electrónico
          </label>

          <input
            id="correo"
            v-model="correo"
            type="email"
            placeholder="Ingresa tu correo"
            :class="{
              'input-error': correoVacio || CInvalida
            }"
          />

        </div>


        <!-- CONTRASEÑA -->

        <div class="campo">

          <label for="password">
            Contraseña
          </label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            :class="{
              'input-error': passwordVacio || CInvalida
            }"
          />

        </div>


        <!-- =============================================
             ERROR: CAMPOS VACÍOS
        ============================================== -->

        <div
          v-if="camposVacios"
          class="mensaje-error"
        >
          Por favor completa todos los campos.
        </div>


        <!-- =============================================
             ERROR: CREDENCIALES INCORRECTAS
        ============================================== -->

        <div
          v-if="CInvalida"
          class="mensaje-error"
        >
          Credenciales inválidas.
        </div>


        <!-- =============================================
             BOTÓN ENTRAR
        ============================================== -->

        <button
          type="submit"
          class="btn-entrar"
        >
          Entrar
        </button>

      </form>


      <!-- =================================================
           ACCESOS DE PRUEBA
      ================================================== -->

      <section class="accesos-prueba">


        <!-- Separador -->

        <div class="separador">

          <span></span>

          <p>
            Accesos de prueba
          </p>

          <span></span>

        </div>


        <p class="ayuda">
          Selecciona un rol para completar las credenciales.
        </p>


        <!-- ===============================================
             BOTONES DE LOS 3 ROLES
        ================================================ -->

        <div class="botones-roles">


          <!-- ADMINISTRADOR -->

          <button
            type="button"
            @click="llenarCredenciales('Administrador')"
          >
            Administrador
          </button>


          <!-- INVITADO -->

          <button
            type="button"
            @click="llenarCredenciales('Invitado')"
          >
            Invitado
          </button>


          <!-- EXTERNO -->

          <button
            type="button"
            @click="mostrarUsuariosExternos"
          >
            Externo
          </button>


        </div>


        <!-- ===============================================
             USUARIOS EXTERNOS
             
             Solo aparece cuando se presiona "Externo".
        ================================================ -->

        <div
          v-if="mostrarExternos"
          class="opciones-externos"
        >

          <p class="titulo-externos">
            Selecciona el usuario externo
          </p>


          <!-- MONSERRATH -->

          <button
            type="button"
            class="btn-usuario"
            @click="seleccionarUsuario(usuarios[2])"
          >
            Monserrath Dzul
          </button>


          <!-- GABRIELA -->

          <button
            type="button"
            class="btn-usuario"
            @click="seleccionarUsuario(usuarios[3])"
          >
            Gabriela Cuellar
          </button>


        </div>


      </section>


    </section>

  </main>

</template>


<style scoped>

/* ======================================================
   PÁGINA GENERAL
====================================================== */

.login-page {

  min-height: 100vh;

  display: flex;

  justify-content: center;

  align-items: center;

  padding: 30px 20px;

  background: #f7f3f3;

  box-sizing: border-box;

}


/* ======================================================
   TARJETA DEL LOGIN
====================================================== */

.login-card {

  width: 100%;

  max-width: 430px;

  padding: 35px;

  background: #FEFEFE;

  border: 1px solid #eadada;

  border-radius: 16px;

  box-shadow:
    0 10px 30px rgba(34, 34, 35, 0.1);

  box-sizing: border-box;

}


/* ======================================================
   ENCABEZADO
====================================================== */

.login-header {

  text-align: center;

  margin-bottom: 25px;

}


.etiqueta {

  margin: 0 0 8px;

  color: #B62A2D;

  font-size: 12px;

  font-weight: 700;

  letter-spacing: 3px;

}


.login-header h1 {

  margin: 0;

  color: #222223;

  font-size: 27px;

  line-height: 1.2;

}


.descripcion {

  margin: 12px 0 0;

  color: #707070;

  font-size: 14px;

}


h2 {

  margin-bottom: 25px;

  color: #222223;

  text-align: center;

  font-size: 20px;

}


/* ======================================================
   CAMPOS
====================================================== */

.campo {

  display: flex;

  flex-direction: column;

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

  padding: 12px 14px;

  border: 1px solid #cccccc;

  border-radius: 8px;

  color: #222223;

  background: #FEFEFE;

  font-size: 15px;

  box-sizing: border-box;

  transition: 0.2s;

}


input:focus {

  outline: none;

  border-color: #B62A2D;

  box-shadow:
    0 0 0 3px rgba(182, 42, 45, 0.1);

}


.input-error {

  border-color: #B62A2D;

}


/* ======================================================
   MENSAJES DE ERROR
====================================================== */

.mensaje-error {

  margin-bottom: 15px;

  padding: 10px 12px;

  border-left: 4px solid #B62A2D;

  border-radius: 6px;

  background: #f9e6e6;

  color: #B62A2D;

  font-size: 14px;

}


/* ======================================================
   BOTÓN ENTRAR
====================================================== */

.btn-entrar {

  width: 100%;

  padding: 13px;

  border: none;

  border-radius: 8px;

  background: #B62A2D;

  color: #FEFEFE;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;

}


.btn-entrar:hover {

  background: #D5575E;

}


/* ======================================================
   ACCESOS DE PRUEBA
====================================================== */

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

  background: #E6A8A8;

}


.separador p {

  margin: 0;

  color: #666666;

  font-size: 12px;

  font-weight: 600;

}


.ayuda {

  margin: 12px 0;

  color: #777777;

  text-align: center;

  font-size: 12px;

}


/* ======================================================
   BOTONES DE ROLES
====================================================== */

.botones-roles {

  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 8px;

}


.botones-roles button {

  padding: 9px 5px;

  border: 1px solid #E6A8A8;

  border-radius: 7px;

  background: #FEFEFE;

  color: #B62A2D;

  font-size: 12px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;

}


.botones-roles button:hover {

  background: #E6A8A8;

  color: #222223;

}


/* ======================================================
   OPCIONES DE USUARIOS EXTERNOS
====================================================== */

.opciones-externos {

  margin-top: 15px;

  padding: 15px;

  border: 1px solid #E6A8A8;

  border-radius: 8px;

  background: #f8eeee;

}


.titulo-externos {

  margin: 0 0 12px;

  color: #222223;

  text-align: center;

  font-size: 13px;

  font-weight: 600;

}


.btn-usuario {

  width: 100%;

  margin-bottom: 8px;

  padding: 10px;

  border: 1px solid #E6A8A8;

  border-radius: 7px;

  background: #FEFEFE;

  color: #B62A2D;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;

}


.btn-usuario:last-child {

  margin-bottom: 0;

}


.btn-usuario:hover {

  background: #E6A8A8;

  color: #222223;

}


/* ======================================================
   RESPONSIVE
   Adapta el Login para celulares.
====================================================== */

@media (max-width: 500px) {

  .login-page {

    padding: 15px;

  }


  .login-card {

    padding: 25px 20px;

  }


  .login-header h1 {

    font-size: 22px;

  }


  .botones-roles {

    grid-template-columns: 1fr;

  }

}

</style>