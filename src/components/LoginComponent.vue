
<script setup lang="ts">

// ======================================================
// 1. IMPORTACIONES
// ======================================================

// ref: crea variables reactivas.
// onMounted: ejecuta código cuando aparece el componente.
// watch: detecta cambios en una variable reactiva.
import { ref, onMounted, watch } from 'vue'

// Permite navegar entre páginas.
import { useRouter } from 'vue-router'

// Instancia del enrutador.
const router = useRouter()


// ======================================================
// 2. CAMPOS DEL FORMULARIO
// ======================================================

// Guarda el correo escrito por el usuario.
const correo = ref('')

// Guarda la contraseña.
const password = ref('')


// ======================================================
// 3. VARIABLES PARA MOSTRAR ERRORES
// ======================================================

// Indica si las credenciales son incorrectas.
const CInvalida = ref(false)

// Indica si faltan campos por completar.
const camposVacios = ref(false)

// Identifica los campos vacíos.
const correoVacio = ref(false)
const passwordVacio = ref(false)


// ======================================================
// 4. USUARIOS DEL SISTEMA
// ======================================================

/*
  PERMISOS:

  1 = Desactivado
  2 = Lectura
  3 = Escritura

  Cada usuario tiene:
  - Nombre
  - Correo
  - Contraseña
  - Rol
  - Permisos

  NOTA:
  Estos usuarios son exclusivamente de demostración.
  En producción deben almacenarse y autenticarse
  mediante un servidor seguro.
*/

const usuarios = [

  // ----------------------------------------------------
  // ADMINISTRADOR
  // ----------------------------------------------------
  {
    nombre: 'Paola Pech',
    correo: 'paola@gmail.com',
    password: '1234',
    rol: 'Administrador',

    // Tiene acceso completo al sistema.
    permisos: {
      sistemas: 3,
      usuarios: 3,
      roles: 3,
      historias: 3
    }
  },

  // ----------------------------------------------------
  // INVITADO
  // ----------------------------------------------------
  {
    nombre: 'Ruby Sosa',
    correo: 'Rubyl@gmail.com',
    password: '5678',
    rol: 'Invitado',

    // Tiene permisos limitados.
    permisos: {
      sistemas: 2,
      usuarios: 1,
      roles: 1,
      historias: 2
    }
  },

  // ----------------------------------------------------
  // EXTERNO - MONSERRATH
  // ----------------------------------------------------
  {
    nombre: 'Monserrath Dzul',
    correo: 'monserrath@gmail.com',
    password: '5678',
    rol: 'Externo',

    permisos: {
      sistemas: 2,
      usuarios: 1,
      roles: 1,
      historias: 2
    }
  },

  // ----------------------------------------------------
  // EXTERNO - GABRIELA
  // ----------------------------------------------------
  {
    nombre: 'Gabriela Cuellar',
    correo: 'gabriela@gmail.com',
    password: '9012',
    rol: 'Externo',

    permisos: {
      sistemas: 1,
      usuarios: 1,
      roles: 1,
      historias: 2
    }
  }

]


// ======================================================
// 5. MOSTRAR USUARIOS EXTERNOS
// ======================================================

// false: las opciones están ocultas.
// true: muestra Monserrath y Gabriela.
const mostrarExternos = ref(false)


// ======================================================
// 6. VARIABLES DEL CAPTCHA
// ======================================================

/*
  El CAPTCHA genera un código de cinco caracteres.

  Ejemplos:
  KYvH6
  M8pQ3
  T7xB4

  Distingue mayúsculas y minúsculas.
*/

// Guarda el código generado.
const codigoCaptcha = ref('')

// Guarda lo que escribe el usuario.
const respuestaCaptcha = ref('')

// Almacena los mensajes de error del CAPTCHA.
const captchaError = ref('')

// Referencia al canvas donde se dibujará el código.
const canvasCaptcha = ref<HTMLCanvasElement | null>(null)


// ======================================================
// 7. GENERAR CÓDIGO CAPTCHA
// ======================================================

/**
 * generarCaptcha()
 *
 * Genera un código aleatorio de cinco caracteres.
 *
 * Utiliza letras mayúsculas, minúsculas y números.
 * Excluye caracteres que pueden confundirse.
 *
 * También limpia la respuesta y errores anteriores.
 */
