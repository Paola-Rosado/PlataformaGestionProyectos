<script setup lang="ts">
/*
==========================================================
MÓDULO DE USUARIOS
==========================================================

Esta vista permite, para el SISTEMA SELECCIONADO:

1. Consultar sus usuarios.
2. Registrar un usuario nuevo (formulario).
3. Editar un usuario.
4. Desactivar o activar un usuario.

Reglas:
- Si no hay un sistema seleccionado, no se muestran usuarios.
- El rol se elige en un combo que se llena con los roles
  de la metodología del sistema (Scrum, Kanban, etc.).
- El usuario nuevo se registra como activo por defecto.
- El nombre de usuario es el correo electrónico.
*/

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { UsersRound, Pencil } from 'lucide-vue-next'
import { SistemaActivo } from '../router/index'
import { useAccesos } from '../composables/UseAccesos'
import { useSistemas } from '../composables/UseSistemas'
import type { Usuario } from '../interfaces/Usuario'

const router = useRouter()

const { sistemaSeleccionadoGlobal, seleccionarSistema } = SistemaActivo()
const { aplicarSistemaPorDefecto } = useSistemas()

// Si entran directo a Usuarios, también se aplica el sistema por defecto.
aplicarSistemaPorDefecto(sistemaSeleccionadoGlobal.value, seleccionarSistema)

const {
  rolesDeMetodologia,
  usuariosDeSistema,
  nombreCompleto,
  correoExiste,
  agregarUsuario,
  actualizarUsuario,
  alternarActivo
} = useAccesos()

/*
==========================================================
DATOS DEL SISTEMA SELECCIONADO
==========================================================
*/

// Usuarios del sistema seleccionado.
const usuariosDelSistema = computed(() =>
  sistemaSeleccionadoGlobal.value
    ? usuariosDeSistema(sistemaSeleccionadoGlobal.value.id)
    : []
)

// Roles que dependen de la metodología del sistema.
const rolesDisponibles = computed(() =>
  sistemaSeleccionadoGlobal.value
    ? rolesDeMetodologia(sistemaSeleccionadoGlobal.value.metodologia)
    : []
)

function irASistemas() {
  router.push('/panel/sistemas')
}

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
FORMULARIO (REGISTRAR / EDITAR)
==========================================================
false = tabla de usuarios | true = formulario
*/
const mostrarFormulario = ref(false)

// null = registrando un usuario nuevo | número = editando ese usuario.
const idEnEdicion = ref<number | null>(null)

const formulario = ref({
  correo: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  rol: '',
  activo: true
})

// Opciones del combo: los roles de la metodología. Si el usuario que se
// edita tiene un rol que ya no pertenece a la metodología, se conserva
// como opción para no perderlo sin querer.
const opcionesRol = computed(() => {
  const rol = formulario.value.rol
  return rol && !rolesDisponibles.value.includes(rol)
    ? [...rolesDisponibles.value, rol]
    : rolesDisponibles.value
})

function limpiarFormulario() {
  formulario.value = {
    correo: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rol: '',
    activo: true // Por defecto el usuario nuevo está activo.
  }
}

function abrirFormulario() {
  mensaje.value = ''
  idEnEdicion.value = null
  limpiarFormulario()
  mostrarFormulario.value = true
}

function editarUsuario(usuario: Usuario) {
  mensaje.value = ''
  idEnEdicion.value = usuario.id
  formulario.value = {
    correo: usuario.correo,
    nombre: usuario.nombre,
    apellidoPaterno: usuario.apellidoPaterno,
    apellidoMaterno: usuario.apellidoMaterno,
    rol: usuario.rol,
    activo: usuario.activo
  }
  mostrarFormulario.value = true
}

function cancelarFormulario() {
  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = false
  mensaje.value = ''
}

