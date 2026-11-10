<script setup lang="ts">
/*
  VISTA: HISTORIAS DE USUARIO

  Esta vista corresponde al módulo "Historias de Usuario" del Panel.
  Trabaja sobre el sistema seleccionado y permite:

  1. Consultar las historias (requerimientos) del sistema.
  2. Registrar o modificar una historia, indicando la persona que
     la proporcionó (se guarda el ID del usuario).
  3. Una vez guardada la historia, administrar sus criterios de
     aceptación (tabla detalle) con una ventana modal.

  Límites de captura:
  - Campos de texto: máximo 300 caracteres.
  - Áreas de texto: máximo 500 caracteres.
*/
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Eye, Pencil } from 'lucide-vue-next'
import { SistemaActivo } from '../router/index'
import { useAccesos } from '../composables/UseAccesos'
import { useSistemas } from '../composables/UseSistemas'
import type { Usuario } from '../interfaces/Usuario'
import type {
  HistoriaUsuario,
  CriterioAceptacion
} from '../interfaces/HistoriaUsuario'

const MAX_TEXTO = 300
const MAX_AREA = 500

const router = useRouter()

const { sistemaSeleccionadoGlobal, seleccionarSistema } = SistemaActivo()
const { aplicarSistemaPorDefecto } = useSistemas()

// Si entran directo a Historias, también se aplica el sistema por defecto.
aplicarSistemaPorDefecto(sistemaSeleccionadoGlobal.value, seleccionarSistema)

const { usuarios, usuariosDeSistema, nombreCompleto } = useAccesos()

function irASistemas() {
  router.push('/panel/sistemas')
}

// Control de vistas y mensajes
const mensaje = ref('')
const tipoMensaje = ref<'exito' | 'error'>('exito')
const mostrarFormulario = ref(false)
const idEnEdicion = ref<number | null>(null)
const fechaActualizacion = ref('')

function mostrarNotificacion(texto: string, tipo: 'exito' | 'error' = 'exito') {
  mensaje.value = texto
  tipoMensaje.value = tipo
}

// Listado de historias de usuario (datos de ejemplo)
const historias = ref<HistoriaUsuario[]>([
  {
    id: 1,
    sistemaId: 1,
    nombre: 'Autenticación de usuarios',
    descripcion: 'Permitir inicio de sesión mediante credenciales.',
    usuarioId: 2,
    prioridad: 'Alta',
    estatus: 'En desarrollo',
    fechaCaptura: '01/11/2026 08:30',
    fechaActualizacion: '01/11/2026 08:30',
    activo: true,
    criterios: [
      {
        id: 1,
        nombre: 'Inicio de sesión válido',
        descripcion: 'El usuario accede al panel al escribir credenciales correctas.'
      }
    ]
  },
  {
    id: 2,
    sistemaId: 1,
    nombre: 'Módulo de reportes',
    descripcion: 'Generar reporte en formato PDF de los registros.',
    usuarioId: 1,
    prioridad: 'Media',
    estatus: 'Planeación',
    fechaCaptura: '01/11/2026 09:15',
    fechaActualizacion: '01/11/2026 09:15',
    activo: true,
    criterios: []
  }
])

// Historias del sistema seleccionado.
const historiasDelSistema = computed(() =>
  sistemaSeleccionadoGlobal.value
    ? historias.value.filter(h => h.sistemaId === sistemaSeleccionadoGlobal.value!.id)
    : []
)

// Historia que se está modificando (o que se acaba de registrar).
const historiaEnEdicion = computed(() =>
  historias.value.find(h => h.id === idEnEdicion.value) ?? null
)

// Persona que proporcionó el requerimiento (se guarda solo su ID).
function personaDe(historia: HistoriaUsuario): Usuario | null {
  return usuarios.value.find(u => u.id === historia.usuarioId) ?? null
}

// En la tabla solo se muestra la fecha ("01/11/2026"), sin la hora.
function soloFecha(texto: string) {
  return texto.split(/[,\s]/)[0] ?? ''
}

function siguienteId(lista: { id: number }[]) {
  return lista.reduce((mayor, item) => Math.max(mayor, item.id), 0) + 1
}

// Datos del formulario de historias
const formulario = ref({
  nombre: '',
  descripcion: '',
  usuarioId: '' as number | '',
  prioridad: '' as '' | 'Alta' | 'Media' | 'Baja',
  estatus: '' as '' | 'Planeación' | 'En desarrollo' | 'En pruebas' | 'Finalizado'
})

