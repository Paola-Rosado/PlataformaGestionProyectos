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
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Eye, Pencil } from 'lucide-vue-next'
import { SistemaActivo } from '../router/index'
import { useAccesos } from '../composables/UseAccesos'
import { useSistemas } from '../composables/UseSistemas'
import type { Usuario } from '../interfaces/Usuario'
import { useHistorias } from '../composables/UseHistorias'
import {
  ESTATUS_AVANCE,
  MAX_TEXTO,
  MAX_AREA,
  siguienteId,
  siguienteNumero,
  limpiarLinea,
  limpiarParrafo,
  evaluarEstatus,
  estatusTrasCriterios,
  reabriria,
  validarHistoria,
  validarCriterio
} from '../composables/ReglasHistorias'
import type {
  HistoriaUsuario,
  CriterioAceptacion,
  EstatusAvance
} from '../interfaces/HistoriaUsuario'

const router = useRouter()

const { sistemaSeleccionadoGlobal, seleccionarSistema } = SistemaActivo()
const { aplicarSistemaPorDefecto } = useSistemas()

// Si entran directo a Historias, también se aplica el sistema por defecto.
aplicarSistemaPorDefecto(sistemaSeleccionadoGlobal.value, seleccionarSistema)

const { usuarios, usuariosDeSistema, nombreCompleto } = useAccesos()

// Control de permisos del usuario
const usuarioSesion = JSON.parse(
  localStorage.getItem('user') || 'null'
)

// Obtener el permiso del módulo Historias.
const permisoHistorias =
  usuarioSesion?.permisos?.historias ?? 1

// Nivel 2, 3 y 4: puede consultar.
const puedeConsultar =
  permisoHistorias >= 2 && permisoHistorias <= 4

// Nivel 3 y 4: puede modificar.
const puedeModificar =
  permisoHistorias >= 3 && permisoHistorias <= 4

// Nivel 3 y 4: puede agregar.
const puedeAgregar =
  permisoHistorias >= 3 && permisoHistorias <= 4

// Nivel 4: puede activar y desactivar.
const puedeCambiarEstado =
  permisoHistorias === 4

// Una historia desactivada solo la ven (y pueden reactivar) quienes tienen
// nivel 4. Para los demás usuarios deja de aparecer en el listado, pero su
// número no se reutiliza.
const puedeVerInactivas =
  permisoHistorias === 4

function irASistemas() {
  router.push('/panel/sistemas')
}

// Control de vistas y mensajes
const mensaje = ref('')
const tipoMensaje = ref<'exito' | 'error' | 'advertencia'>('exito')
const mostrarFormulario = ref(false)
// Controla la ventana de detalles de la historia.
const historiaSeleccionada = ref<HistoriaUsuario | null>(null)
const idEnEdicion = ref<number | null>(null)
const fechaActualizacion = ref('')

function mostrarNotificacion(
  texto: string,
  tipo: 'exito' | 'error' | 'advertencia' = 'exito'
) {
  mensaje.value = texto
  tipoMensaje.value = tipo

  // Lleva la vista hasta el aviso para que el usuario lo vea.
  nextTick(() => {
    document.querySelector('.mensaje')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  })
}

// Muestra uno o varios errores de validación en un solo aviso.
function mostrarErrores(errores: string[]) {
  mostrarNotificacion(
    errores.length === 1
      ? (errores[0] ?? '')
      : `Revisa los siguientes puntos: ${errores.map(e => `• ${e}`).join(' ')}`,
    'error'
  )
}


// Listado de historias: vive en un estado compartido
// (composables/UseHistorias.ts) para que no se pierda al salir de la vista.
const { historias } = useHistorias()

// Historias del sistema seleccionado, ordenadas por su número consecutivo.
// Las desactivadas solo se muestran a quienes pueden reactivarlas.
const historiasDelSistema = computed(() => {
  const sistema = sistemaSeleccionadoGlobal.value
  if (!sistema) return []

  return historias.value
    .filter(h => h.sistemaId === sistema.id && (h.activo || puedeVerInactivas))
    .sort((a, b) => a.numero - b.numero)
})

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