const generarCaptcha = (): void => {

  // Caracteres que pueden aparecer.
  const caracteres =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

  // Aquí se construirá el código.
  let codigo = ''

  // Obtiene números aleatorios del navegador.
  // Se utiliza para seleccionar los caracteres.
  const numeros = new Uint32Array(5)

  crypto.getRandomValues(numeros)

  // Recorre cinco posiciones.
  for (let i = 0; i < 5; i++) {

    // Selecciona una posición de la cadena.
    const indice = numeros[i]! % caracteres.length

    // Agrega el carácter seleccionado.
    codigo += caracteres.charAt(indice)
  }

  // Guarda el nuevo código.
  codigoCaptcha.value = codigo

  // Limpia lo que escribió el usuario.
  respuestaCaptcha.value = ''

  // Elimina los mensajes de error anteriores.
  captchaError.value = ''
}


// ======================================================
// 8. DIBUJAR CAPTCHA
// ======================================================

/**
 * dibujarCaptcha()
 *
 * Dibuja el código dentro de un canvas HTML.
 *
 * Agrega:
 * - Fondo rosado.
 * - Líneas decorativas.
 * - Letras y números.
 * - Inclinación de caracteres.
 * - Diferentes posiciones.
 *
 * Esto hace que el CAPTCHA tenga una apariencia
 * similar a los códigos visuales tradicionales.
 */
const dibujarCaptcha = (): void => {

  // Obtiene el canvas del template.
  const canvas = canvasCaptcha.value

  // Si el canvas no existe, termina.
  if (!canvas) return

  // Obtiene las herramientas de dibujo.
  const ctx = canvas.getContext('2d')

  // Si no se puede dibujar, termina.
  if (!ctx) return

  // Limpia completamente el dibujo anterior.
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

  // ----------------------------------------------------
  // DIBUJAR FONDO
  // ----------------------------------------------------

  ctx.fillStyle = '#F8EEEE'

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

  // ----------------------------------------------------
  // DIBUJAR LÍNEAS DECORATIVAS
  // ----------------------------------------------------

  // Genera seis líneas aleatorias.
  for (let i = 0; i < 6; i++) {

    ctx.beginPath()

    // Punto inicial de la línea.
    ctx.moveTo(
      Math.random() * canvas.width,
      Math.random() * canvas.height
    )

    // Punto final de la línea.
    ctx.lineTo(
      Math.random() * canvas.width,
      Math.random() * canvas.height
    )

    // Color de las líneas.
    ctx.strokeStyle = '#D6A4A4'

    // Grosor de las líneas.
    ctx.lineWidth = 1

    // Dibuja la línea.
    ctx.stroke()
  }

  // ----------------------------------------------------
  // DIBUJAR CARACTERES
  // ----------------------------------------------------

  // Recorre cada letra o número del código.
  for (let i = 0; i < codigoCaptcha.value.length; i++) {

    // Guarda la configuración actual del dibujo.
    ctx.save()

    // Calcula la posición horizontal.
    const x = 30 + i * 43

    // Cambia ligeramente la altura del carácter.
    const y = 45 + Math.random() * 12

    // Mueve el punto de dibujo.
    ctx.translate(x, y)

    // Inclina el carácter aleatoriamente.
    ctx.rotate(
      (Math.random() - 0.5) * 0.4
    )

    // Configura la tipografía.
    ctx.font = 'bold 35px Georgia'

    // Alterna colores entre rojo y gris oscuro.
    ctx.fillStyle = i % 2 === 0
      ? '#9C252A'
      : '#323238'

    // Centra cada carácter.
    ctx.textAlign = 'center'

    // Dibuja la letra o número.
    ctx.fillText(
      codigoCaptcha.value[i]!,
      0,
      0
    )

    // Recupera la configuración original.
    ctx.restore()
  }

}


// ======================================================
// 9. VALIDAR CAPTCHA
// ======================================================

/**
 * validarCaptcha()
 *
 * Comprueba si el usuario escribió correctamente
 * los cinco caracteres.
 *
 * Devuelve:
 * true: respuesta correcta.
 * false: respuesta incorrecta o vacía.
 */