function guardarUsuario() {
  const sistema = sistemaSeleccionadoGlobal.value
  if (!sistema) return

  const correo = formulario.value.correo.trim()
  const nombre = formulario.value.nombre.trim()
  const apellidoPaterno = formulario.value.apellidoPaterno.trim()
  const apellidoMaterno = formulario.value.apellidoMaterno.trim()
  const rol = formulario.value.rol

  // El apellido materno es opcional.
  if (!correo || !nombre || !apellidoPaterno || !rol) {
    mostrarNotificacion('Por favor, completa todos los campos obligatorios.', 'error')
    return
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)

  if (!correoValido) {
    mostrarNotificacion('Escribe un correo electrónico válido.', 'error')
    return
  }

  // El correo es el nombre de usuario: no puede repetirse en el sistema.
  if (correoExiste(sistema.id, correo, idEnEdicion.value ?? undefined)) {
    mostrarNotificacion('Ya existe un usuario con ese correo en este sistema.', 'error')
    return
  }

  const datos = {
    correo,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    rol,
    activo: formulario.value.activo
  }

  if (idEnEdicion.value !== null) {
    actualizarUsuario(idEnEdicion.value, datos)
    mostrarNotificacion('Usuario modificado correctamente.')
  } else {
    agregarUsuario({ sistemaId: sistema.id, ...datos })
    mostrarNotificacion('Usuario registrado correctamente.')
  }

  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = false
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
</script>

<template>
  <section class="modulo">

    <!-- ENCABEZADO -->
    <header>
      <div class="encabezado-titulo">
        <div>
          <p class="etiqueta">MÓDULO SELECCIONADO</p>

          <h2 class="titulo-modulo">
            <UsersRound :size="28" />
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

      <p>Administración de los usuarios del sistema seleccionado.</p>
    </header>

    <div class="tarjeta">

      <!-- ==================================================
           SIN SISTEMA SELECCIONADO
           ================================================== -->
      <div v-if="!sistemaSeleccionadoGlobal" class="estado-vacio sin-sistema">
        <h4>Selecciona un sistema para ver sus usuarios</h4>
        <p>
          Los usuarios y sus roles dependen del sistema y de su metodología.
        </p>
        <button type="button" class="btn-agregar" @click="irASistemas">
          Ir a Sistemas
        </button>
      </div>

      <!-- ==================================================
           VISTA 1: LISTADO DE USUARIOS
           ================================================== -->
      <div v-else-if="!mostrarFormulario">

        <div class="encabezado-tabla">
          <div>
            <h3>Listado de usuarios</h3>
            <p>
              Consulta y administra los usuarios del sistema
              (metodología: {{ sistemaSeleccionadoGlobal.metodologia }}).
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
                <th>Correo</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(usuario, indice) in usuariosDelSistema"
                :key="usuario.id"
                :class="{ 'fila-inactiva': !usuario.activo }"
              >
                <!-- Número consecutivo dentro del sistema -->
                <td>{{ indice + 1 }}</td>

                <td>
                  {{ usuario.correo }}
                  <span v-if="!usuario.activo" class="chip-inactivo">Inactivo</span>
                </td>

                <td>{{ nombreCompleto(usuario) }}</td>

                <td>{{ usuario.rol }}</td>

                <td>
                  <div class="acciones-tabla">

                    <!-- EDITAR -->
                    <button
                      type="button"
                      class="btn-icono btn-editar"
                      title="Editar usuario"
                      aria-label="Editar usuario"
                      @click="editarUsuario(usuario)"
                    >
                      <Pencil :size="18" />
                    </button>

                    <!-- ACTIVAR / DESACTIVAR (interruptor ON / OFF) -->
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

                  </div>
                </td>
              </tr>

              <!-- MENSAJE CUANDO EL SISTEMA NO TIENE USUARIOS -->
              <tr v-if="usuariosDelSistema.length === 0">
                <td colspan="5" class="mensaje-vacio">
                  <div class="estado-vacio">
                    <h4>Este sistema aún no tiene usuarios</h4>
                    <p>Presiona "Agregar usuario" para registrar el primero.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================================================
           VISTA 2: FORMULARIO (REGISTRAR / EDITAR)
           ================================================== -->
      <div v-else>

        <div class="encabezado-formulario">
          <h3>
            {{ idEnEdicion !== null ? 'Modificar usuario' : 'Registrar nuevo usuario' }}
          </h3>
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

          <h4 class="subtitulo-seccion">ROL Y ESTADO</h4>
          <hr class="divisor-seccion" />

          <div class="fila-campos">
            <!-- ROL (SEGÚN LA METODOLOGÍA DEL SISTEMA) -->
            <div class="campo">
              <label for="rol">
                Rol ({{ sistemaSeleccionadoGlobal?.metodologia }})
              </label>
              <select id="rol" v-model="formulario.rol" required>
                <option value="">Selecciona un rol</option>
                <option
                  v-for="rol in opcionesRol"
                  :key="rol"
                  :value="rol"
                >
                  {{ rol }}
                </option>
              </select>
            </div>

            <!-- ACTIVO (POR DEFECTO MARCADO) -->
            <div class="campo campo-check">
              <label class="check-activo" for="activo">
                <input
                  id="activo"
                  v-model="formulario.activo"
                  type="checkbox"
                />
                Usuario activo
              </label>
            </div>
          </div>

          <div class="acciones-formulario">
            <button
              type="button"
              class="btn-cancelar"
              @click="cancelarFormulario"
            >
              Cancelar
            </button>

            <button type="submit" class="btn-guardar">
              {{ idEnEdicion !== null ? 'Guardar cambios' : 'Guardar usuario' }}
            </button>
          </div>

        </form>
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

/* TABLA (mismo estilo que la de Sistemas) */
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
  padding: 5px 15px;
  color: #555555;
  border-bottom: 1px solid #eeeeee;
  vertical-align: middle;
}

.tabla-usuarios tbody tr:hover {
  background: #FAFAFA;
}

/* Usuario desactivado */
.fila-inactiva td:not(:last-child) {
  color: #999999;
}

.chip-inactivo {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 20px;
  background: #F2F2F2;
  color: #777777;
  font-size: 11px;
  font-weight: 600;
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

.estado-vacio.sin-sistema {
  text-align: center;
}

.estado-vacio.sin-sistema .btn-agregar {
  margin-top: 15px;
}

/* ACCIONES DE LA TABLA */
.acciones-tabla {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

/* Editar */
.btn-editar {
  color: #B7791F;
}

.btn-editar:hover {
  background: #FFFBEB;
  border-color: #FDE68A;
}

/* Interruptor activar / desactivar (ON / OFF) */
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
  margin: 10px 0 8px;
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

.campo input[type="text"],
.campo input[type="email"],
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

/* Check "Usuario activo", alineado con el combo de rol */
.campo-check {
  justify-content: flex-end;
}

.check-activo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  cursor: pointer;
}

.check-activo input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #B62A2D;
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
