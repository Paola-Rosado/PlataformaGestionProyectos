<script setup lang="ts">
/*
==========================================================
MÓDULO DE ROLES
==========================================================

Esta vista permite:

1. Consultar el listado de roles y los usuarios que tiene cada uno.
2. Agregar un usuario a un rol (ventana modal).

Es la operación inversa a Usuarios:
aquí se elige primero el rol y después el usuario en un combo.

Usuarios y Roles comparten los mismos datos (useAccesos),
por lo que lo que se asigne aquí se ve en Usuarios.
*/

import { ref } from 'vue'
import { ShieldCheck, UserPlus } from 'lucide-vue-next'
import { SistemaActivo } from '../router/index'
import { useAccesos } from '../composables/UseAccesos'
import type { Rol } from '../interfaces/Rol.ts'
import type { Usuario } from '../interfaces/Usuario.ts'

const { sistemaSeleccionadoGlobal } = SistemaActivo()

const {
  usuarios,
  roles,
  nombreCompleto,
  nombreRol,
  usuariosDeRol,
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
AGREGAR USUARIO A UN ROL (MODAL)
==========================================================
Muestra el detalle del rol y un combo con los usuarios.
*/
const rolParaUsuario = ref<Rol | null>(null)
const usuarioSeleccionado = ref<number | ''>('')
const errorUsuario = ref('')

function abrirAgregarUsuario(rol: Rol) {
  mensaje.value = ''
  errorUsuario.value = ''
  usuarioSeleccionado.value = ''
  rolParaUsuario.value = rol
}

function cerrarAgregarUsuario() {
  rolParaUsuario.value = null
  errorUsuario.value = ''
}

// Texto de cada opción del combo: nombre, correo y rol actual (si tiene).
function etiquetaUsuario(usuario: Usuario, rol: Rol) {
  const base = `${nombreCompleto(usuario)} — ${usuario.correo}`

  if (usuario.rolId === rol.id) return `${base} (ya tiene este rol)`
  if (usuario.rolId !== null) return `${base} (rol actual: ${nombreRol(usuario.rolId)})`
  return base
}

function guardarUsuarioEnRol() {
  if (!rolParaUsuario.value) return

  if (usuarioSeleccionado.value === '') {
    errorUsuario.value = 'Selecciona un usuario.'
    return
  }

  const usuario = usuarios.value.find(u => u.id === usuarioSeleccionado.value)
  if (!usuario) return

  asignarRol(usuario.id, rolParaUsuario.value.id)

  mostrarNotificacion(
    `${nombreCompleto(usuario)} ahora tiene el rol "${rolParaUsuario.value.nombre}".`
  )
  cerrarAgregarUsuario()
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
            <ShieldCheck :size="28" />
            <span>Roles</span>
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

      <p>Gestión de roles y permisos del sistema.</p>
    </header>

    <div class="tarjeta">

      <div class="encabezado-tabla">
        <div>
          <h3>Listado de roles</h3>
          <p>
            Consulta los roles disponibles y agrega usuarios a cada uno.
          </p>
        </div>
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

      <!-- TABLA DE ROLES -->
      <div class="contenedor-tabla">
        <table class="tabla-roles">
          <thead>
            <tr>
              <th>No.</th>
              <th>Rol</th>
              <th>Descripción</th>
              <th>Usuarios asignados</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="rol in roles" :key="rol.id">
              <td>{{ rol.id }}</td>
              <td class="celda-nombre">{{ rol.nombre }}</td>
              <td>{{ rol.descripcion }}</td>

              <td>
                <div
                  v-if="usuariosDeRol(rol.id).length"
                  class="lista-usuarios"
                >
                  <span
                    v-for="usuario in usuariosDeRol(rol.id)"
                    :key="usuario.id"
                    class="chip-usuario"
                    :title="usuario.correo"
                  >
                    {{ nombreCompleto(usuario) }}
                  </span>
                </div>
                <span v-else class="sin-usuarios">Sin usuarios</span>
              </td>

              <td>
                <div class="acciones-tabla">
                  <!-- AGREGAR USUARIO -->
                  <button
                    type="button"
                    class="btn-icono btn-agregar-usuario"
                    title="Agregar usuario"
                    aria-label="Agregar usuario al rol"
                    @click="abrirAgregarUsuario(rol)"
                  >
                    <UserPlus :size="18" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- MENSAJE CUANDO NO HAY ROLES -->
            <tr v-if="roles.length === 0">
              <td colspan="5" class="mensaje-vacio">
                <div class="estado-vacio">
                  <h4>No existen roles registrados</h4>
                  <p>Actualmente no hay roles dados de alta.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Explicación de los niveles de permiso utilizados -->
      <div class="permisos">
        <div>
          <strong>1</strong>
          <span>Desactivado</span>
        </div>

        <div>
          <strong>2</strong>
          <span>Lectura</span>
        </div>

        <div>
          <strong>3</strong>
          <span>Escritura</span>
        </div>
      </div>
    </div>

    <!-- ====================================================
         MODAL: AGREGAR USUARIO A UN ROL
         ==================================================== -->
    <div
      v-if="rolParaUsuario"
      class="fondo-modal"
      @click.self="cerrarAgregarUsuario"
    >
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-agregar-usuario"
      >
        <h3 id="titulo-agregar-usuario">Agregar usuario al rol</h3>

        <!-- Detalle del rol -->
        <div class="dato-modal">
          <span>Rol seleccionado</span>
          <strong>{{ rolParaUsuario.nombre }}</strong>
          <small>{{ rolParaUsuario.descripcion }}</small>
          <small>
            Usuarios asignados: {{ usuariosDeRol(rolParaUsuario.id).length }}
          </small>
        </div>

        <!-- Combo de usuarios -->
        <div class="campo">
          <label for="usuario-asignar">Usuario</label>
          <select id="usuario-asignar" v-model.number="usuarioSeleccionado">
            <option value="">Selecciona un usuario</option>
            <option
              v-for="usuario in usuarios"
              :key="usuario.id"
              :value="usuario.id"
              :disabled="usuario.rolId === rolParaUsuario.id"
            >
              {{ etiquetaUsuario(usuario, rolParaUsuario) }}
            </option>
          </select>
          <p v-if="errorUsuario" class="error-campo">{{ errorUsuario }}</p>
        </div>

        <div class="acciones-formulario">
          <button
            type="button"
            class="btn-cancelar"
            @click="cerrarAgregarUsuario"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="btn-guardar"
            @click="guardarUsuarioEnRol"
          >
            Agregar usuario
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

/* ETIQUETA DEL SISTEMA SELECCIONADO (DERECHA) */
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

.encabezado-tabla {
  margin-bottom: 25px;
}

.encabezado-tabla p {
  margin-bottom: 0;
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

/* TABLA */
.contenedor-tabla {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eeeeee;
  border-radius: 10px;
}

.tabla-roles {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: auto;
}

.tabla-roles th {
  padding: 15px;
  background: #F7F7F7;
  color: #222223;
  text-align: left;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 2px solid #eeeeee;
}

.tabla-roles td {
  padding: 10px 15px;
  color: #555555;
  border-bottom: 1px solid #eeeeee;
  vertical-align: middle;
}

.tabla-roles tbody tr:hover {
  background: #FAFAFA;
}

.celda-nombre {
  color: #222223;
  font-weight: 600;
  white-space: nowrap;
}

/* USUARIOS ASIGNADOS */
.lista-usuarios {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip-usuario {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  background: #FCE8E8;
  color: #B62A2D;
  font-size: 12px;
  font-weight: 600;
}

.sin-usuarios {
  color: #999999;
  font-size: 12px;
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

/* ACCIONES DE LA TABLA */
.acciones-tabla {
  display: flex;
  align-items: center;
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

.btn-agregar-usuario {
  color: #2563EB;
}

.btn-agregar-usuario:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
}

.acciones-tabla button:focus-visible {
  outline: 2px solid #B62A2D;
  outline-offset: 3px;
}

/* NIVELES DE PERMISO */
.permisos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 25px;
}

.permisos div {
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-radius: 8px;
  background: #f8eaea;
  text-align: center;
}

.permisos strong {
  color: #B62A2D;
  font-size: 20px;
}

.permisos span {
  margin-top: 4px;
  color: #222223;
  font-size: 13px;
}

/* FORMULARIO DEL MODAL */
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

.campo select:focus {
  border-color: #B62A2D;
}

.error-campo {
  margin: 0;
  color: #B62A2D;
  font-size: 13px;
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

  .permisos {
    grid-template-columns: 1fr;
  }
}
</style>
