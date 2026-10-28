
<script setup lang="ts">
/*
==========================================================
MÓDULO DE USUARIOS
==========================================================

Esta vista permite:
1. Consultar los usuarios del sistema seleccionado.
2. Registrar usuarios nuevos.
3. Editar usuarios existentes.
4. Activar o desactivar usuarios.
5. Asignar roles según la metodología del sistema.

El correo electrónico es el nombre de usuario.
*/

import { computed, ref, watch } from 'vue'
import { Users, Pencil } from 'lucide-vue-next'
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
SISTEMA Y METODOLOGÍA SELECCIONADOS
==========================================================
*/

const metodologiaSeleccionada = computed(() => {
  const sistema = sistemaSeleccionadoGlobal.value as
    | (Record<string, unknown> & { nombre?: string })
    | null

  if (!sistema) return ''

  return String(
    sistema.metodologia ??
    sistema.nombreMetodologia ??
    ''
  ).trim()
})

/*
==========================================================
ROLES PREDEFINIDOS POR METODOLOGÍA
==========================================================

Los roles deben existir también en el catálogo de
useAccesos.ts para poder guardar su rolId.

No se inventan IDs aquí; se usan los del catálogo.
*/

const rolesPorMetodologia: Record<string, string[]> = {
  scrum: [
    'Scrum Master',
    'Product Owner',
    'Developer',
    'Developers',
    'Desarrollador',
    'Equipo de desarrollo'
  ],
  xp: [
    'Coach',
    'Programador',
    'Programmer',
    'Cliente',
    'Customer',
    'Tester',
    'Tracker',
    'Manager',
    'Consultor',
    'Big Boss'
  ],
  crystal: [
    'Patrocinador',
    'Sponsor',
    'Usuario experto',
    'Expert User',
    'Diseñador principal',
    'Lead Designer',
    'Diseñador programador',
    'Designer Programmer',
    'Coordinador',
    'Tester'
  ]
}

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const rolesDisponibles = computed(() => {
  const metodologia = normalizarTexto(
    metodologiaSeleccionada.value
  )

  const clave = metodologia.startsWith('scrum')
    ? 'scrum'
    : metodologia === 'xp' ||
        metodologia.includes('extreme programming')
      ? 'xp'
      : metodologia.startsWith('crystal')
        ? 'crystal'
        : ''

  if (!clave) return []

  const nombresPermitidos = rolesPorMetodologia[clave] ?? []

  return roles.value.filter((rol) =>
    nombresPermitidos.some(
      (nombre) =>
        normalizarTexto(nombre) ===
        normalizarTexto(rol.nombre)
    )
  )
})

/*
==========================================================
USUARIOS DEL SISTEMA
==========================================================

Si los usuarios incluyen sistemaId, se filtran
por el sistema seleccionado.

Si el composable todavía no tiene esa propiedad,
se muestran los usuarios existentes.
*/

const usuariosDelSistema = computed(() => {
  if (!sistemaSeleccionadoGlobal.value) return []

  const sistema = sistemaSeleccionadoGlobal.value as
    Record<string, unknown>

  const sistemaId = sistema.id

  if (sistemaId === undefined || sistemaId === null) {
    return usuarios.value
  }

  return usuarios.value.filter((usuario) => {
    const registro = usuario as Usuario & {
      sistemaId?: number | string
    }

    if (registro.sistemaId === undefined) {
      return true
    }

    return String(registro.sistemaId) === String(sistemaId)
  })
})

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
FORMULARIO DE REGISTRO Y EDICIÓN
==========================================================

false = tabla de usuarios
true = formulario

Si usuarioEditando tiene valor, el formulario edita.
Si es null, registra un usuario nuevo.
*/

const mostrarFormulario = ref(false)
const usuarioEditando = ref<Usuario | null>(null)

const formulario = ref({
  correo: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  rolId: '' as number | '',
  activo: true
})