const validarCaptcha = (): boolean => {

  // Elimina espacios al principio y al final.
  const respuesta = respuestaCaptcha.value.trim()

  // ----------------------------------------------------
  // VERIFICAR CAMPO VACÍO
  // ----------------------------------------------------

  if (respuesta === '') {

    captchaError.value =
      'Por favor, completa el CAPTCHA.'

    return false
  }

  // ----------------------------------------------------
  // COMPARAR CÓDIGOS
  // ----------------------------------------------------

  // La comparación distingue mayúsculas y minúsculas.
  if (respuesta !== codigoCaptcha.value) {

    // Genera otro CAPTCHA.
    generarCaptcha()

    // Muestra el mensaje de error.
    captchaError.value =
      'Código incorrecto. Intenta con el nuevo CAPTCHA.'

    return false
  }

  // ----------------------------------------------------
  // CAPTCHA CORRECTO
  // ----------------------------------------------------

  captchaError.value = ''

  return true
}


// ======================================================
// 10. CICLO DE VIDA DEL CAPTCHA
// ======================================================

/**
 * onMounted()
 *
 * Se ejecuta cuando Vue termina de montar
 * el componente en la página.
 *
 * Genera el primer código CAPTCHA.
 */
onMounted(() => {
  generarCaptcha()
})

/**
 * watch()
 *
 * Observa los cambios del código CAPTCHA.
 *
 * Cuando se genera un nuevo código,
 * actualiza automáticamente el canvas.
 */
watch(codigoCaptcha, () => {
  dibujarCaptcha()
})


// ======================================================
// 11. LIMPIAR ERRORES
// ======================================================

/**
 * limpiarErrores()
 *
 * Elimina los mensajes de error relacionados
 * con el correo y la contraseña.
 *
 * No borra el CAPTCHA.
 */
const limpiarErrores = (): void => {

  CInvalida.value = false

  camposVacios.value = false

  correoVacio.value = false

  passwordVacio.value = false
}


// ======================================================
// 12. SELECCIONAR USUARIO ESPECÍFICO
// ======================================================

/**
 * seleccionarUsuario()
 *
 * Se utiliza para seleccionar usuarios externos
 * que comparten el mismo rol.
 *
 * Completa automáticamente el correo y contraseña.
 */
const seleccionarUsuario = (
  usuario: typeof usuarios[number]
): void => {

  // Coloca las credenciales.
  correo.value = usuario.correo

  password.value = usuario.password

  // Limpia errores anteriores.
  limpiarErrores()

  // Oculta las opciones de usuarios externos.
  mostrarExternos.value = false
}


// ======================================================
// 13. RELLENAR CREDENCIALES SEGÚN ROL
// ======================================================

/**
 * llenarCredenciales()
 *
 * Busca un usuario por su rol.
 *
 * Se utiliza para:
 * - Administrador.
 * - Invitado.
 */
const llenarCredenciales = (rol: string): void => {

  // Busca el primer usuario con ese rol.
  const usuario = usuarios.find(
    usuario => usuario.rol === rol
  )

  // Si encuentra al usuario.
  if (usuario) {

    // Completa los campos.
    correo.value = usuario.correo

    password.value = usuario.password

    // Limpia los errores.
    limpiarErrores()

    // Oculta las opciones externas.
    mostrarExternos.value = false
  }
}


// ======================================================
// 14. MOSTRAR USUARIOS EXTERNOS
// ======================================================

/**
 * mostrarUsuariosExternos()
 *
 * Muestra u oculta los botones correspondientes
 * a Monserrath y Gabriela.
 */
const mostrarUsuariosExternos = (): void => {

  // Cambia el estado del menú.
  mostrarExternos.value = !mostrarExternos.value

  // Limpia errores anteriores.
  limpiarErrores()
}


// ======================================================
// 15. INICIAR SESIÓN
// ======================================================

/**
 * iniciarSesion()
 *
 * Es la función principal del formulario.
 *
 * Realiza los siguientes pasos:
 *
 * 1. Limpia errores anteriores.
 * 2. Verifica campos vacíos.
 * 3. Valida el CAPTCHA.
 * 4. Comprueba correo y contraseña.
 * 5. Guarda los datos del usuario.
 * 6. Redirige al panel.
 */
