<script setup lang="ts">
/*
  VISTA: HISTORIAS DE USUARIO

  Esta vista corresponde al módulo "Historias de Usuario" del Panel.
  Muestra el sistema actualmente seleccionado desde el composable global
  y permite registrar y administrar historias de usuario.
*/
import { ref, type Component } from 'vue'
import {
  BookOpen, Eye, Pencil, Trash2,
  CalendarDays, Code, FlaskConical, CircleCheck
} from 'lucide-vue-next'
import { SistemaActivo } from '../router/index'

export interface HistoriaUsuario {
  id: number
  nombre: string
  informacion: string
  rolEncargado: string
  prioridad: 'Alta' | 'Media' | 'Baja'
  estatus: 'Planeación' | 'En desarrollo' | 'En pruebas' | 'Finalizado'
  fechaActualizacion?: string
}

const { sistemaSeleccionadoGlobal } = SistemaActivo ()

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

/*
  ICONOS DE ESTATUS
*/
const estatusConfig: Record<string, { icono: Component; clase: string }> = {
  'Planeación': { icono: CalendarDays, clase: 'estatus-planeacion' },
  'En desarrollo': { icono: Code, clase: 'estatus-desarrollo' },
  'En pruebas': { icono: FlaskConical, clase: 'estatus-pruebas' },
  'Finalizado': { icono: CircleCheck, clase: 'estatus-finalizado' }
}

const listaEstatus = Object.entries(estatusConfig).map(
  ([nombre, config]) => ({ nombre, ...config })
)

// Listado de historias de usuario
const historias = ref<HistoriaUsuario[]>([
  {
    id: 1,
    nombre: 'Autenticación de usuarios',
    informacion: 'Permitir inicio de sesión mediante credenciales.',
    rolEncargado: 'Desarrollador Front-End',
    prioridad: 'Alta',
    estatus: 'En desarrollo',
    fechaActualizacion: '01/11/2026 08:30'
  },
  {
    id: 2,
    nombre: 'Módulo de reportes',
    informacion: 'Generar reporte en formato PDF de los registros.',
    rolEncargado: 'Administrador',
    prioridad: 'Media',
    estatus: 'Planeación',
    fechaActualizacion: '01/11/2026 09:15'
  }
])

// Datos del formulario de historias
const formulario = ref({
  nombre: '',
  informacion: '',
  rolEncargado: '',
  prioridad: '' as '' | 'Alta' | 'Media' | 'Baja',
  estatus: '' as '' | 'Planeación' | 'En desarrollo' | 'En pruebas' | 'Finalizado'
})

function limpiarFormulario() {
  formulario.value = {
    nombre: '',
    informacion: '',
    rolEncargado: '',
    prioridad: '',
    estatus: ''
  }
}

// Abrir formulario para agregar
function agregarHistoria() {
  mensaje.value = ''
  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = true
}

// Cancelar el registro
function cancelarRegistro() {
  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = false
  mensaje.value = ''
}

// Guardar o modificar historia
function guardarHistoria() {
  if (
    !formulario.value.nombre.trim() ||
    !formulario.value.informacion.trim() ||
    !formulario.value.rolEncargado.trim() ||
    !formulario.value.prioridad ||
    !formulario.value.estatus
  ) {
    mostrarNotificacion('Por favor, completa todos los campos.', 'error')
    return
  }

  const fechaActual = new Date().toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const datosHistoria: HistoriaUsuario = {
    id: idEnEdicion.value ?? Date.now(),
    nombre: formulario.value.nombre.trim(),
    informacion: formulario.value.informacion.trim(),
    rolEncargado: formulario.value.rolEncargado.trim(),
    prioridad: formulario.value.prioridad,
    estatus: formulario.value.estatus,
    fechaActualizacion: fechaActual
  }

  if (idEnEdicion.value !== null) {
    const indice = historias.value.findIndex(h => h.id === idEnEdicion.value)
    if (indice !== -1) {
      historias.value[indice] = datosHistoria
    }
    mostrarNotificacion('Historia de usuario modificada correctamente.')
  } else {
    historias.value.push(datosHistoria)
    mostrarNotificacion('Historia de usuario registrada correctamente.')
  }

  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = false
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
    informacion: historia.informacion,
    rolEncargado: historia.rolEncargado,
    prioridad: historia.prioridad,
    estatus: historia.estatus
  }

  mostrarFormulario.value = true
}

