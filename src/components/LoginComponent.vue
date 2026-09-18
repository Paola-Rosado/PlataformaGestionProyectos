<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const mostrarPassword = ref(false)
const router = useRouter()
const correo = ref('')
const password = ref('')

const CInvalida = ref(false)
const camposVacios = ref(false)
const correoVacio = ref(false)
const passwordVacio = ref(false)

const correoInvalido = ref(false)
const passwordInvalida = ref(false)

// Usuarios que pueden acceder
const usuarios = [
  {
    correo: 'paola@gmail.com',
    password: '1234',

  },
  {
    correo: 'Rubyl@gmail.com',
    password: '5678',

  },
  {
    correo: 'Monsen@gmail.com',
    password: 'admin123',

  }
]

const iniciarSesion = () => {

  // Limpiar mensajes anteriores
  CInvalida.value = false
  camposVacios.value = false
  correoVacio.value = false
  passwordVacio.value = false
  correoInvalido.value = false
  passwordInvalida.value = false

  // Verificar qué campos están vacíos
  correoVacio.value = correo.value === ''
  passwordVacio.value = password.value === ''

  // Si algún campo está vacío
  if (correoVacio.value || passwordVacio.value) {
    camposVacios.value = true
    return
  }

  // Los campos ya están llenos
  camposVacios.value = false

  // Buscar si existe el correo
  const usuarioEncontrado = usuarios.find(
    usuario => usuario.correo === correo.value
  )

  // Si el correo no existe
  if (!usuarioEncontrado) {
    correoInvalido.value = true
    return
  }

  // Si el correo existe pero la contraseña es incorrecta
  if (usuarioEncontrado.password !== password.value) {
    passwordInvalida.value = true
    return
  }

  // Si todo está correcto
  router.push('/panel')
}
</script>

<template>
  <div class="login-card">

    <h2>Iniciar sesión</h2>

    <form @submit.prevent="iniciarSesion">

      <div class="campo">
        <label>Correo</label>
        <input
          v-model="correo"
          type="email"
          placeholder="Correo electrónico"
          :class="{ 'input-error': correoVacio || correoInvalido }"
        />
        <p v-if="correoInvalido" class="mensaje-error campo-error">
        <span class="icono-error">!</span>
        <span>Correo no existe o es inválido</span>
      </p>
      </div>

      <div class="campo">
        <label>Contraseña</label>

        <div class="password-container">
          <input
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            :class="{ 'input-error': passwordVacio || passwordInvalida }"
          />

          <span
            class="ojo"
            @click="mostrarPassword = !mostrarPassword"
          >
            {{ mostrarPassword ? '👁️⃠' : '👁️' }}
          </span>
        </div>
        <p v-if="passwordInvalida" class="mensaje-error campo-error">
        <span class="icono-error">!</span>
        <span>Contraseña incorrecta</span>
      </p>
      </div>
      <!-- Mensaje cuando faltan campos -->
      <p v-if="camposVacios" class="mensaje-error">
        <span class="icono-error">!</span>
        <span>Por favor completa todos los campos</span>
      </p>

      <!-- Mensaje cuando las credenciales son incorrectas -->
      <p v-if="CInvalida" class="mensaje-error">
        <span class="icono-error">!</span>
        <span>Correo o contraseña incorrectos</span>
      </p>

      <button type="submit">
        Entrar
      </button>

    </form>
  </div>
</template>

<style scoped>
.login-card {
  width: 90%;
  max-width: 400px;
  margin: 30px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

input:focus {
  outline: none;
  border-color: #1877f2;
  box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.15);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
}

.campo {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 20px;
}

label {
  margin-bottom: 6px;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  background-color: #1877f2;
  color: white;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #166fe5;
}

.mensaje-error { 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 25px;
  margin-bottom: 20px;
  color: #d93025;
  text-align: center;
  font-size: 14px;
}
.campo-error {
  justify-content: center;
  margin-top: 5px;
  margin-bottom: -15px;
  text-align: center;
}

.icono-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid #d93025;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.input-error {
  border: 1px solid #d93025;
}

/* Adaptación para celular */
/* RESPONSIVE: adapta el diseño del login para pantallas pequeñas como celulares */
@media (max-width: 500px) {
  .login-card {
    width: min(90%, 400px);
    box-sizing: border-box;
  }

  input,
  button {
    font-size: 14px;
  }
}

.password-container {
  position: relative;
}

.password-container input {
  width: 100%;
  padding-right: 40px;
}

.ojo {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
}
</style>