<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const mostrarPassword = ref(false)
const router = useRouter()
const correo = ref('')
const password = ref('')
const codigo = ref('')

// Usuarios que pueden acceder
const usuarios = [
  {
    correo: 'paola@gmail.com',
    password: '1234',
    codigo: 'admin'
  },
  {
    correo: 'Rubyl@gmail.com',
    password: '5678',
    codigo: 'admin'
  },
  {
    correo: 'Monsen@gmail.com',
    password: 'admin123',
    codigo: 'admin'
  }
]

const iniciarSesion = () => {

  // Verificar que los campos estén llenos
  if (
    correo.value === '' ||
    password.value === '' ||
    codigo.value === ''
  ) {
    alert('Por favor completa todos los campos')
    return
  }

  // Buscar si existe el usuario
  const usuarioEncontrado = usuarios.find(
    usuario =>
      usuario.correo === correo.value &&
      usuario.password === password.value &&
      usuario.codigo === codigo.value
  )

  if (usuarioEncontrado) {
   alert('Credenciales correctas')
    router.push('/panel')
  } else {
    alert('Datos de acceso incorrectos')
  }
}
</script>

<template>
  <div class="login-card">

    <h2>Iniciar sesión</h2>

    <form @submit.prevent="iniciarSesion">

      <div class="campo">
        <label>Correo o usuario</label>
        <input
          v-model="correo"
          type="email"
          placeholder="Correo electrónico"
        />
      </div>

      <div class="campo">
        <label>Contraseña</label>

        <div class="password-container">
          <input
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            placeholder="Contraseña"
          />

          <span
            class="ojo"
            @click="mostrarPassword = !mostrarPassword"
          >
            {{ mostrarPassword ? '👁️⃠' : '👁️' }}
          </span>
        </div>
      </div>

      <div class="campo">
        <label>Código de acceso</label>
        <input
          v-model="codigo"
          type="text"
          placeholder="Código de acceso"
        />
      </div>

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
}

/* Adaptación para celular */
/* RESPONSIVE: adapta el diseño del login para pantallas pequeñas como celulares */
@media (max-width: 500px) {
  .login-card {
    width: 95%;
    padding: 20px;
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