function limpiarFormulario() {
  formulario.value = {
    correo: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rolId: '',
    activo: true
  }

  usuarioEditando.value = null
}

function abrirFormulario() {
  if (!sistemaSeleccionadoGlobal.value) {
    mostrarNotificacion(
      'Primero selecciona un sistema.',
      'error'
    )
    return
  }

  mensaje.value = ''
  limpiarFormulario()
  mostrarFormulario.value = true
}

/*
==========================================================
EDITAR USUARIO
==========================================================
*/

function editarUsuario(usuario: Usuario) {
  mensaje.value = ''
  usuarioEditando.value = usuario

  formulario.value = {
    correo: usuario.correo,
    nombre: usuario.nombre,
    apellidoPaterno: usuario.apellidoPaterno,
    apellidoMaterno: usuario.apellidoMaterno ?? '',
    rolId: usuario.rolId ?? '',
    activo: usuario.activo
  }

  mostrarFormulario.value = true
}

/*
==========================================================
CANCELAR
==========================================================
*/

function cancelarRegistro() {
  limpiarFormulario()
  mostrarFormulario.value = false
  mensaje.value = ''
}

/*
==========================================================
GUARDAR USUARIO
==========================================================
*/

function guardarUsuario() {
  const correo = formulario.value.correo.trim().toLowerCase()
  const nombre = formulario.value.nombre.trim()
  const apellidoPaterno =
    formulario.value.apellidoPaterno.trim()
  const apellidoMaterno =
    formulario.value.apellidoMaterno.trim()

  const rolId = formulario.value.rolId
  const activo = formulario.value.activo

  if (!sistemaSeleccionadoGlobal.value) {
    mostrarNotificacion(
      'Selecciona un sistema antes de guardar.',
      'error'
    )
    return
  }

  if (!correo || !nombre || !apellidoPaterno) {
    mostrarNotificacion(
      'Por favor, completa todos los campos obligatorios.',
      'error'
    )
    return
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    correo
  )

  if (!correoValido) {
    mostrarNotificacion(
      'Escribe un correo electrónico válido.',
      'error'
    )
    return
  }

  if (rolId === '') {
    mostrarNotificacion(
      'Selecciona un rol para el usuario.',
      'error'
    )
    return
  }

  const rolValido = rolesDisponibles.value.some(
    (rol) => rol.id === rolId
  )

  if (!rolValido) {
    mostrarNotificacion(
      'El rol seleccionado no corresponde a la metodología del sistema.',
      'error'
    )
    return
  }

  /*
  ========================================================
  MODO EDICIÓN
  ========================================================
  */

  if (usuarioEditando.value) {
    const usuario = usuarioEditando.value

    const correoModificado =
      normalizarTexto(usuario.correo) !==
      normalizarTexto(correo)

    if (correoModificado && correoExiste(correo)) {
      mostrarNotificacion(
        'Ya existe otro usuario con ese correo electrónico.',
        'error'
      )
      return
    }

    // Actualizar datos existentes.
    usuario.correo = correo
    usuario.nombre = nombre
    usuario.apellidoPaterno = apellidoPaterno
    usuario.apellidoMaterno = apellidoMaterno

    // Actualizar rol.
    if (usuario.rolId !== rolId) {
      asignarRol(usuario.id, rolId)
    }

    // Actualizar estado.
    if (usuario.activo !== activo) {
      alternarActivo(usuario.id)
    }

    limpiarFormulario()
    mostrarFormulario.value = false

    mostrarNotificacion(
      'Usuario actualizado correctamente.'
    )

    return
  }

  /*
  ========================================================
  MODO REGISTRO
  ========================================================
  */

  if (correoExiste(correo)) {
    mostrarNotificacion(
      'Ya existe un usuario con ese correo electrónico.',
      'error'
    )
    return
  }

  agregarUsuario({
    correo,
    nombre,
    apellidoPaterno,
    apellidoMaterno
  })

  // Buscar usuario recién agregado.
  const nuevoUsuario = usuarios.value.find(
    (usuario) =>
      usuario.correo.trim().toLowerCase() === correo
  )

  if (nuevoUsuario) {
    asignarRol(nuevoUsuario.id, rolId)

    if (nuevoUsuario.activo !== activo) {
      alternarActivo(nuevoUsuario.id)
    }
  }

  limpiarFormulario()
  mostrarFormulario.value = false

  mostrarNotificacion(
    'Usuario registrado correctamente.'
  )
}