// Clase de color según el estatus.
function claseEstatus(estatus: EstatusAvance) {
  return estatus === 'Finalizado'
    ? 'sel-finalizado'
    : estatus === 'En proceso'
      ? 'sel-en-proceso'
      : 'sel-no-iniciado'
}

// Datos del formulario de historias
const formulario = ref({
  nombre: '',
  descripcion: '',
  usuarioId: '' as number | '',
  prioridad: '' as '' | 'Alta' | 'Media' | 'Baja',
  estatus: 'No iniciado' as EstatusAvance
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
    estatus: 'No iniciado'
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
  if (!puedeAgregar) {
  mostrarNotificacion('No tienes permiso para agregar historias.', 'error')
  return
}
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
  reaperturaConfirmada.value = false
}

/*
  Guardar o modificar historia.

  - Se validan los campos (ver ReglasHistorias.ts).
  - Si es nueva: se guarda con el siguiente número consecutivo del sistema y
    el formulario se queda abierto para que aparezca la sección de criterios.
  - Si ya existía: se guardan los cambios y se regresa al listado.
  - Una historia desactivada no se puede modificar.
*/
function guardarHistoria() {
  const sistema = sistemaSeleccionadoGlobal.value
  if (!sistema) return

  if (idEnEdicion.value === null && !puedeAgregar) {
    mostrarNotificacion('No tienes permiso para agregar historias.', 'error')
    return
  }

  if (idEnEdicion.value !== null && !puedeModificar) {
    mostrarNotificacion('No tienes permiso para modificar historias.', 'error')
    return
  }

  const existente = historiaEnEdicion.value

  if (existente && !existente.activo) {
    mostrarNotificacion(
      'La historia está desactivada. Actívala para poder modificarla.',
      'advertencia'
    )
    return
  }

  // Validación de los campos.
  const errores = validarHistoria(formulario.value, {
    historias: historias.value,
    sistemaId: sistema.id,
    idEnEdicion: idEnEdicion.value,
    personas: usuarios.value,
    usuarioActualId: existente?.usuarioId ?? null
  })

  if (errores.length > 0) {
    mostrarErrores(errores)
    return
  }

  // Ya validados: se quitan los espacios sobrantes.
  const nombre = limpiarLinea(formulario.value.nombre)
  const descripcion = limpiarParrafo(formulario.value.descripcion)
  const usuarioId = formulario.value.usuarioId as number
  const prioridad = formulario.value.prioridad as HistoriaUsuario['prioridad']
  const estatus = formulario.value.estatus

  // Reglas del estatus (solo cuando cambia): no se finaliza con criterios
  // pendientes ni sin criterios, y no se regresa a "No iniciado" si ya hay
  // criterios en avance.
  if (!existente || existente.estatus !== estatus) {
    const evaluacion = evaluarEstatus(
      { nombre, criterios: existente?.criterios ?? [] },
      estatus
    )

    if (!evaluacion.permitido) {
      mostrarNotificacion(
        evaluacion.mensaje ?? 'El estatus seleccionado no está permitido.',
        evaluacion.tipo ?? 'advertencia'
      )
      return
    }
  }

  const fecha = fechaActual()

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
    // Consecutivo respecto a la última registrada del sistema.
    numero: siguienteNumero(historias.value, sistema.id),
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
    `Historia de usuario registrada con el No. ${nueva.numero}. Ahora puedes agregar sus criterios de aceptación.`
  )
}

// Mostrar los detalles de una historia de usuario.
function verDetalle(historia: HistoriaUsuario) {
  mensaje.value = ''
  historiaSeleccionada.value = historia
}

// Cerrar los detalles.
function cerrarDetalle() {
  historiaSeleccionada.value = null
}

function modificarHistoria(historia: HistoriaUsuario) {
  if (!puedeModificar) {
  mostrarNotificacion('No tienes permiso para modificar historias.', 'error')
  return
}
  if (!historia.activo) {
    mostrarNotificacion(
      'La historia está desactivada. Actívala para poder modificarla.',
      'advertencia'
    )
    return
  }
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
  if (!puedeCambiarEstado) {
  mostrarNotificacion('No tienes permiso para activar o desactivar historias.', 'error')
  return
}
  historia.activo = !historia.activo

  mostrarNotificacion(
    historia.activo
      ? `Historia "${historia.nombre}" activada.`
      : `Historia "${historia.nombre}" desactivada.`
  )
}