function eliminarHistoria(historia: HistoriaUsuario) {
  historias.value = historias.value.filter(h => h.id !== historia.id)
  mostrarNotificacion(`Historia "${historia.nombre}" eliminada correctamente.`)
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
           VISTA 1: LISTADO DE HISTORIAS DE USUARIO
           ================================================== -->
      <div v-if="!mostrarFormulario">

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
          style="margin-bottom: 15px; padding: 10px; border-radius: 6px; background-color: #e2e8f0;"
        >
          <span>{{ mensaje }}</span>
          <button
            type="button"
            class="cerrar-mensaje"
            aria-label="Cerrar mensaje"
            @click="mensaje = ''"
            style="float: right; background: none; border: none; cursor: pointer; font-weight: bold;"
          >
            ×
          </button>
        </div>

        <!-- LEYENDA DE ESTATUS (Alineada a la derecha) -->
        <div class="leyenda-estatus" aria-label="Codificación de estatus">
          <span class="leyenda-titulo">Estatus:</span>
          <span
            v-for="item in listaEstatus"
            :key="item.nombre"
            class="leyenda-item"
          >
            <span class="estatus-icono estatus-icono-sm" :class="item.clase">
              <component :is="item.icono" :size="14" />
            </span>
            {{ item.nombre }}
          </span>
        </div>

        <!-- TABLA -->
        <div class="contenedor-tabla">
          <table class="tabla-sistemas">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de la historia de usuario</th>
                <th>Información</th>
                <th>Rol / Persona encargada</th>
                <th>Prioridad</th>
                <th>Status</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="historia in historias" :key="historia.id">
                <td>{{ historia.id }}</td>
                <td><strong>{{ historia.nombre }}</strong></td>
                <td>{{ historia.informacion }}</td>
                <td>{{ historia.rolEncargado }}</td>
                <td>
                  <span class="chip-prioridad">
                    {{ historia.prioridad }}
                  </span>
                </td>
                <td>
                  <span
                    v-if="estatusConfig[historia.estatus]"
                    class="estatus-icono"
                    :class="estatusConfig[historia.estatus].clase"
                    :title="historia.estatus"
                    role="img"
                    :aria-label="historia.estatus"
                  >
                    <component
                      :is="estatusConfig[historia.estatus].icono"
                      :size="18"
                    />
                  </span>
                  <span v-else class="estatus">
                    {{ historia.estatus }}
                  </span>
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
                    <button
                      type="button"
                      class="btn-icono btn-eliminar"
                      title="Eliminar"
                      @click="eliminarHistoria(historia)"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="historias.length === 0">
                <td colspan="7" class="mensaje-vacio">
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

        <form @submit.prevent="guardarHistoria">

          <!-- Fecha de actualización (Solo al editar) -->
          <div class="campo-fecha" v-if="idEnEdicion !== null" style="margin-bottom: 15px;">
            <label for="fechaActualizacion">Fecha de actualización:</label>
            <input
              id="fechaActualizacion"
              type="text"
              :value="fechaActualizacion"
              readonly
              style="width: 100%; padding: 8px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px;"
            />
          </div>

          <!-- Nombre de la historia -->
          <div class="campo" style="margin-bottom: 15px;">
            <label for="nombreHistoria">Nombre de la historia de usuario</label>
            <input
              id="nombreHistoria"
              v-model="formulario.nombre"
              type="text"
              placeholder="Escribe el nombre de la historia"
              required
              style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;"
            />
          </div>

          <!-- Información -->
          <div class="campo" style="margin-bottom: 15px;">
            <label for="informacionHistoria">Información</label>
            <textarea
              id="informacionHistoria"
              v-model="formulario.informacion"
              placeholder="Describe detalladamente la historia de usuario"
              rows="4"
              required
              style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;"
            ></textarea>
          </div>

          <div class="fila-campos" style="display: flex; gap: 15px; margin-bottom: 15px;">
            <!-- Rol / Persona encargada -->
            <div class="campo" style="flex: 1;">
              <label for="rolEncargado">Rol / Persona encargada</label>
              <input
                id="rolEncargado"
                v-model="formulario.rolEncargado"
                type="text"
                placeholder="Ej. Desarrollador Front-End"
                required
                style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;"
              />
            </div>

            <!-- Prioridad -->
            <div class="campo" style="flex: 1;">
              <label for="prioridadHistoria">Prioridad</label>
              <select
                id="prioridadHistoria"
                v-model="formulario.prioridad"
                required
                style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;"
              >
                <option value="">Selecciona una prioridad</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <!-- Estatus -->
          <div class="campo" style="margin-bottom: 20px;">
            <label for="estatusHistoria">Status del sistema</label>
            <select
              id="estatusHistoria"
              v-model="formulario.estatus"
              required
              style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;"
            >
              <option value="">Selecciona un estatus</option>
              <option value="Planeación">Planeación</option>
              <option value="En desarrollo">En desarrollo</option>
              <option value="En pruebas">En pruebas</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <!-- Botones de acción del formulario -->
          <div class="acciones-formulario" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button
              type="button"
              class="btn-cancelar"
              @click="cancelarRegistro"
              style="padding: 8px 16px; background-color: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-guardar"
              style="padding: 8px 16px; background-color: #B62A2D; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"
            >
              {{ idEnEdicion !== null ? 'Guardar cambios' : 'Guardar historia' }}
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
}

/* Leyenda de estatus alineada a la derecha */
.leyenda-estatus {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
  margin-bottom: 15px;
  margin-left: auto;
  font-size: 13px;
  width: fit-content;
}

.leyenda-titulo {
  font-weight: 600;
  color: #333;
}

.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

.acciones-tabla {
  display: flex;
  gap: 8px;
}

.btn-icono {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-ver { color: #2563eb; }
.btn-editar { color: #d97706; }
.btn-eliminar { color: #dc2626; }

.btn-icono:hover {
  background-color: #f3f4f6;
}

.mensaje-vacio {
  text-align: center;
  padding: 30px;
}

/* Estilos de estatus (con colores e iconos) */
.estatus-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 6px;
}

.estatus-icono-sm {
  padding: 4px;
}

.estatus-planeacion {
  background-color: #fef3c7 !important;
  color: #d97706 !important;
}

.estatus-desarrollo {
  background-color: #dbeafe !important;
  color: #2563eb !important;
}

.estatus-pruebas {
  background-color: #f3e8ff !important;
  color: #9333ea !important;
}

.estatus-finalizado {
  background-color: #d1fae5 !important;
  color: #059669 !important;
}

.campo textarea {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
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
}
</style>