/*
==========================================================
ACTIVAR / DESACTIVAR
==========================================================

Esta función es utilizada por la palanquita.
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
CAMBIO DE SISTEMA
==========================================================
*/

watch(sistemaSeleccionadoGlobal, () => {
  limpiarFormulario()
  mostrarFormulario.value = false
  mensaje.value = ''
})
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

        <!-- SISTEMA SELECCIONADO -->
        <div
          v-if="sistemaSeleccionadoGlobal"
          class="badge-sistema"
        >
          <span class="punto-activo">●</span>
          <span class="texto-sistema">
            {{ sistemaSeleccionadoGlobal.nombre }}
          </span>
        </div>

        <div
          v-else
          class="badge-sistema sin-seleccion"
        >
          <span>Sin sistema seleccionado</span>
        </div>
      </div>

      <p>Administración de los usuarios del sistema.</p>
    </header>

    <div class="tarjeta">

      <!-- ============================================
           VISTA 1: LISTADO DE USUARIOS
           ============================================ -->

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
            :disabled="!sistemaSeleccionadoGlobal"
            @click="abrirFormulario"
          >
            + Agregar usuario
          </button>
        </div>

        <!-- MENSAJES -->
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

        <!-- SIN SISTEMA -->
        <div
          v-if="!sistemaSeleccionadoGlobal"
          class="estado-vacio"
        >
          <h4>Selecciona un sistema</h4>
          <p>
            Primero selecciona un sistema en el módulo
            Sistemas para administrar sus usuarios.
          </p>
        </div>

        <!-- TABLA -->
        <div v-else class="contenedor-tabla">
          <table class="tabla-usuarios">

            <thead>
              <tr>
                <th>Nombre de usuario</th>
                <th>Nombre completo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="usuario in usuariosDelSistema"
                :key="usuario.id"
              >
                <!-- CORREO -->
                <td>
                  {{ usuario.correo }}
                </td>

                <!-- NOMBRE COMPLETO -->
                <td>
                  {{ nombreCompleto(usuario) }}
                </td>

                <!-- ROL -->
                <td>
                  <span
                    class="rol-etiqueta"
                    :class="{
                      'sin-rol': usuario.rolId === null
                    }"
                  >
                    {{ nombreRol(usuario.rolId) }}
                  </span>
                </td>

                <!-- ==================================
                     ACCIONES CORREGIDAS
                     ================================== -->
                <td>
                  <div class="acciones-tabla">

                    <!-- BOTÓN EDITAR -->
                    <button
                      type="button"
                      class="btn-icono btn-editar"
                      title="Editar usuario"
                      aria-label="Editar usuario"
                      @click="editarUsuario(usuario)"
                    >
                      <Pencil :size="17" />
                      <span>Editar</span>
                    </button>

                    <!-- INTERRUPTOR ACTIVAR / DESACTIVAR -->
                    <div class="control-estado">

                      <button
                        type="button"
                        class="switch"
                        :class="{ activo: usuario.activo }"
                        role="switch"
                        :aria-checked="usuario.activo"
                        :aria-label="
                          usuario.activo
                            ? 'Desactivar usuario'
                            : 'Activar usuario'
                        "
                        :title="
                          usuario.activo
                            ? 'Desactivar usuario'
                            : 'Activar usuario'
                        "
                        @click="cambiarEstado(usuario)"
                      >
                        <span class="switch-circulo"></span>
                      </button>

                      <span
                        :class="
                          usuario.activo
                            ? 'texto-activo'
                            : 'texto-inactivo'
                        "
                      >
                        {{
                          usuario.activo
                            ? 'Activo'
                            : 'Inactivo'
                        }}
                      </span>

                    </div>
                    <!-- FIN DEL INTERRUPTOR -->

                  </div>
                  <!-- FIN DE ACCIONES -->
                </td>

              </tr>
              <!-- CIERRE CORRECTO DE LA FILA -->

              <!-- SIN USUARIOS -->
              <tr v-if="usuariosDelSistema.length === 0">
                <td colspan="4" class="mensaje-vacio">
                  <div class="estado-vacio">
                    <h4>No existen usuarios registrados</h4>

                    <p>
                      Actualmente no hay usuarios dados de alta.
                    </p>

                    <p>
                      Presiona "Agregar usuario" para registrar
                      uno nuevo.
                    </p>
                  </div>
                </td>
              </tr>

            </tbody>

          </table>
        </div>
      </div>

      <!-- ============================================
           VISTA 2: AGREGAR / EDITAR USUARIO
           ============================================ -->

      <div v-else>

        <div class="encabezado-formulario">
          <h3>
            {{
              usuarioEditando
                ? 'Editar usuario'
                : 'Registrar nuevo usuario'
            }}
          </h3>

          <p>
            {{
              usuarioEditando
                ? 'Modifica los datos del usuario seleccionado.'
                : 'Completa los datos para registrar un usuario.'
            }}
          </p>
        </div>

        <!-- MENSAJES -->
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

          <h4 class="subtitulo-seccion">
            DATOS DEL USUARIO
          </h4>

          <hr class="divisor-seccion" />

          <!-- CORREO Y NOMBRE -->
          <div class="fila-campos">

            <div class="campo">
              <label for="correo">
                Correo electrónico (nombre de usuario)
              </label>

              <input
                id="correo"
                v-model="formulario.correo"
                type="email"
                placeholder="ejemplo@dominio.com"
                required
              />
            </div>

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

          <!-- APELLIDOS -->
          <div class="fila-campos">

            <div class="campo">
              <label for="apellidoPaterno">
                Apellido paterno
              </label>

              <input
                id="apellidoPaterno"
                v-model="formulario.apellidoPaterno"
                type="text"
                placeholder="Primer apellido"
                required
              />
            </div>

            <div class="campo">
              <label for="apellidoMaterno">
                Apellido materno
              </label>

              <input
                id="apellidoMaterno"
                v-model="formulario.apellidoMaterno"
                type="text"
                placeholder="Segundo apellido (opcional)"
              />
            </div>

          </div>

          <!-- ROL Y ESTADO -->
          <h4 class="subtitulo-seccion">
            ROL Y ESTADO
          </h4>

          <hr class="divisor-seccion" />

          <div class="fila-campos">

            <!-- ROL -->
            <div class="campo">
              <label for="rol">
                Rol
              </label>

              <select
                id="rol"
                v-model.number="formulario.rolId"
                required
              >
                <option value="">
                  Selecciona un rol
                </option>

                <option
                  v-for="rol in rolesDisponibles"
                  :key="rol.id"
                  :value="rol.id"
                >
                  {{ rol.nombre }}
                </option>
              </select>

              <p class="ayuda-campo">
                Metodología del sistema:
                <strong>
                  {{ metodologiaSeleccionada || 'No definida' }}
                </strong>
              </p>

              <p
                v-if="rolesDisponibles.length === 0"
                class="error-campo"
              >
                No hay roles configurados para esta
                metodología en el catálogo de roles.
              </p>
            </div>

            <!-- ACTIVO -->
            <div class="campo">
              <label>Estado del usuario</label>

              <label class="checkbox-activo">
                <input
                  v-model="formulario.activo"
                  type="checkbox"
                />

                <span>Activo</span>
              </label>

              <p class="ayuda-campo">
                Los usuarios nuevos se registran
                activos por defecto.
              </p>
            </div>

          </div>

          <!-- BOTONES -->
          <div class="acciones-formulario">

            <button
              type="button"
              class="btn-cancelar"
              @click="cancelarRegistro"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn-guardar"
              :disabled="rolesDisponibles.length === 0"
            >
              {{
                usuarioEditando
                  ? 'Guardar cambios'
                  : 'Guardar usuario'
              }}
            </button>

          </div>

        </form>
      </div>

    </div>
  </section>