// Cambia el estatus desde la columna de estatus del listado.
function cambiarEstatusHistoria(historia: HistoriaUsuario, evento: Event) {
  const selector = evento.target as HTMLSelectElement
  const nuevo = selector.value as EstatusAvance

  if (!puedeModificar) {
    selector.value = historia.estatus
    mostrarNotificacion('No tienes permiso para modificar historias.', 'error')
    return
  }

  if (!historia.activo) {
    selector.value = historia.estatus
    mostrarNotificacion(
      'La historia está desactivada. Actívala para cambiar su estatus.',
      'advertencia'
    )
    return
  }

  if (nuevo === historia.estatus) return

  // No se permite finalizar con criterios pendientes (ni sin criterios), ni
  // regresar a "No iniciado" con criterios en avance: se regresa el selector
  // al estatus anterior y se muestra una advertencia.
  const evaluacion = evaluarEstatus(historia, nuevo)

  if (!evaluacion.permitido) {
    selector.value = historia.estatus
    mostrarNotificacion(
      evaluacion.mensaje ?? 'El estatus seleccionado no está permitido.',
      evaluacion.tipo ?? 'advertencia'
    )
    return
  }

  historia.estatus = nuevo
  historia.fechaActualizacion = fechaActual()
  mostrarNotificacion(`Historia "${historia.nombre}" cambió a "${nuevo}".`)
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
  descripcion: '',
  estatus: 'No iniciado' as EstatusAvance
})

/*
  Aviso de reapertura: si la historia está "Finalizado" y se agrega un
  criterio pendiente (o uno finalizado regresa a pendiente), el estatus de
  la historia cambiará a "En proceso". Se pide confirmación antes.
*/
const mostrarConfirmacion = ref(false)
const accionConfirmacion = ref<'abrir' | 'guardar'>('abrir')
const reaperturaConfirmada = ref(false)

function abrirModalCriterio() {
  if (!puedeAgregar) {
    mostrarNotificacion('No tienes permiso para agregar criterios.', 'error')
    return
  }

  const historia = historiaEnEdicion.value

  if (historia && !historia.activo) {
    mostrarNotificacion(
      'La historia está desactivada. Actívala para agregar criterios.',
      'advertencia'
    )
    return
  }

  // Historia finalizada: se avisa antes de agregar un criterio.
  if (historia && historia.estatus === 'Finalizado' && !reaperturaConfirmada.value) {
    accionConfirmacion.value = 'abrir'
    mostrarConfirmacion.value = true
    return
  }

  formularioCriterio.value = { nombre: '', descripcion: '', estatus: 'No iniciado' }
  idCriterioEnEdicion.value = null
  errorCriterio.value = ''
  mostrarModalCriterio.value = true
}

function editarCriterio(criterio: CriterioAceptacion) {
  if (!puedeModificar) {
    mostrarNotificacion('No tienes permiso para modificar criterios.', 'error')
    return
  }

  const historia = historiaEnEdicion.value

  if (historia && !historia.activo) {
    mostrarNotificacion(
      'La historia está desactivada. Actívala para modificar sus criterios.',
      'advertencia'
    )
    return
  }

  formularioCriterio.value = {
    nombre: criterio.nombre,
    descripcion: criterio.descripcion,
    estatus: criterio.estatus ?? 'No iniciado'
  }
  idCriterioEnEdicion.value = criterio.id
  errorCriterio.value = ''
  mostrarModalCriterio.value = true
}

function cerrarModalCriterio() {
  mostrarModalCriterio.value = false
  idCriterioEnEdicion.value = null
  errorCriterio.value = ''
  reaperturaConfirmada.value = false
}

// El usuario acepta que la historia finalizada pase a "En proceso".
function confirmarReapertura() {
  reaperturaConfirmada.value = true
  mostrarConfirmacion.value = false

  if (accionConfirmacion.value === 'abrir') {
    abrirModalCriterio()
  } else {
    guardarCriterio()
  }
}

// El usuario cambia de opinión: no se agrega ni se modifica el criterio.
function cancelarReapertura() {
  mostrarConfirmacion.value = false
}

