<script setup lang="ts">

// ref permite crear variables reactivas en Vue.
import { ref } from 'vue'

// useRouter permite cambiar de página mediante Vue Router.
import { useRouter } from 'vue-router'

// Instancia del router.
const router = useRouter()

// Campos del formulario.
const correo = ref('')
const password = ref('')

// Controla el mensaje de credenciales inválidas.
const CInvalida = ref(false)

// Controla el mensaje de campos vacíos.
const camposVacios = ref(false)

// Permite identificar individualmente los campos vacíos.
const correoVacio = ref(false)
const passwordVacio = ref(false)

/*
  PERMISOS DEL SISTEMA

  1 = Desactivado
  2 = Lectura
  3 = Escritura

  Cada usuario tiene un rol y permisos diferentes
  para los cuatro módulos del Panel.
*/
const usuarios = [
  {
    nombre: 'Paola Pech',
    correo: 'paola@gmail.com',
    password: '1234',
    rol: 'Administrador',

    permisos: {
      sistemas: 3,
      usuarios: 3,
      roles: 3,
      historias: 3
    }
  },

  {
    nombre: 'Ruby Sosa',
    correo: 'Rubyl@gmail.com',
    password: '5678',
    rol: 'Invitado',

    permisos: {
      sistemas: 2,
      usuarios: 1,
      roles: 1,
      historias: 2
    }
  },

  {
    nombre: 'Monserrat',
    correo: 'Monsen@gmail.com',
    password: 'admin123',
    rol: 'Externo',

    permisos: {
      sistemas: 1,
      usuarios: 1,
      roles: 1,
      historias: 2
    }
  }
]

/*
  Rellena automáticamente las credenciales.

  Esta función sirve para los tres botones de prueba
  solicitados: Administrador, Invitado y Externo.
*/
const llenarCredenciales = (rol: string) => {

  // Busca al usuario correspondiente al rol seleccionado.
  const usuario = usuarios.find(
    usuario => usuario.rol === rol
  )

  if (usuario) {

    // Coloca automáticamente correo y contraseña.
    correo.value = usuario.correo
    password.value = usuario.password

    // Limpia posibles errores anteriores.
    CInvalida.value = false
    camposVacios.value = false
    correoVacio.value = false
    passwordVacio.value = false
  }
}

/*
  Función principal para iniciar sesión.
*/
const iniciarSesion = () => {

  // Limpia los errores de intentos anteriores.
  CInvalida.value = false
  camposVacios.value = false
  correoVacio.value = false
  passwordVacio.value = false

  // Comprueba si el correo está vacío.
  correoVacio.value = correo.value.trim() === ''

  // Comprueba si la contraseña está vacía.
  passwordVacio.value = password.value.trim() === ''

  // Si falta alguno de los dos campos, detiene el proceso.
  if (correoVacio.value || passwordVacio.value) {

    camposVacios.value = true

    return
  }

  /*
    Busca un usuario que coincida exactamente
    con el correo y la contraseña.
  */
  const usuarioEncontrado = usuarios.find(
    usuario =>
      usuario.correo === correo.value &&
      usuario.password === password.value
  )

  /*
    Si no encuentra coincidencia, activa la variable
    reactiva que muestra "Credenciales inválidas".
  */
  if (!usuarioEncontrado) {

    CInvalida.value = true

    return
  }

  /*
    Guarda los datos del usuario en localStorage.

    Esto permite que AdminPanel y el router conozcan:
    - Nombre
    - Correo
    - Rol
    - Permisos

    No guardamos la contraseña.
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

  // Redirige al Panel después de autenticarse correctamente.
  router.push('/panel')
}

</script>

<template>

  <!-- Contenedor general del Login -->
  <main class="login-page">

    <!-- Tarjeta central -->
    <section class="login-card">

      <!-- Nombre del sistema -->
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

      <h2>Iniciar sesión</h2>

      <!--
        prevent evita que el navegador recargue la página
        al enviar el formulario.
      -->
      <form @submit.prevent="iniciarSesion">

        <!-- Campo correo -->
        <div class="campo">

          <label for="correo">
            Correo electrónico
          </label>

          <input
            id="correo"
            v-model="correo"
            type="email"
            placeholder="Ingresa tu correo"
            :class="{ 'input-error': correoVacio || CInvalida }"
          />

        </div>

        <!-- Campo contraseña -->
        <div class="campo">

          <label for="password">
            Contraseña
          </label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            :class="{ 'input-error': passwordVacio || CInvalida }"
          />

        </div>

        <!-- Aparece cuando falta llenar algún campo -->
        <div
          v-if="camposVacios"
          class="mensaje-error"
        >
          Por favor completa todos los campos.
        </div>

        <!--
          Aparece solamente cuando CInvalida = true.
          Es la variable reactiva solicitada por el profesor.
        -->
        <div
          v-if="CInvalida"
          class="mensaje-error"
        >
          Credenciales inválidas.
        </div>

        <!-- Botón principal -->
        <button
          type="submit"
          class="btn-entrar"
        >
          Entrar
        </button>

      </form>

      <!-- Accesos rápidos para pruebas -->
      <section class="accesos-prueba">

        <div class="separador">
          <span></span>

          <p>Accesos de prueba</p>

          <span></span>
        </div>

        <p class="ayuda">
          Selecciona un rol para completar las credenciales.
        </p>

        <div class="botones-roles">

          <button
            type="button"
            @click="llenarCredenciales('Administrador')"
          >
            Administrador
          </button>

          <button
            type="button"
            @click="llenarCredenciales('Invitado')"
          >
            Invitado
          </button>

          <button
            type="button"
            @click="llenarCredenciales('Externo')"
          >
            Externo
          </button>

        </div>

      </section>

    </section>

  </main>

</template>

<style scoped>

/*
  scoped hace que estos estilos solamente
  afecten a este componente.
*/

.login-page {
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 30px 20px;

  background: #f7f3f3;

  box-sizing: border-box;
}

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

  box-shadow: 0 0 0 3px rgba(182, 42, 45, 0.1);
}

.input-error {
  border-color: #B62A2D;
}

.mensaje-error {
  margin-bottom: 15px;

  padding: 10px 12px;

  border-left: 4px solid #B62A2D;
  border-radius: 6px;

  background: #f9e6e6;

  color: #B62A2D;

  font-size: 14px;
}

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

/*
  RESPONSIVE:
  adapta el Login a celulares.
*/
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