<script setup lang="ts">
/*
==========================================================
MÓDULO DE USUARIOS
==========================================================

Esta vista permite:

1. Consultar los usuarios registrados.
2. Registrar un usuario nuevo (formulario).
3. Activar o desactivar un usuario.
4. Asignar un rol a un usuario (ventana modal).

El nombre de usuario es el correo electrónico.
El número (No.) es consecutivo.
*/

import { ref } from 'vue'
import { Users, UserCog } from 'lucide-vue-next'
import { SistemaActivo } from '../router/index'
import { useAccesos } from '../composables/UseAccesos.ts'
import type { Usuario } from '../interfaces/Usuario.ts'

const { sistemaSeleccionadoGlobal } = SistemaActivo()

const {
  usuarios,
  roles,
  nombreCompleto,
  nombreRol,
  correoExiste,
  agregarUsuario,
  alternarActivo,
  asignarRol
} = useAccesos()

/*
==========================================================
MENSAJES
==========================================================
*/
const mensaje = ref('')
const tipoMensaje = ref<'exito' | 'error'>('exito')

function mostrarNotificacion(
  texto: string,
  tipo: 'exito' | 'error' = 'exito'
) {
  mensaje.value = texto
  tipoMensaje.value = tipo
}

/*
==========================================================
FORMULARIO DE REGISTRO
==========================================================
false = tabla de usuarios | true = formulario
*/
const mostrarFormulario = ref(false)

const formulario = ref({
  correo: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: ''
})

function limpiarFormulario() {
  formulario.value = {
    correo: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  }
}

function abrirFormulario() {
  mensaje.value = ''
  limpiarFormulario()
  mostrarFormulario.value = true
}

function cancelarRegistro() {
  limpiarFormulario()
  mostrarFormulario.value = false
  mensaje.value = ''
}

function guardarUsuario() {
  const correo = formulario.value.correo.trim()
  const nombre = formulario.value.nombre.trim()
  const apellidoPaterno = formulario.value.apellidoPaterno.trim()
  const apellidoMaterno = formulario.value.apellidoMaterno.trim()

  // El apellido materno es opcional.
  if (!correo || !nombre || !apellidoPaterno) {
    mostrarNotificacion('Por favor, completa todos los campos obligatorios.', 'error')
    return
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)

  if (!correoValido) {
    mostrarNotificacion('Escribe un correo electrónico válido.', 'error')
    return
  }

  // El correo es el nombre de usuario, por lo que no puede repetirse.
  if (correoExiste(correo)) {
    mostrarNotificacion('Ya existe un usuario con ese correo electrónico.', 'error')
    return
  }

  agregarUsuario({ correo, nombre, apellidoPaterno, apellidoMaterno })

  limpiarFormulario()
  mostrarFormulario.value = false
  mostrarNotificacion('Usuario registrado correctamente.')
}

/*
==========================================================
ACTIVAR / DESACTIVAR
==========================================================
*/
function cambiarEstado(usuario: Usuario) {
  const ahoraActivo = alternarActivo(usuario.id)

  mostrarNotificacion(
    ahoraActivo
      ? `Usuario ${usuario.correo} activado.`
      : `Usuario ${usuario.correo} desactivado.`
  )
}

/*
==========================================================
ASIGNAR ROL (MODAL)
==========================================================
Muestra el usuario seleccionado y un combo con los roles.
*/
const usuarioParaRol = ref<Usuario | null>(null)
const rolSeleccionado = ref<number | ''>('')
const errorRol = ref('')

function abrirAsignarRol(usuario: Usuario) {
  mensaje.value = ''
  errorRol.value = ''
  usuarioParaRol.value = usuario
  // Si ya tiene rol, el combo inicia en ese rol.
  rolSeleccionado.value = usuario.rolId ?? ''
}

function cerrarAsignarRol() {
  usuarioParaRol.value = null
  errorRol.value = ''
}

function guardarRol() {
  if (!usuarioParaRol.value) return

  if (rolSeleccionado.value === '') {
    errorRol.value = 'Selecciona un rol.'
    return
  }

  asignarRol(usuarioParaRol.value.id, rolSeleccionado.value)

  mostrarNotificacion(
    `Rol "${nombreRol(rolSeleccionado.value)}" asignado a ${nombreCompleto(usuarioParaRol.value)}.`
  )
  cerrarAsignarRol()
}
</script>