/*
  Guarda el criterio. Después de guardar, el estatus de la historia se
  ajusta solo:
  - Todos los criterios finalizados -> la historia pasa a "Finalizado".
  - Historia finalizada con un criterio pendiente -> pasa a "En proceso".
  - Historia "No iniciado" con criterios en avance -> pasa a "En proceso".
*/
function guardarCriterio() {
  const historia = historiaEnEdicion.value
  if (!historia) return

  if (idCriterioEnEdicion.value === null && !puedeAgregar) {
    mostrarNotificacion('No tienes permiso para agregar criterios.', 'error')
    return
  }

  if (idCriterioEnEdicion.value !== null && !puedeModificar) {
    mostrarNotificacion('No tienes permiso para modificar criterios.', 'error')
    return
  }

  if (!historia.activo) {
    errorCriterio.value =
      'La historia está desactivada. Actívala para modificar sus criterios.'
    return
  }

  // Validación de los campos.
  const errores = validarCriterio(
    formularioCriterio.value,
    historia,
    idCriterioEnEdicion.value
  )

  if (errores.length > 0) {
    errorCriterio.value = errores.join(' ')
    return
  }

  const nombre = limpiarLinea(formularioCriterio.value.nombre)
  const descripcion = limpiarParrafo(formularioCriterio.value.descripcion)
  const estatus = formularioCriterio.value.estatus

  // Aviso previo: la historia finalizada quedaría con un criterio pendiente.
  if (!reaperturaConfirmada.value && reabriria(historia, idCriterioEnEdicion.value, estatus)) {
    accionConfirmacion.value = 'guardar'
    mostrarConfirmacion.value = true
    return
  }

  const esEdicion = idCriterioEnEdicion.value !== null

  if (esEdicion) {
    const criterio = historia.criterios.find(c => c.id === idCriterioEnEdicion.value)

    if (!criterio) {
      errorCriterio.value = 'El criterio ya no existe.'
      return
    }

    Object.assign(criterio, { nombre, descripcion, estatus })
  } else {
    // Registro nuevo: se agrega a la lista reactiva (la tabla se actualiza al instante).
    historia.criterios.push({
      id: siguienteId(historia.criterios),
      nombre,
      descripcion,
      estatus
    })
  }

  const fecha = fechaActual()
  historia.fechaActualizacion = fecha
  fechaActualizacion.value = fecha

  // Se ajusta el estatus de la historia según el estado de sus criterios.
  let texto = esEdicion
    ? 'Criterio de aceptación modificado correctamente.'
    : 'Criterio de aceptación agregado correctamente.'
  let tipo: 'exito' | 'advertencia' = 'exito'

  const cambio = estatusTrasCriterios(historia)

  if (cambio) {
    historia.estatus = cambio.estatus
    formulario.value.estatus = cambio.estatus

    if (cambio.motivo === 'finalizada') {
      texto = 'Todos los criterios están finalizados: la historia pasó a "Finalizado".'
      // Si luego se agrega un criterio pendiente, se vuelve a avisar.
      reaperturaConfirmada.value = false
    } else if (cambio.motivo === 'reabierta') {
      texto = 'La historia pasó a "En proceso" porque tiene criterios pendientes.'
      tipo = 'advertencia'
    } else {
      texto = 'La historia pasó a "En proceso" porque ya tiene criterios en avance.'
    }
  }

  mostrarNotificacion(texto, tipo)

  if (esEdicion) {
    cerrarModalCriterio()
  } else {
    // Se limpian los campos y se mantiene la modal abierta para seguir agregando.
    formularioCriterio.value = { nombre: '', descripcion: '', estatus: 'No iniciado' }
    errorCriterio.value = ''
    idCriterioEnEdicion.value = null
  }
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
            v-if="puedeAgregar"
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
          :role="tipoMensaje === 'exito' ? 'status' : 'alert'"
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
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(historia, indice) in historiasDelSistema"
                :key="historia.id"
                :class="{ 'fila-inactiva': !historia.activo }"
              >
                <td>{{ historia.numero }}</td>
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

                <!-- Estatus de la historia (no permite Finalizado con criterios pendientes) -->
                <td>
                  <select
                    class="select-estatus"
                    :class="claseEstatus(historia.estatus)"
                    :value="historia.estatus"
                    :disabled="!puedeModificar || !historia.activo"
                    title="Cambiar estatus de la historia"
                    aria-label="Estatus de la historia"
                    @change="cambiarEstatusHistoria(historia, $event)"
                  >
                    <option
                      v-for="opcion in ESTATUS_AVANCE"
                      :key="opcion"
                      :value="opcion"
                    >
                      {{ opcion }}
                    </option>
                  </select>
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
                      v-if="puedeModificar"
                      type="button"
                      class="btn-icono btn-editar"
                      title="Modificar"
                      @click="modificarHistoria(historia)"
                    >
                      <Pencil :size="18" />
                    </button>
                    <!-- ACTIVAR / DESACTIVAR (interruptor ON / OFF) -->
                    <button
                      v-if="puedeCambiarEstado"
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
                <td colspan="6" class="mensaje-vacio">
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
          :role="tipoMensaje === 'exito' ? 'status' : 'alert'"
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
            <label for="estatusHistoria">Estatus de la historia</label>
            <select
              id="estatusHistoria"
              v-model="formulario.estatus"
              required
            >
              <option
                v-for="opcion in ESTATUS_AVANCE"
                :key="opcion"
                :value="opcion"
              >
                {{ opcion }}
              </option>
            </select>
            <small class="ayuda-campo">
              Para finalizar la historia, todos sus criterios de aceptación deben estar finalizados.
            </small>
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
                v-if="puedeAgregar"
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
                    <th>Estatus</th>
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
                      <span class="chip-estatus" :class="claseEstatus(criterio.estatus)">
                        {{ criterio.estatus }}
                      </span>
                    </td>
                    <td>
                      <div class="acciones-tabla">
                        <button
                          v-if="puedeModificar"
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
                    <td colspan="5" class="mensaje-vacio">
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
         MODAL: DETALLES DE LA HISTORIA
         ==================================================== -->
   <div
      v-if="historiaSeleccionada"
      class="fondo-modal"
      @click.self="cerrarDetalle"
    >
      <div
        class="modal modal-detalles"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalles"
      >
        <!-- Encabezado -->
        <div class="modal-encabezado">
          <div class="icono-detalles">
            <BookOpen :size="26" />
          </div>
          <div class="titulo-detalles">
            <h3 id="titulo-detalles">Detalles de la historia de usuario</h3>
            <p>Información general del requerimiento</p>
          </div>
          <button
            type="button"
            class="btn-cerrar-modal"
            @click="cerrarDetalle"
          >
            ×
          </button>
        </div>
        <!-- Nombre e ID -->
        <div class="resumen-sistema">
          <div>
            <span class="etiqueta-detalle">NOMBRE DEL REQUERIMIENTO</span>
            <h4>{{ historiaSeleccionada.nombre }}</h4>
          </div>
          <span class="id-sistema">
            ID: {{ historiaSeleccionada.id }}
          </span>
        </div>
        <!-- Descripción -->
        <div class="seccion-detalles">
          <h5>Descripción</h5>
          <p class="descripcion-detalle">
            {{ historiaSeleccionada.descripcion }}
          </p>
        </div>
        <!-- Persona que proporcionó la historia -->
        <div class="seccion-detalles">
          <h5>Persona que proporcionó el requerimiento</h5>
          <div class="rejilla-detalles">
            <div class="dato-detalle">
              <span>Nombre completo</span>
              <p>
                {{
                  personaDe(historiaSeleccionada)
                    ? nombreCompleto(personaDe(historiaSeleccionada)!)
                    : 'Sin asignar'
                }}
              </p>
            </div>
            <div class="dato-detalle">
              <span>Correo electrónico</span>
              <p>
                {{ personaDe(historiaSeleccionada)?.correo ?? 'Sin asignar' }}
              </p>
            </div>
          </div>
        </div>
        <!-- Prioridad y estatus -->
        <div class="seccion-detalles">
          <h5>Información del requerimiento</h5>
          <div class="rejilla-detalles">
            <div class="dato-detalle">
              <span>Prioridad</span>
              <p>{{ historiaSeleccionada.prioridad }}</p>
            </div>
            <div class="dato-detalle">
              <span>Estatus</span>
              <p>{{ historiaSeleccionada.estatus }}</p>
            </div>
          </div>
        </div>
        <!-- Fechas -->
        <div class="seccion-detalles">
          <h5>Registro</h5>
          <div class="rejilla-detalles">
            <div class="dato-detalle">
              <span>Fecha de captura</span>
              <p>{{ historiaSeleccionada.fechaCaptura }}</p>
            </div>
            <div class="dato-detalle">
              <span>Fecha de actualización</span>
              <p>{{ historiaSeleccionada.fechaActualizacion }}</p>
            </div>
          </div>
        </div>
      <!-- Criterios de aceptación y Estado del registro -->
        <div class="seccion-detalles fila-criterios-estado">
          <div class="rejilla-detalles">
            <div>
              <h5>Criterios de aceptación</h5>
              <div class="dato-detalle">
                <span>Cantidad registrada</span>
                <p>
                  {{ historiaSeleccionada.criterios.length > 0 
                      ? `${historiaSeleccionada.criterios.length} ${historiaSeleccionada.criterios.length === 1 ? 'criterio registrado' : 'criterios registrados'}` 
                      : 'Sin criterios registrados' }}
                </p>
              </div>
            </div>
            <div>
              <h5>Estado del registro</h5>
              <div class="dato-detalle dato-disponibilidad-fila">
                <span>Disponibilidad</span>
                <span
                  class="estatus-detalle"
                  :class="historiaSeleccionada.activo ? 'estatus-finalizado' : 'chip-inactivo'"
                >
                  {{ historiaSeleccionada.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pie del modal con botón Cerrar a la derecha -->
        <div class="pie-modal">
          <button
            type="button"
            class="btn-guardar"
            @click="cerrarDetalle"
          >
            Cerrar
          </button>
        </div>
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

          <!-- Estatus (por defecto: No iniciado) -->
          <div class="campo">
            <label for="estatusCriterio">Estatus</label>
            <select
              id="estatusCriterio"
              v-model="formularioCriterio.estatus"
            >
              <option
                v-for="opcion in ESTATUS_AVANCE"
                :key="opcion"
                :value="opcion"
              >
                {{ opcion }}
              </option>
            </select>
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

    <!-- ====================================================
         MODAL: AVISO DE REAPERTURA (historia finalizada)
         ==================================================== -->
    <div
      v-if="mostrarConfirmacion"
      class="fondo-modal"
      @click.self="cancelarReapertura"
    >
      <div
        class="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-reapertura"
      >
        <h3 id="titulo-reapertura">La historia está finalizada</h3>

        <p>
          "{{ historiaEnEdicion?.nombre }}" tiene el estatus <strong>Finalizado</strong>.
          Si continúas, quedará con al menos un criterio pendiente y su estatus
          cambiará automáticamente a <strong>En proceso</strong>.
        </p>

        <div class="acciones-formulario">
          <button
            type="button"
            class="btn-cancelar"
            @click="cancelarReapertura"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn-guardar"
            @click="confirmarReapertura"
          >
            Continuar
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

/* MODAL DE DETALLES DE HISTORIAS */

.modal-detalles {
  max-height: 98vh;
  padding: 10px 16px !important;
  overflow-y: hidden !important;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Reducir drásticamente los paddings internos de cada sección para ganar espacio */
.modal-detalles .modal-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distribuye el icono, el texto y la X correctamente */
  gap: 12px;
  padding: 10px 16px !important;
  border-bottom: 1px solid #EEEEEE;
}

.modal-detalles .resumen-sistema {
  padding: 10px 16px !important;
  border-bottom: 1px solid #EEEEEE;
}

.modal-detalles .seccion-detalles {
  padding: 8px 16px !important;
  border-bottom: 1px solid #EEEEEE;
  margin-bottom: 0 !important;
}

.modal-detalles .pie-modal {
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px 4px !important;
}

.modal-detalles .dato-estado {
  display: flex;
  align-items: center;
  min-height: 10px;
}

/* Ajustes de tipografía y espaciados internos compactos */
.icono-detalles {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #FCE8E8;
  color: #B62A2D;
}

.titulo-detalles {
  flex: 1;
  min-width: 0;
}

.modal-detalles .titulo-detalles h3 {
  margin: 0 0 2px;
  font-size: 17px;
}

.modal-detalles .titulo-detalles p {
  margin: 0;
  color: #777777;
  font-size: 12px;
}

.btn-cerrar-modal {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  background: #F5F5F5;
  color: #555555;
  font-size: 20px;
  cursor: pointer;
}

.btn-cerrar-modal:hover {
  background: #EEEEEE;
}

.etiqueta-detalle {
  color: #888888;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
}

.resumen-sistema {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Empuja el nombre a la izquierda y el ID a la derecha */
  gap: 15px;
  padding: 10px 16px !important;
  background: #FAFAFA;
  border-bottom: 1px solid #EEEEEE;
}

/* 2. Alinear el estado "Activo/Inactivo" a la derecha en su sección */
.modal-detalles .seccion-detalles:has(.estatus-detalle) {
  display: flex;
  align-items: center;
  margin-top: 2px;
  justify-content: space-between; /* Título a la izquierda, estatus a la derecha */
}

.modal-detalles .seccion-detalles:has(.estatus-detalle) h5 {
  margin: 0 !important; /* Elimina márgenes verticales para un perfecto centrado horizontal */
}

.resumen-sistema h4 {
  margin: 3px 0 0;
  color: #222223;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.id-sistema {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 6px;
  background: #FCE8E8;
  color: #B62A2D;
  font-size: 12px;
  font-weight: 600;
}

.modal-detalles .seccion-detalles h5 {
  margin: 0 0 4px;
  color: #B62A2D;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.modal-detalles .descripcion-detalle {
  margin: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: #F8F8F8;
  color: #555555;
  font-size: 13px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.rejilla-detalles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.dato-detalle {
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid #EEEEEE;
  border-radius: 7px;
  background: #FFFFFF;
}

.dato-detalle > span:first-child {
  color: #888888;
  font-size: 11px;
}

.modal-detalles .dato-detalle p {
  margin: 2px 0 0;
  color: #333333;
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.estatus-detalle {
  display: inline-block;
  padding: 3px 7px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.estatus-finalizado {
  background: #E3F5E8;
  color: #237442;
}

.pie-modal .btn-guardar {
  min-width: 90px;
  padding: 6px 14px;
  font-size: 13px;
}

@media (max-width: 520px) {
  .modal-detalles {
    max-height: 95vh;
  }
  .resumen-sistema {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Empuja el nombre a la izquierda y el ID a la derecha */
    gap: 15px;
    padding: 10px 16px !important;
    background: #FAFAFA;
    border-bottom: 1px solid #EEEEEE;
  }
  .rejilla-detalles {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  
}

/* ESTATUS DE HISTORIAS Y CRITERIOS */
.mensaje.advertencia {
  background: #FFF8E1;
  color: #8A5A00;
  border-color: #FFE0A3;
}

.select-estatus {
  height: 36px;
  padding: 0 8px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  background: #FFFFFF;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.select-estatus:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.select-estatus:focus-visible {
  outline: 2px solid #B62A2D;
  outline-offset: 3px;
}

.chip-estatus {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.sel-no-iniciado {
  background: #F2F2F2;
  color: #555555;
  border-color: #DDDDDD;
}

.sel-en-proceso {
  background: #EFF6FF;
  color: #1D4ED8;
  border-color: #BFDBFE;
}

.sel-finalizado {
  background: #E8F5E9;
  color: #256B32;
  border-color: #C8E6C9;
}

.ayuda-campo {
  color: #777777;
  font-size: 12px;
}

.criterio-detalle .chip-estatus {
  margin: 4px 0;
}

.modal-detalles .fila-criterios-estado {
  display: block !important;
}

.modal-detalles .fila-criterios-estado .rejilla-detalles {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 8px !important;
}

.modal-detalles .fila-criterios-estado h5 {
  margin: 0 0 4px !important;
}

.modal-detalles .fila-criterios-estado .contenedor-chip-estado {
  margin-top: 10px;
}

@media (max-width: 520px) {
  .modal-detalles .fila-criterios-estado .rejilla-detalles {
    grid-template-columns: 1fr !important;
    gap: 15px !important;
  }
}

.modal-detalles .fila-criterios-estado .dato-disponibilidad-fila {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
}
</style>