</template>

<style scoped>
/*
==========================================================
ESTILOS GENERALES
==========================================================
*/

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

/*
==========================================================
SISTEMA SELECCIONADO
==========================================================
*/

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

/*
==========================================================
TARJETA
==========================================================
*/

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

/*
==========================================================
MENSAJES
==========================================================
*/

.mensaje {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
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

/*
==========================================================
ENCABEZADO DE TABLA
==========================================================
*/

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

.btn-agregar:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
}

/*
==========================================================
TABLA
==========================================================
*/

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
  padding: 12px 15px;
  color: #555555;
  border-bottom: 1px solid #eeeeee;
  vertical-align: middle;
}

.tabla-usuarios tbody tr:hover {
  background: #FAFAFA;
}

/*
==========================================================
ESTADO VACÍO
==========================================================
*/

.mensaje-vacio {
  text-align: center;
}

.estado-vacio {
  padding: 35px 15px;
  text-align: center;
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

/*
==========================================================
ETIQUETA DE ROL
==========================================================
*/

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

/*
==========================================================
ACCIONES DE TABLA
==========================================================
*/

.acciones-tabla {
  display: flex;
  align-items: center;
  gap: 15px;
  white-space: nowrap;
}

.btn-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  background: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
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

.btn-editar {
  color: #2563EB;
}

.btn-editar:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
}