const iniciarSesion = (): void => {

  // ----------------------------------------------------
  // PASO 1. LIMPIAR ERRORES
  // ----------------------------------------------------

  limpiarErrores()

  // ----------------------------------------------------
  // PASO 2. VALIDAR CAMPOS VACÍOS
  // ----------------------------------------------------

  correoVacio.value = correo.value.trim() === ''

  passwordVacio.value = password.value.trim() === ''

  // Si algún campo está vacío, detiene el proceso.
  if (correoVacio.value || passwordVacio.value) {

    camposVacios.value = true

    return
  }

  // ----------------------------------------------------
  // PASO 3. VALIDAR CAPTCHA
  // ----------------------------------------------------

  // Si la respuesta está vacía o es incorrecta,
  // no permite continuar con el inicio de sesión.
  if (!validarCaptcha()) {
    return
  }

  // ----------------------------------------------------
  // PASO 4. BUSCAR USUARIO
  // ----------------------------------------------------

  // Busca un usuario que tenga el correo y
  // contraseña proporcionados.
  const usuarioEncontrado = usuarios.find(
    usuario =>
      usuario.correo === correo.value.trim() &&
      usuario.password === password.value
  )

  // ----------------------------------------------------
  // PASO 5. VALIDAR CREDENCIALES
  // ----------------------------------------------------

  // Si el usuario no existe o los datos no coinciden.
  if (!usuarioEncontrado) {

    CInvalida.value = true

    // Genera otro CAPTCHA para el siguiente intento.
    generarCaptcha()

    return
  }

  // ----------------------------------------------------
  // PASO 6. PREPARAR DATOS DE SESIÓN
  // ----------------------------------------------------

  // Conserva los datos que utiliza el panel.
  // No incluye la contraseña.
  const usuarioSesion = {

    nombre: usuarioEncontrado.nombre,

    correo: usuarioEncontrado.correo,

    rol: usuarioEncontrado.rol,

    permisos: usuarioEncontrado.permisos
  }

  // ----------------------------------------------------
  // PASO 7. GUARDAR DATOS
  // ----------------------------------------------------

  // Guarda la información para la demostración.
  localStorage.setItem(
    'user',
    JSON.stringify(usuarioSesion)
  )

  // ----------------------------------------------------
  // PASO 8. REDIRECCIÓN
  // ----------------------------------------------------

  // Navega al panel principal.
  router.push('/panel')
}

</script>


<template>

  <!-- ==================================================
       1. CONTENEDOR GENERAL
  ================================================== -->

  <main class="login-page">

    <!-- TARJETA DEL LOGIN -->
    <section class="login-card">

      <!-- ================================================
           2. ENCABEZADO
      ================================================= -->

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


      <!-- ================================================
           3. FORMULARIO
      ================================================= -->

      <!--
        @submit.prevent evita que la página se recargue.
        Ejecuta iniciarSesion cuando se presiona Entrar.
      -->
      <form @submit.prevent="iniciarSesion" novalidate>

        <!-- ============================================
             CORREO ELECTRÓNICO
        ============================================= -->

        <div class="campo">

          <label for="correo">
            Correo electrónico
          </label>

          <input
            id="correo"
            v-model="correo"
            type="email"
            placeholder="Ingresa tu correo"
            autocomplete="username"
            :class="{
              'input-error': correoVacio || CInvalida
            }"
          />

        </div>


        <!-- ============================================
             CONTRASEÑA
        ============================================= -->

        <div class="campo">

          <label for="password">
            Contraseña
          </label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autocomplete="current-password"
            :class="{
              'input-error': passwordVacio || CInvalida
            }"
          />

        </div>


        <!-- ============================================
             4. CAPTCHA ALFANUMÉRICO
        ============================================= -->

        <div class="captcha-contenedor">

          <!-- Título del CAPTCHA -->
          <p class="captcha-titulo">
            Verificación de seguridad
          </p>

          <!-- Imagen y botón para actualizar -->
          <div class="captcha-fila">

            <!--
              Canvas donde se dibujan los caracteres.
              El dibujo se realiza desde TypeScript.
            -->
            <canvas
              ref="canvasCaptcha"
              width="230"
              height="75"
              class="captcha-canvas"
              role="img"
              aria-label="Código de verificación visual"
            ></canvas>

            <!-- Botón para generar otro código -->
            <button
              type="button"
              class="captcha-recargar"
              @click="generarCaptcha"
              title="Generar otro código"
              aria-label="Generar otro CAPTCHA"
            >
              ↻
            </button>

          </div>

          <!-- Campo para escribir el CAPTCHA -->
          <label for="respuesta-captcha">
            Código de verificación
          </label>

          <input
            id="respuesta-captcha"
            v-model="respuestaCaptcha"
            type="text"
            maxlength="5"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :class="{
              'input-error': Boolean(captchaError)
            }"
            :aria-invalid="Boolean(captchaError)"
            aria-describedby="captcha-mensaje"
          />

          <!-- Mensaje cuando el CAPTCHA falla -->
          <p
            v-if="captchaError"
            id="captcha-mensaje"
            class="captcha-error"
            role="alert"
          >
            {{ captchaError }}
          </p>

        </div>


        <!-- ============================================
             5. MENSAJES DE ERROR
        ============================================= -->

        <!-- Campos vacíos -->
        <div
          v-if="camposVacios"
          class="mensaje-error"
          role="alert"
        >
          Por favor completa todos los campos.
        </div>

        <!-- Credenciales incorrectas -->
        <div
          v-if="CInvalida"
          class="mensaje-error"
          role="alert"
        >
          Credenciales inválidas.
        </div>


        <!-- ============================================
             6. BOTÓN ENTRAR
        ============================================= -->

        <button
          type="submit"
          class="btn-entrar"
        >
          Entrar
        </button>

      </form>


      <!-- ================================================
           7. ACCESOS DE PRUEBA
      ================================================= -->

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

        <!-- BOTONES DE ROLES -->
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


        <!-- ============================================
             8. OPCIONES DE USUARIOS EXTERNOS
        ============================================= -->

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
            @click="seleccionarUsuario(usuarios[2]!)"
          >
            Monserrath Dzul
          </button>

          <!-- GABRIELA -->
          <button
            type="button"
            class="btn-usuario"
            @click="seleccionarUsuario(usuarios[3]!)"
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
   1. PÁGINA GENERAL
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
   2. TARJETA DEL LOGIN