<template>
  <section class="modulo">

    <!-- ENCABEZADO -->
    <header>
      <div class="encabezado-titulo">
        <div>
          <p class="etiqueta">MÓDULO SELECCIONADO</p>

          <h2 class="titulo-modulo">
            <Users :size="28" />
            <span>Usuarios</span>
          </h2>
        </div>

        <!-- ETIQUETA QUE MUESTRA EL SISTEMA SELECCIONADO AL LADO DERECHO -->
        <div v-if="sistemaSeleccionadoGlobal" class="badge-sistema">
          <span class="punto-activo">●</span>
          <span class="texto-sistema">{{ sistemaSeleccionadoGlobal.nombre }}</span>
        </div>
        <div v-else class="badge-sistema sin-seleccion">
          <span>Sin sistema seleccionado</span>
        </div>
      </div>

      <p>Administración de los usuarios del sistema.</p>
    </header>

    <div class="tarjeta">

      <!-- ==================================================
           VISTA 1: LISTADO DE USUARIOS
           ================================================== -->
      <div v-if="!mostrarFormulario">

        <div class="encabezado-tabla">
          <div>
            <h3>Listado de usuarios</h3>
            <p>
              Consulta y administra los usuarios
              que se encuentran registrados.
            </p>
          </div>

          <button
            type="button"
            class="btn-agregar"
            @click="abrirFormulario"
          >
            + Agregar usuario
          </button>
        </div>

        <!-- Mensajes -->
        <div
          v-if="mensaje"
          class="mensaje"
          :class="tipoMensaje"
          role="status"
        >
          <span>{{ mensaje }}</span>

          <button
            type="button"
            class="cerrar-mensaje"
            aria-label="Cerrar mensaje"
            @click="mensaje = ''"
          >
            ×
          </button>
        </div>

        <!-- TABLA DE USUARIOS -->
        <div class="contenedor-tabla">
          <table class="tabla-usuarios">
            <thead>
              <tr>
                <th>No.</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Apellido paterno</th>
                <th>Apellido materno</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="usuario in usuarios" :key="usuario.id">
                <td>{{ usuario.id }}</td>
                <td>{{ usuario.correo }}</td>
                <td>{{ usuario.nombre }}</td>
                <td>{{ usuario.apellidoPaterno }}</td>
                <td>{{ usuario.apellidoMaterno || '—' }}</td>

                <td>
                  <span
                    class="rol-etiqueta"
                    :class="{ 'sin-rol': usuario.rolId === null }"
                  >
                    {{ nombreRol(usuario.rolId) }}
                  </span>
                </td>

                <td>
                  <span
                    class="estado"
                    :class="usuario.activo ? 'estado-activo' : 'estado-inactivo'"
                  >
                    {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <td>
                  <div class="acciones-tabla">

                    <!-- ACTIVAR / DESACTIVAR (interruptor) -->
                    <button
                      type="button"
                      class="switch"
                      :class="{ activo: usuario.activo }"
                      role="switch"
                      :aria-checked="usuario.activo"
                      :aria-label="usuario.activo ? 'Desactivar usuario' : 'Activar usuario'"
                      :title="usuario.activo ? 'Desactivar usuario' : 'Activar usuario'"
                      @click="cambiarEstado(usuario)"
                    ></button>

                    <!-- ASIGNAR ROL -->
                    <button
                      type="button"
                      class="btn-icono btn-rol"
                      title="Asignar rol"
                      aria-label="Asignar rol"
                      @click="abrirAsignarRol(usuario)"
                    >
                      <UserCog :size="18" />
                    </button>

                  </div>
                </td>
              </tr>

              <!-- MENSAJE CUANDO NO HAY USUARIOS -->
              <tr v-if="usuarios.length === 0">
                <td colspan="8" class="mensaje-vacio">
                  <div class="estado-vacio">
                    <h4>No existen usuarios registrados</h4>
                    <p>Actualmente no hay usuarios dados de alta.</p>
                    <p>Presiona "Agregar usuario" para registrar uno nuevo.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================================================
           VISTA 2: FORMULARIO DE REGISTRO
           ================================================== -->
      <div v-else>

        <div class="encabezado-formulario">
          <h3>Registrar nuevo usuario</h3>
        </div>

        <!-- Mensajes (por ejemplo, errores de validación) -->
        <div
          v-if="mensaje"
          class="mensaje"
          :class="tipoMensaje"
          role="status"
        >
          <span>{{ mensaje }}</span>

          <button
            type="button"
            class="cerrar-mensaje"
            aria-label="Cerrar mensaje"
            @click="mensaje = ''"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="guardarUsuario">

          <h4 class="subtitulo-seccion">DATOS DEL USUARIO</h4>
          <hr class="divisor-seccion" />

          <div class="fila-campos">
            <!-- CORREO (NOMBRE DE USUARIO) -->
            <div class="campo">
              <label for="correo">
                Correo electrónico (será el nombre de usuario)
              </label>
              <input
                id="correo"
                v-model="formulario.correo"
                type="email"
                placeholder="ejemplo@dominio.com"
                required
              />
            </div>

            <!-- NOMBRE -->
            <div class="campo">
              <label for="nombre">Nombre</label>
              <input
                id="nombre"
                v-model="formulario.nombre"
                type="text"
                placeholder="Nombre(s)"
                required
              />
            </div>
          </div>

          <div class="fila-campos">
            <!-- APELLIDO PATERNO -->
            <div class="campo">
              <label for="apellidoPaterno">Apellido paterno</label>
              <input
                id="apellidoPaterno"
                v-model="formulario.apellidoPaterno"
                type="text"
                placeholder="Primer apellido"
                required
              />
            </div>

            <!-- APELLIDO MATERNO -->
            <div class="campo">
              <label for="apellidoMaterno">Apellido materno</label>
              <input
                id="apellidoMaterno"
                v-model="formulario.apellidoMaterno"
                type="text"
                placeholder="Segundo apellido (opcional)"
              />
            </div>
          </div>

          <div class="acciones-formulario">
            <button
              type="button"
              class="btn-cancelar"
              @click="cancelarRegistro"
            >
              Cancelar
            </button>

            <button type="submit" class="btn-guardar">
              Guardar usuario
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- ====================================================
         MODAL: ASIGNAR ROL
         ==================================================== -->
    <div
      v-if="usuarioParaRol"
      class="fondo-modal"
      @click.self="cerrarAsignarRol"
    >
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-asignar-rol"
      >
        <h3 id="titulo-asignar-rol">Asignar rol</h3>

        <!-- Usuario seleccionado -->
        <div class="dato-modal">
          <span>Usuario seleccionado</span>
          <strong>{{ nombreCompleto(usuarioParaRol) }}</strong>
          <small>{{ usuarioParaRol.correo }}</small>
        </div>

        <!-- Combo de roles -->
        <div class="campo">
          <label for="rol-asignar">Rol</label>
          <select id="rol-asignar" v-model.number="rolSeleccionado">
            <option value="">Selecciona un rol</option>
            <option
              v-for="rol in roles"
              :key="rol.id"
              :value="rol.id"
            >
              {{ rol.nombre }}
            </option>
          </select>
          <p v-if="errorRol" class="error-campo">{{ errorRol }}</p>
        </div>

        <div class="acciones-formulario">
          <button
            type="button"
            class="btn-cancelar"
            @click="cerrarAsignarRol"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="btn-guardar"
            @click="guardarRol"
          >
            Asignar rol
          </button>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
.modulo {
  width: 100%;
}

header {
  margin-bottom: 25px;
}

.encabezado-titulo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.etiqueta {
  margin: 0 0 7px;
  color: #B62A2D;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

h2 {
  margin: 0;
  color: #222223;
  font-size: 28px;
}

.titulo-modulo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.titulo-modulo svg {
  color: #B62A2D;
  flex-shrink: 0;
}

header p:last-child {
  margin-top: 8px;
  color: #777777;
}

/* ETIQUETA DEL SISTEMA SELECCIONADO */
.badge-sistema {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background-color: #222223;
  color: #ffffff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.punto-activo {
  color: #256B32;
  font-size: 10px;
}

.badge-sistema.sin-seleccion {
  background-color: #F7F7F7;
  color: #888888;
  border: 1px dashed #CCCCCC;
  box-shadow: none;
  font-weight: 500;
}

/* TARJETA */
.tarjeta {
  padding: 30px;
  border: 1px solid #eeeeee;
  border-radius: 12px;
  background: #FEFEFE;
  box-shadow: 0 5px 18px rgba(34, 34, 35, 0.06);
}

.tarjeta h3 {
  margin-top: 0;
  color: #222223;
  font-size: 20px;
}

.tarjeta p {
  color: #666666;
  line-height: 1.6;
}

/* MENSAJES */
.mensaje {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 18px;
  margin: 0 0 20px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.mensaje.exito {
  background: #E8F5E9;
  color: #256B32;
  border-color: #C8E6C9;
}

.mensaje.error {
  background: #FCE8E8;
  color: #B62A2D;
  border-color: #F2C6C6;
}

.cerrar-mensaje {
  flex-shrink: 0;
  padding: 0 4px;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.cerrar-mensaje:hover {
  opacity: 0.7;
}

/* ENCABEZADO DE LA TABLA */
.encabezado-tabla {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.encabezado-tabla p {
  margin-bottom: 0;
}

.btn-agregar {
  padding: 12px 20px;
  background: #B62A2D;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.btn-agregar:hover {
  background: #922124;
}

/* TABLA */
.contenedor-tabla {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eeeeee;
  border-radius: 10px;
}

.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: auto;
}

.tabla-usuarios th {
  padding: 15px;
  background: #F7F7F7;
  color: #222223;
  text-align: left;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 2px solid #eeeeee;
}

.tabla-usuarios td {
  padding: 8px 15px;
  color: #555555;
  border-bottom: 1px solid #eeeeee;
  vertical-align: middle;
}

.tabla-usuarios tbody tr:hover {
  background: #FAFAFA;
}

/* ESTADO VACÍO */
.mensaje-vacio {
  text-align: center;
}

.estado-vacio {
  padding: 35px 15px;
}

.estado-vacio h4 {
  margin: 0 0 10px;
  color: #222223;
  font-size: 16px;
}

.estado-vacio p {
  margin: 5px 0;
  color: #777777;
  font-size: 13px;
}

/* ETIQUETAS DE ROL Y ESTADO */
.rol-etiqueta {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  background: #FCE8E8;
  color: #B62A2D;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.rol-etiqueta.sin-rol {
  background: #F2F2F2;
  color: #888888;
  font-weight: 500;
}

.estado {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.estado-activo {
  background: #E3F5E8;
  color: #237442;
}

.estado-inactivo {
  background: #F2F2F2;
  color: #777777;
}

/* ACCIONES DE LA TABLA */
.acciones-tabla {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.btn-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  background: #FFFFFF;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.btn-icono:hover {
  transform: translateY(-2px);
}

.btn-icono:active {
  transform: scale(0.96);
}

.btn-rol {
  color: #2563EB;
}

.btn-rol:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
}

/* INTERRUPTOR ACTIVAR / DESACTIVAR */
.switch {
  position: relative;
  width: 44px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: #CFCFCF;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.switch.activo {
  background: #256B32;
}

.switch.activo::after {
  transform: translateX(20px);
}

.acciones-tabla button:focus-visible {
  outline: 2px solid #B62A2D;
  outline-offset: 3px;
}

/* FORMULARIO */
.encabezado-formulario {
  margin-bottom: 25px;
}

.subtitulo-seccion {
  margin: 0 0 8px;
  color: #B62A2D;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}

.divisor-seccion {
  margin: 0 0 20px;
  border: none;
  border-top: 1px solid #EEEEEE;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  min-width: 0;
}

.campo label {
  color: #222223;
  font-size: 14px;
  font-weight: 600;
}

.campo input,
.campo select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  background: #FFFFFF;
  color: #222223;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s ease;
}

.campo input:focus,
.campo select:focus {
  border-color: #B62A2D;
}

.error-campo {
  margin: 0;
  color: #B62A2D;
  font-size: 13px;
}

.fila-campos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.acciones-formulario {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
}

.btn-cancelar {
  padding: 12px 20px;
  background: #F2F2F2;
  color: #555555;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancelar:hover {
  background: #E5E5E5;
}

.btn-guardar {
  padding: 12px 20px;
  background: #B62A2D;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-guardar:hover {
  background: #922124;
}

/* MODAL */
.fondo-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.45);
}

.modal {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 25px;
  border-radius: 12px;
  background: #FFFFFF;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin-top: 0;
  color: #222223;
}

.dato-modal {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid #EEEEEE;
  border-radius: 9px;
  background: #FAFAFA;
}

.dato-modal span {
  color: #888888;
  font-size: 12px;
}

.dato-modal strong {
  color: #222223;
  font-size: 15px;
  overflow-wrap: anywhere;
}

.dato-modal small {
  color: #666666;
  font-size: 13px;
  overflow-wrap: anywhere;
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .tarjeta {
    padding: 20px;
  }

  .encabezado-tabla {
    flex-direction: column;
    align-items: flex-start;
  }

  .fila-campos {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .acciones-formulario {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-guardar {
    width: 100%;
  }
}

@media (max-width: 500px) {
  .encabezado-titulo {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