.acciones-tabla button:focus-visible {
  outline: 2px solid #B62A2D;
  outline-offset: 3px;
}

/*
==========================================================
INTERRUPTOR ACTIVAR / DESACTIVAR
==========================================================
*/

.control-estado {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Base del interruptor */
.switch {
  position: relative;
  width: 48px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 30px;
  background-color: #BDBDBD;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

/* Interruptor encendido */
.switch.activo {
  background-color: #28A745;
}

/* Círculo blanco */
.switch-circulo {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background-color: #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

/* Mover círculo a la derecha */
.switch.activo .switch-circulo {
  transform: translateX(22px);
}

/* Texto de estado activo */
.texto-activo {
  color: #28A745;
  font-size: 12px;
  font-weight: 600;
}

/* Texto de estado inactivo */
.texto-inactivo {
  color: #888888;
  font-size: 12px;
  font-weight: 600;
}

/*
==========================================================
FORMULARIO
==========================================================
*/

.encabezado-formulario {
  margin-bottom: 25px;
}

.subtitulo-seccion {
  margin: 25px 0 8px;
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

.campo > label {
  color: #222223;
  font-size: 14px;
  font-weight: 600;
}

.campo input:not([type="checkbox"]),
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

.fila-campos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.ayuda-campo {
  margin: 0;
  font-size: 12px;
  color: #777777;
}

.error-campo {
  margin: 0;
  color: #B62A2D !important;
  font-size: 13px;
}

/*
==========================================================
CHECKBOX ACTIVO DEL FORMULARIO
==========================================================
*/

.checkbox-activo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  background: #FAFAFA;
  cursor: pointer;
}

.checkbox-activo input {
  width: 18px;
  height: 18px;
  accent-color: #B62A2D;
  cursor: pointer;
}

.checkbox-activo span {
  font-size: 14px;
  font-weight: 600;
  color: #222223;
}

/*
==========================================================
BOTONES DEL FORMULARIO
==========================================================
*/

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

.btn-guardar:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
}

/*
==========================================================
RESPONSIVO
==========================================================
*/

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

  .acciones-tabla {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