/*
  Opciones del combo "Persona / Rol": usuarios activos del sistema.
  Si al modificar la persona asignada está desactivada, se conserva
  como opción para no perderla sin querer.
*/
const personasDisponibles = computed(() => {
  const sistema = sistemaSeleccionadoGlobal.value
  if (!sistema) return []

  const actual = formulario.value.usuarioId
  return usuariosDeSistema(sistema.id).filter(
    u => u.activo || u.id === actual
  )
})

function etiquetaPersona(usuario: Usuario) {
  return `${nombreCompleto(usuario)} / ${usuario.rol}`
}

function limpiarFormulario() {
  formulario.value = {
    nombre: '',
    descripcion: '',
    usuarioId: '',
    prioridad: '',
    estatus: ''
  }
}

function fechaActual() {
  return new Date().toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Abrir formulario para agregar
function agregarHistoria() {
  mensaje.value = ''
  limpiarFormulario()
  idEnEdicion.value = null
  fechaActualizacion.value = ''
  mostrarFormulario.value = true
}

// Cancelar el registro / volver al listado
function cancelarRegistro() {
  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = false
  mensaje.value = ''
}

/*
  Guardar o modificar historia.

  - Si es nueva: se guarda y el formulario se queda abierto para que
    aparezca la sección de criterios de aceptación.
  - Si ya existía: se guardan los cambios y se regresa al listado.
*/
function guardarHistoria() {
  const sistema = sistemaSeleccionadoGlobal.value
  if (!sistema) return

  const nombre = formulario.value.nombre.trim()
  const descripcion = formulario.value.descripcion.trim()
  const { usuarioId, prioridad, estatus } = formulario.value

  if (!nombre || !descripcion || usuarioId === '' || !prioridad || !estatus) {
    mostrarNotificacion('Por favor, completa todos los campos.', 'error')
    return
  }

  if (nombre.length > MAX_TEXTO || descripcion.length > MAX_AREA) {
    mostrarNotificacion(
      `El nombre admite máximo ${MAX_TEXTO} caracteres y la descripción ${MAX_AREA}.`,
      'error'
    )
    return
  }

  const fecha = fechaActual()
  const existente = historiaEnEdicion.value

  if (existente) {
    // Se conservan sus criterios de aceptación.
    Object.assign(existente, {
      nombre,
      descripcion,
      usuarioId,
      prioridad,
      estatus,
      fechaActualizacion: fecha
    })

    mostrarNotificacion('Historia de usuario modificada correctamente.')
    limpiarFormulario()
    idEnEdicion.value = null
    mostrarFormulario.value = false
    return
  }

  const nueva: HistoriaUsuario = {
    id: siguienteId(historias.value),
    sistemaId: sistema.id,
    nombre,
    descripcion,
    usuarioId,
    prioridad,
    estatus,
    fechaCaptura: fecha,
    fechaActualizacion: fecha,
    activo: true,
    criterios: []
  }

  historias.value.push(nueva)

  // Se queda en el formulario: ya puede capturar los criterios de aceptación.
  idEnEdicion.value = nueva.id
  fechaActualizacion.value = fecha
  mostrarNotificacion(
    'Historia de usuario registrada. Ahora puedes agregar sus criterios de aceptación.'
  )
}

function verDetalle(historia: HistoriaUsuario) {
  mostrarNotificacion(`Viendo detalles de: ${historia.nombre}`)
}

function modificarHistoria(historia: HistoriaUsuario) {
  mensaje.value = ''
  idEnEdicion.value = historia.id
  fechaActualizacion.value = historia.fechaActualizacion || ''

  formulario.value = {
    nombre: historia.nombre,
    descripcion: historia.descripcion,
    usuarioId: historia.usuarioId,
    prioridad: historia.prioridad,
    estatus: historia.estatus
  }

  mostrarFormulario.value = true
}

// Las historias no se eliminan: solo se desactivan (interruptor ON / OFF).
function cambiarEstadoHistoria(historia: HistoriaUsuario) {
  historia.activo = !historia.activo

  mostrarNotificacion(
    historia.activo
      ? `Historia "${historia.nombre}" activada.`
      : `Historia "${historia.nombre}" desactivada.`
  )
}

/*
  ==========================================================
  CRITERIOS DE ACEPTACIÓN (MODAL)
  ==========================================================
  El mismo formulario sirve para agregar uno nuevo o editar uno
  guardado. Solo tiene dos campos: nombre y descripción.
*/
const mostrarModalCriterio = ref(false)
const idCriterioEnEdicion = ref<number | null>(null)
const errorCriterio = ref('')

const formularioCriterio = ref({
  nombre: '',
  descripcion: ''
})

function abrirModalCriterio() {
  formularioCriterio.value = { nombre: '', descripcion: '' }
  idCriterioEnEdicion.value = null
  errorCriterio.value = ''
  mostrarModalCriterio.value = true
}

function editarCriterio(criterio: CriterioAceptacion) {
  formularioCriterio.value = {
    nombre: criterio.nombre,
    descripcion: criterio.descripcion
  }
  idCriterioEnEdicion.value = criterio.id
  errorCriterio.value = ''
  mostrarModalCriterio.value = true
}

function cerrarModalCriterio() {
  mostrarModalCriterio.value = false
  idCriterioEnEdicion.value = null
  errorCriterio.value = ''
}

// Guarda el criterio y cierra la modal.
function guardarCriterio() {
  const historia = historiaEnEdicion.value
  if (!historia) return

  const nombre = formularioCriterio.value.nombre.trim()
  const descripcion = formularioCriterio.value.descripcion.trim()

  if (!nombre || !descripcion) {
    errorCriterio.value = 'Completa el nombre y la descripción.'
    return
  }

  if (nombre.length > MAX_TEXTO || descripcion.length > MAX_AREA) {
    errorCriterio.value =
      `El nombre admite máximo ${MAX_TEXTO} caracteres y la descripción ${MAX_AREA}.`
    return
  }

  if (idCriterioEnEdicion.value !== null) {
    const criterio = historia.criterios.find(c => c.id === idCriterioEnEdicion.value)
    if (criterio) Object.assign(criterio, { nombre, descripcion })
    mostrarNotificacion('Criterio de aceptación modificado correctamente.')
  } else {
    historia.criterios.push({
      id: siguienteId(historia.criterios),
      nombre,
      descripcion
    })
    mostrarNotificacion('Criterio de aceptación agregado correctamente.')
  }

  cerrarModalCriterio()
}
</script>

<template>
  <!-- Contenedor principal del módulo -->
  <section class="modulo">

    <!-- Encabezado del módulo -->
    <header class="encabezado-modulo">
      <div class="encabezado-titulo">
        <div>
          <p class="etiqueta">
            MÓDULO SELECCIONADO
          </p>
          <h2>
            <BookOpen :size="28" style="vertical-align: middle; margin-right: 6px;" />
            Historias de Usuario
          </h2>
        </div>
      </div>

      <p class="descripcion">
        Administración de las historias de usuario del proyecto.
      </p>

      <!-- Etiqueta de ancho total con títulos en negritas y centrada -->
      <div v-if="sistemaSeleccionadoGlobal" style="margin-top: 8px;">
        <span style="display: block; width: 100%; background-color: #FFCDD2; color: #000000; padding: 10px 14px; border-radius: 6px; font-size: 1.1rem; font-weight: normal; text-align: center; box-sizing: border-box;">
          <strong>Sistema seleccionado:</strong> {{ sistemaSeleccionadoGlobal.nombre }} — <strong>Metodología:</strong> {{ sistemaSeleccionadoGlobal.metodologia }}
        </span>
      </div>
    </header>

    <!-- Tarjeta principal -->
    <div class="tarjeta">

      <!-- ==================================================
           SIN SISTEMA SELECCIONADO
           ================================================== -->
      <div v-if="!sistemaSeleccionadoGlobal" class="estado-vacio sin-sistema">
        <h4>Selecciona un sistema para ver sus historias de usuario</h4>
        <p>
          Las historias y las personas encargadas dependen del sistema.
        </p>
        <button type="button" class="btn-agregar" @click="irASistemas">
          Ir a Sistemas
        </button>
      </div>

      <!-- ==================================================
           VISTA 1: LISTADO DE HISTORIAS DE USUARIO
           ================================================== -->
      <div v-else-if="!mostrarFormulario">

        <div class="encabezado-tabla">
          <div>
            <h3>Listado de historias de usuario</h3>
            <p>
              Consulta y administra las historias asociadas al sistema
            </p>
          </div>

          <!-- BOTÓN AGREGAR HISTORIA -->
          <button
            type="button"
            class="btn-agregar"
            @click="agregarHistoria"
          >
            + Agregar historia
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

        <!-- TABLA (solo la información más importante) -->
        <div class="contenedor-tabla">
          <table class="tabla-sistemas">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nombre del requerimiento</th>
                <th>Fecha de captura</th>
                <th>Quién lo capturó</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(historia, indice) in historiasDelSistema"
                :key="historia.id"
                :class="{ 'fila-inactiva': !historia.activo }"
              >
                <td>{{ indice + 1 }}</td>
                <td>
                  <strong>{{ historia.nombre }}</strong>
                  <span v-if="!historia.activo" class="chip-inactivo">Inactivo</span>
                </td>

                <!-- Fecha en que se capturó el requerimiento -->
                <td>{{ soloFecha(historia.fechaCaptura) }}</td>

                <!-- Quién lo proporcionó: nombre y, debajo, rol y correo en letra pequeña -->
                <td>
                  <template v-if="personaDe(historia)">
                    <div class="persona-nombre">
                      {{ nombreCompleto(personaDe(historia)!) }}
                    </div>
                    <small class="persona-detalle">
                      {{ personaDe(historia)!.rol }} · {{ personaDe(historia)!.correo }}
                    </small>
                  </template>
                  <span v-else class="sin-asignar">—</span>
                </td>

                <td>
                  <div class="acciones-tabla">
                    <button
                      type="button"
                      class="btn-icono btn-ver"
                      title="Ver detalles"
                      @click="verDetalle(historia)"
                    >
                      <Eye :size="18" />
                    </button>
                    <button
                      type="button"
                      class="btn-icono btn-editar"
                      title="Modificar"
                      @click="modificarHistoria(historia)"
                    >
                      <Pencil :size="18" />
                    </button>
                    <!-- ACTIVAR / DESACTIVAR (interruptor ON / OFF) -->
                    <button
                      type="button"
                      class="switch"
                      :class="{ activo: historia.activo }"
                      role="switch"
                      :aria-checked="historia.activo"
                      :aria-label="historia.activo ? 'Desactivar historia' : 'Activar historia'"
                      :title="historia.activo ? 'Desactivar historia' : 'Activar historia'"
                      @click="cambiarEstadoHistoria(historia)"
                    ></button>
                  </div>
                </td>
              </tr>

              <tr v-if="historiasDelSistema.length === 0">
                <td colspan="5" class="mensaje-vacio">
                  <div class="estado-vacio">
                    <h4>No existen historias de usuario registradas</h4>
                    <p>Presiona "+ Agregar historia" para registrar una nueva.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- ==================================================
           VISTA 2: FORMULARIO DE REGISTRO / EDICIÓN
           ================================================== -->
      <div v-else>
        <div class="encabezado-formulario">
          <h3>
            {{ idEnEdicion !== null ? 'Modificar historia de usuario' : 'Registrar nueva historia de usuario' }}
          </h3>
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

        <form @submit.prevent="guardarHistoria">

          <!-- Fecha de actualización (Solo al editar) -->
          <div class="campo" v-if="idEnEdicion !== null">
            <label for="fechaActualizacion">Fecha de actualización:</label>
            <input
              id="fechaActualizacion"
              type="text"
              :value="fechaActualizacion"
              readonly
              class="solo-lectura"
            />
          </div>

          <!-- Nombre del requerimiento (texto, máx. 300) -->
          <div class="campo">
            <label for="nombreHistoria">Nombre del requerimiento</label>
            <input
              id="nombreHistoria"
              v-model="formulario.nombre"
              type="text"
              :maxlength="MAX_TEXTO"
              placeholder="Escribe el nombre de la historia"
              required
            />
            <small class="contador" :class="{ limite: formulario.nombre.length >= MAX_TEXTO }">
              {{ formulario.nombre.length }}/{{ MAX_TEXTO }}
            </small>
          </div>

          <!-- Descripción (área de texto, máx. 500) -->
          <div class="campo">
            <label for="descripcionHistoria">Descripción</label>
            <textarea
              id="descripcionHistoria"
              v-model="formulario.descripcion"
              :maxlength="MAX_AREA"
              placeholder="Describe detalladamente la historia de usuario"
              rows="4"
              required
            ></textarea>
            <small class="contador" :class="{ limite: formulario.descripcion.length >= MAX_AREA }">
              {{ formulario.descripcion.length }}/{{ MAX_AREA }}
            </small>
          </div>

          <div class="fila-campos">
            <!-- Quién proporcionó el requerimiento: Rol / Persona (se guarda el ID) -->
            <div class="campo">
              <label for="personaEncargada">Quién proporcionó el requerimiento (Persona / Rol)</label>
              <select
                id="personaEncargada"
                v-model.number="formulario.usuarioId"
                required
              >
                <option value="">Selecciona una persona</option>
                <option
                  v-for="usuario in personasDisponibles"
                  :key="usuario.id"
                  :value="usuario.id"
                >
                  {{ etiquetaPersona(usuario) }}
                </option>
              </select>
              <small
                v-if="personasDisponibles.length === 0"
                class="error-campo"
              >
                Este sistema no tiene usuarios activos. Regístralos primero en el módulo Usuarios.
              </small>
            </div>

            <!-- Prioridad -->
            <div class="campo">
              <label for="prioridadHistoria">Prioridad</label>
              <select
                id="prioridadHistoria"
                v-model="formulario.prioridad"
                required
              >
                <option value="">Selecciona una prioridad</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <!-- Estatus -->
          <div class="campo">
            <label for="estatusHistoria">Status del sistema</label>
            <select
              id="estatusHistoria"
              v-model="formulario.estatus"
              required
            >
              <option value="">Selecciona un estatus</option>
              <option value="Planeación">Planeación</option>
              <option value="En desarrollo">En desarrollo</option>
              <option value="En pruebas">En pruebas</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <!-- ================================================
               CRITERIOS DE ACEPTACIÓN (tabla detalle)
               Solo aparece cuando la historia ya fue guardada.
               ================================================ -->
          <div v-if="historiaEnEdicion" class="seccion-criterios">

            <div class="encabezado-tabla">
              <div>
                <h4>Criterios de aceptación</h4>
                <p class="nota">
                  Los criterios se guardan al instante, sin cerrar este formulario.
                </p>
              </div>

              <button
                type="button"
                class="btn-agregar"
                @click="abrirModalCriterio"
              >
                + Agregar criterio
              </button>
            </div>

            <div class="contenedor-tabla">
              <table class="tabla-sistemas">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Nombre del criterio</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(criterio, indice) in historiaEnEdicion.criterios"
                    :key="criterio.id"
                  >
                    <td>{{ indice + 1 }}</td>
                    <td><strong>{{ criterio.nombre }}</strong></td>
                    <td>{{ criterio.descripcion }}</td>
                    <td>
                      <div class="acciones-tabla">
                        <button
                          type="button"
                          class="btn-icono btn-editar"
                          title="Modificar criterio"
                          aria-label="Modificar criterio"
                          @click="editarCriterio(criterio)"
                        >
                          <Pencil :size="18" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="historiaEnEdicion.criterios.length === 0">
                    <td colspan="4" class="mensaje-vacio">
                      <div class="estado-vacio">
                        <h4>Esta historia aún no tiene criterios de aceptación</h4>
                        <p>Presiona "+ Agregar criterio" para registrar el primero.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Botones de acción del formulario -->
          <div class="acciones-formulario">
            <button
              type="button"
              class="btn-cancelar"
              @click="cancelarRegistro"
            >
              {{ idEnEdicion !== null ? 'Volver al listado' : 'Cancelar' }}
            </button>
            <button
              type="submit"
              class="btn-guardar"
            >
              {{ idEnEdicion !== null ? 'Guardar cambios' : 'Guardar historia' }}
            </button>
          </div>

        </form>
      </div>

    </div>

    <!-- ====================================================
         MODAL: CRITERIO DE ACEPTACIÓN (nuevo / editar)
         ==================================================== -->
    <div
      v-if="mostrarModalCriterio"
      class="fondo-modal"
      @click.self="cerrarModalCriterio"
    >
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-criterio"
      >
        <h3 id="titulo-criterio">
          {{ idCriterioEnEdicion !== null ? 'Modificar criterio de aceptación' : 'Nuevo criterio de aceptación' }}
        </h3>

        <form @submit.prevent="guardarCriterio">

          <!-- Nombre (texto, máx. 300) -->
          <div class="campo">
            <label for="nombreCriterio">Nombre</label>
            <input
              id="nombreCriterio"
              v-model="formularioCriterio.nombre"
              type="text"
              :maxlength="MAX_TEXTO"
              placeholder="Nombre del criterio"
              required
            />
            <small class="contador" :class="{ limite: formularioCriterio.nombre.length >= MAX_TEXTO }">
              {{ formularioCriterio.nombre.length }}/{{ MAX_TEXTO }}
            </small>
          </div>

          <!-- Descripción (área de texto, máx. 500) -->
          <div class="campo">
            <label for="descripcionCriterio">Descripción</label>
            <textarea
              id="descripcionCriterio"
              v-model="formularioCriterio.descripcion"
              :maxlength="MAX_AREA"
              placeholder="Describe el criterio de aceptación"
              rows="4"
              required
            ></textarea>
            <small class="contador" :class="{ limite: formularioCriterio.descripcion.length >= MAX_AREA }">
              {{ formularioCriterio.descripcion.length }}/{{ MAX_AREA }}
            </small>
          </div>

          <p v-if="errorCriterio" class="error-campo">{{ errorCriterio }}</p>

          <div class="acciones-formulario">
            <button
              type="button"
              class="btn-cancelar"
              @click="cerrarModalCriterio"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-guardar">
              Guardar
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

.encabezado-modulo {
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

.descripcion {
  margin-top: 8px;
  color: #777777;
  font-size: 15px;
}

.tarjeta {
  padding: 30px;
  border: 1px solid #eeeeee;
  border-radius: 12px;
  background-color: #FEFEFE;
  box-shadow: 0 5px 18px rgba(34, 34, 35, 0.06);
}

.tarjeta h3 {
  margin-top: 0;
  color: #222223;
  font-size: 20px;
}

.tarjeta p {
  margin-bottom: 0;
  color: #666666;
  line-height: 1.6;
}

.encabezado-tabla {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.btn-agregar {
  background-color: #B62A2D;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-agregar:hover {
  background-color: #922124;
}

/* MENSAJES */
.mensaje {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 15px;
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

.contenedor-tabla {
  overflow-x: auto;
}

.tabla-sistemas {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.tabla-sistemas th,
.tabla-sistemas td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.tabla-sistemas th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #333;
}

/* Quién lo capturó: nombre y, debajo, rol y correo en letra pequeña */
.persona-nombre {
  color: #333333;
}

.persona-detalle {
  display: block;
  margin-top: 2px;
  color: #888888;
  font-size: 11px;
}

.sin-asignar {
  color: #999999;
}

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

.btn-ver {
  color: #2563EB;
}

.btn-ver:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
}

.btn-editar {
  color: #B7791F;
}

.btn-editar:hover {
  background: #FFFBEB;
  border-color: #FDE68A;
}

.acciones-tabla button:focus-visible {
  outline: 2px solid #B62A2D;
  outline-offset: 3px;
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

/* Historia desactivada */
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

.mensaje-vacio {
  text-align: center;
  padding: 30px;
}

.estado-vacio {
  padding: 20px 15px;
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

.estado-vacio.sin-sistema {
  padding: 35px 15px;
}

.estado-vacio.sin-sistema .btn-agregar {
  margin-top: 15px;
}

/* FORMULARIO */
.encabezado-formulario {
  margin-bottom: 20px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 15px;
  min-width: 0;
}

.campo label {
  color: #222223;
  font-size: 14px;
  font-weight: 600;
}

.campo input,
.campo select,
.campo textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #FFFFFF;
  color: #222223;
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
}

.campo textarea {
  resize: vertical;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus {
  border-color: #B62A2D;
}

.campo input.solo-lectura {
  background-color: #f1f5f9;
}

.contador {
  align-self: flex-end;
  color: #888888;
  font-size: 11px;
}

.contador.limite {
  color: #B62A2D;
  font-weight: 600;
}

.error-campo {
  margin: 0;
  color: #B62A2D;
  font-size: 13px;
}

.fila-campos {
  display: flex;
  gap: 15px;
}

.fila-campos .campo {
  flex: 1;
}

/* Sección de criterios de aceptación */
.seccion-criterios {
  margin: 25px 0 20px;
  padding-top: 20px;
  border-top: 1px solid #EEEEEE;
}

.seccion-criterios h4 {
  margin: 0;
  color: #B62A2D;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.seccion-criterios .nota {
  margin: 4px 0 0;
  color: #777777;
  font-size: 12px;
}

/* Botones del formulario */
.acciones-formulario {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancelar {
  padding: 8px 16px;
  background-color: #e2e8f0;
  color: #333333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancelar:hover {
  background-color: #cbd5e1;
}

.btn-guardar {
  padding: 8px 16px;
  background-color: #B62A2D;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-guardar:hover {
  background-color: #922124;
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
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
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

@media (max-width: 768px) {
  .fila-campos {
    flex-direction: column;
    gap: 0;
  }

  .encabezado-tabla {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 500px) {
  .encabezado-titulo {
    flex-direction: column;
    align-items: flex-start;
  }

  h2 {
    font-size: 23px;
  }

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
</style>