====================================================== */

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 35px;
  background: #FEFEFE;
  border: 1px solid #eadada;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(34, 34, 35, 0.1);
  box-sizing: border-box;
}


/* ======================================================
   3. ENCABEZADO
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
   4. CAMPOS DEL FORMULARIO
====================================================== */

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

label {
  display: block;
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
  box-shadow: 0 0 0 3px rgba(182, 42, 45, 0.1);
}

.input-error {
  border-color: #B62A2D;
}


/* ======================================================
   5. CAPTCHA ALFANUMÉRICO
====================================================== */

/* Contenedor general del CAPTCHA */
.captcha-contenedor {
  margin-bottom: 22px;
  padding: 17px;
  background: #fdf8f8;
  border: 1px solid #eadada;
  border-radius: 10px;
}

/* Título de verificación */
.captcha-titulo {
  margin: 0;
  color: #222223;
  font-size: 14px;
  font-weight: 700;
}

/* Texto de instrucciones */
.captcha-descripcion {
  margin: 6px 0 14px;
  color: #707070;
  font-size: 12px;
  line-height: 1.5;
}

/* Imagen y botón de actualización */
.captcha-fila {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

/* Área donde se dibuja el CAPTCHA */
.captcha-canvas {
  display: block;
  width: 100%;
  min-width: 0;
  height: auto;
  background: #F8EEEE;
  border: 1px solid #E6A8A8;
  border-radius: 8px;
  box-sizing: border-box;
}

/* Botón para generar otro código */
.captcha-recargar {
  flex-shrink: 0;
  padding: 10px 14px;
  background: #FEFEFE;
  color: #B62A2D;
  border: 1px solid #E6A8A8;
  border-radius: 8px;
  font-size: 25px;
  cursor: pointer;
  transition: 0.2s;
}

.captcha-recargar:hover {
  background: #f9e6e6;
  color: #8e1d22;
}

/* Campo para escribir los caracteres */
.captcha-contenedor input {
  width: 100%;
  letter-spacing: 1px;
}

/* Mensaje de CAPTCHA incorrecto */
.captcha-error {
  margin: 10px 0 0;
  color: #B62A2D;
  font-size: 12px;
  font-weight: 600;
}


/* ======================================================
   6. MENSAJES DE ERROR
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
   7. BOTÓN ENTRAR
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
   8. ACCESOS DE PRUEBA
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
   9. BOTONES DE ROLES
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
   10. OPCIONES DE USUARIOS EXTERNOS
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
   11. RESPONSIVE
   Adapta el login para dispositivos móviles.
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

  .captcha-contenedor {
    padding: 12px;
  }

  .captcha-recargar {
    padding: 8px 11px;
    font-size: 22px;
  }

}

</style>
