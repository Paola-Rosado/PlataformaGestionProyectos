<script setup lang="ts">

/*
==========================================================
MÓDULO DE SISTEMAS
==========================================================

Esta vista permite:

1. Consultar los sistemas registrados.
2. Mostrar un mensaje cuando no existen sistemas.
3. Abrir un formulario para agregar sistemas.
4. Registrar temporalmente nuevos sistemas.
5. Regresar al listado de sistemas.

Se utiliza Vue 3 con Composition API y TypeScript.
*/

// ref permite crear variables reactivas.
// Cuando cambian, Vue actualiza automáticamente la vista.
import { ref, type Component } from 'vue'
import type { Sistema } from '../interfaces/Sistema'
import type { Metodologias } from '../interfaces/Metodologias'
import {
  MonitorCog, Eye, Pencil, Trash2,
  CalendarDays, Code, FlaskConical, CircleCheck
} from 'lucide-vue-next'
import { SistemaActivo } from '../router/index'

/*
==========================================================
1. DEFINICIÓN DE LOS DATOS DE UN SISTEMA
==========================================================

La interfaz establece qué información debe tener
cada sistema registrado.
*/
const cat_metodologias: Metodologias[] = [
  { id: 1, nombre: 'Scrum' },
  { id: 2, nombre: 'Programación Extrema (XP)' },
  { id: 3, nombre: 'Kanban' },
  { id: 4, nombre: 'Cascada' },
  { id: 5, nombre: 'Espiral' }
]


/*
==========================================================
2. LISTADO DE SISTEMAS
==========================================================

Aquí se almacenan los sistemas registrados.

Inicialmente el arreglo está vacío.

Cuando no existen registros, la tabla mostrará:
"No existen sistemas registrados".

Por ahora, los registros se almacenan en memoria.
*/

const sistemas = ref<Sistema[]>([
// Guarda el mensaje que se mostrará en pantalla.

  {
    id: 1,
    nombre: 'Sistema de Gestión Escolar',
    descripcion: 'Plataforma para el control de calificaciones y asistencias de alumnos.',
    correoResponsable: 'Rubyl@gmail.com',
    nombreResponsable: 'Ruby Sosa',
    fechaInicio: '2026-01-10',
    fechaFinalizacion: '2026-10-30',
    metodologia: 'Scrum',
    estatus: 'En desarrollo',
    fechaActualizacion: '10/01/2026 10:00'
  },
  {
    id: 2,
    nombre: 'Sistema de clinica dental',
    descripcion: 'Control de clinica dental.',
    correoResponsable: 'Paola@gmail.com',
    nombreResponsable: 'Paola Pech',
    fechaInicio: '2026-10-15',
    fechaFinalizacion: '2026-10-30',
    metodologia: 'Kanban',
    estatus: 'Planeación',
    fechaActualizacion: '01/02/2026 09:30'
  },
   {
    id: 3,
    nombre: 'Sistema de veterinaria',
    descripcion: 'Sistema para clinica veterinaria.',
    correoResponsable: 'gabriela@gmail.com',
    nombreResponsable: 'Gabriela Cuellar',
    fechaInicio: '2026-10-10',
    fechaFinalizacion: '2026-10-30',
    metodologia: 'Espiral',
    estatus: 'En pruebas',
    fechaActualizacion: '01/02/2026 09:30'
  }
])

const mensaje = ref('')

/*
==========================================================
ICONOS DE ESTATUS
==========================================================

Cada estatus se representa con un icono y un color.
Esta misma lista alimenta:
1. La leyenda (codificación) que aparece sobre la tabla.
2. El icono que aparece en la columna Estatus.
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
/*
==========================================================
3. CONTROL DE LAS VISTAS
==========================================================

Esta variable controla qué contenido aparece.

false = Mostrar tabla de sistemas.
true  = Mostrar formulario de registro.

Cuando cambia su valor, Vue actualiza la pantalla.
*/
const tipoMensaje = ref<'exito' | 'error'>('exito')
const mostrarFormulario = ref(false)
// Fecha que se mostrará después de guardar el sistema.
const fechaActualizacion = ref('')
// Controla si el sistema ya tiene un ID.
const idSistema = ref(0)
// La fecha aparece solamente cuando existe un ID.
const mostrarFechaActualizacion = ref(false)
// Guarda el ID del sistema que se está editando.
// Si es null, significa que estamos registrando uno nuevo.
const idEnEdicion = ref<number | null>(null)
// Controla la ventana de detalles.
const sistemaSeleccionado = ref<Sistema | null>(null)
// Controla la confirmación para eliminar.
const idPorEliminar = ref<number | null>(null)
// Controla el sistema que el usuario ha seleccionado con el nuevo botón
const sistemaSeleccionadoTabla = ref<Sistema | null>(null)
// Guarda el ID del sistema actualmente seleccionado (solo uno a la vez)
const idSistemaSeleccionado = ref<number | null>(null)
// Función que se ejecuta al seleccionar un sistema
function seleccionarUnicoSistema(sistema: Sistema) {
  if (idSistemaSeleccionado.value === sistema.id) {
    // Si ya estaba seleccionado y vuelve a hacer clic, se deselecciona
    idSistemaSeleccionado.value = null
    mensaje.value = ''
  } else {
    // Selecciona el nuevo sistema y muestra la notificación con su nombre
    idSistemaSeleccionado.value = sistema.id
    mostrarNotificacion(`Has seleccionado el sistema: ${sistema.nombre}`)
  }
}

const { sistemaSeleccionadoGlobal, seleccionarSistema } = SistemaActivo()

// Función que se ejecuta al marcar el checkbox en la tabla
function manejarSeleccion(sistema: Sistema) {
  if (sistemaSeleccionadoGlobal.value?.id === sistema.id) {
    seleccionarSistema(null) // Deselecciona si ya estaba marcado
    mensaje.value = ''
  } else {
    seleccionarSistema(sistema) // Guarda el sistema globalmente
    mostrarNotificacion(`Sistema seleccionado: ${sistema.nombre}`)
  }
}
  

/*
==========================================================
4. DATOS DEL FORMULARIO
==========================================================

Aquí se almacenan temporalmente los datos
que escribe el usuario.

v-model conecta estos valores con los campos
del formulario.
*/

const formulario = ref({
  nombre: '',
  descripcion: '',
  correoResponsable: '',
  nombreResponsable: '',
  apellidopaterno: '',
  apellidomaterno: '',
  fechaInicio: '',
  fechaFinalizacion: '',
  metodologia: '',
  estatus: '',
})


/*
==========================================================
5. FUNCIÓN PARA MOSTRAR EL FORMULARIO
==========================================================

Se ejecuta cuando el usuario presiona
el botón "+ Agregar sistema".

Oculta la tabla y muestra el formulario.
*/
// Mostrar mensaje en pantalla.
function mostrarNotificacion(
  texto: string,
  tipo: 'exito' | 'error' = 'exito'
) {
  mensaje.value = texto
  tipoMensaje.value = tipo
}


// Abrir el formulario para registrar un sistema.
function agregarSistema() {
  mensaje.value = ''
  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = true
}



/*
==========================================================
ACCIONES DE LA TABLA
==========================================================
*/

// Mostrar los detalles de un sistema.
function verDetalle(sistema: Sistema) {
  mensaje.value = ''
  sistemaSeleccionado.value = sistema
}

// Cerrar los detalles.
function cerrarDetalle() {
  sistemaSeleccionado.value = null
}

// Cargar los datos para modificar un sistema.
function modificarSistema(sistema: Sistema) {
  mensaje.value = ''
  idEnEdicion.value = sistema.id
  
  fechaActualizacion.value = sistema.fechaActualizacion

  // Separar el nombre completo del responsable para dividirlo en nombre y apellidos si fuera necesario
  const partesNombre = sistema.nombreResponsable.trim().split(' ')
  const nombreR = partesNombre[0] || ''
  const apellidoP = partesNombre[1] || ''
  const apellidoM = partesNombre.slice(2).join(' ') || ''

  formulario.value = {
    nombre: sistema.nombre,
    descripcion: sistema.descripcion,
    correoResponsable: sistema.correoResponsable,
    nombreResponsable: sistema.nombreResponsable,
    apellidopaterno: apellidoP,
    apellidomaterno: apellidoM,
    fechaInicio: sistema.fechaInicio,
    fechaFinalizacion: sistema.fechaFinalizacion,
    metodologia: sistema.metodologia,
    estatus: sistema.estatus
  }

  mostrarFormulario.value = true
}

// Abrir la confirmación para eliminar.
function confirmarEliminar(id: number) {
  mensaje.value = ''
  idPorEliminar.value = id
}

// Cancelar la eliminación.
function cancelarEliminar() {
  idPorEliminar.value = null
}

function eliminarSistema() {
  if (idPorEliminar.value === null) return

  sistemas.value = sistemas.value.filter(
    sistema => sistema.id !== idPorEliminar.value
  )

  idPorEliminar.value = null
  mostrarNotificacion('Sistema eliminado correctamente.')
}

// Limpiar los campos del formulario.
function limpiarFormulario() {
  formulario.value = {
    nombre: '',
    descripcion: '',
    correoResponsable: '',
    nombreResponsable: '',
    apellidopaterno: '',
    apellidomaterno: '',
    fechaInicio: '',
    fechaFinalizacion: '',
    metodologia: '',
    estatus: ''
  }
}

/*
==========================================================
FUNCIÓN PARA CANCELAR EL REGISTRO
==========================================================
*/

// Cancelar el registro o la modificación.
function cancelarRegistro() {
  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = false
  mensaje.value = ''
}


/*
==========================================================
8. FUNCIÓN PARA GUARDAR UN SISTEMA
==========================================================

Esta función:

1. Verifica que los campos estén completos.
2. Comprueba que las fechas sean correctas.
3. Crea un nuevo registro.
4. Agrega el registro al listado.
5. Limpia el formulario.
6. Regresa a la tabla.

IMPORTANTE:
Los datos todavía no se guardan en una base de datos.
*/


// Registrar un sistema nuevo o guardar sus modificaciones.
function guardarSistema() {
  if (
    !formulario.value.nombre.trim() ||
    !formulario.value.descripcion.trim() ||
    !formulario.value.correoResponsable.trim() ||
    !formulario.value.nombreResponsable.trim() ||
    !formulario.value.apellidopaterno.trim() ||
    !formulario.value.fechaInicio ||
    !formulario.value.fechaFinalizacion ||
    !formulario.value.metodologia ||
    !formulario.value.estatus
  ) {
    mostrarNotificacion(
      'Por favor, completa todos los campos.',
      'error'
    )
    return
  }

  // Comprobar que la fecha final no sea anterior a la inicial.
  if (
    formulario.value.fechaFinalizacion <
    formulario.value.fechaInicio
  ) {
    mostrarNotificacion(
      'La fecha final no puede ser anterior a la fecha de inicio.',
      'error'
    )
    return
  }

  // Comprobar el formato básico del correo.
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    formulario.value.correoResponsable.trim()
  )

  if (!correoValido) {
    mostrarNotificacion(
      'Escribe un correo electrónico válido.',
      'error'
    )
    return
  }

  
  // Obtener la fecha y hora actual.
  const fechaActual = new Date().toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
 //Forma una cadena del nombre y el apellido paterno y materno
  const nombreCompletoResponsable = `${formulario.value.nombreResponsable.trim()} ${formulario.value.apellidopaterno.trim()}${formulario.value.apellidomaterno ? ' ' + formulario.value.apellidomaterno.trim() : ''}`

  const datosSistema: Sistema = {
    id: idEnEdicion.value ?? Date.now(),
    nombre: formulario.value.nombre.trim(),
    descripcion: formulario.value.descripcion.trim(),
    correoResponsable: formulario.value.correoResponsable.trim(),
    nombreResponsable: nombreCompletoResponsable,
    fechaInicio: formulario.value.fechaInicio,
    fechaFinalizacion: formulario.value.fechaFinalizacion,
    metodologia: formulario.value.metodologia,
    estatus: formulario.value.estatus,
    fechaActualizacion: fechaActual
  }


  if (idEnEdicion.value !== null) {
    const indice = sistemas.value.findIndex(
      sistema => sistema.id === idEnEdicion.value
    )

    if (indice !== -1) {
      sistemas.value[indice] = datosSistema
    }

    mostrarNotificacion('Sistema modificado correctamente.')
  } else {
    sistemas.value.push(datosSistema)
    mostrarNotificacion('Sistema registrado correctamente.')
  }

  limpiarFormulario()
  idEnEdicion.value = null
  mostrarFormulario.value = false
}

</script>


<template>

  <!-- ======================================================
       CONTENEDOR GENERAL DEL MÓDULO
       ====================================================== -->

  <section class="modulo">

    <!-- ====================================================
         ENCABEZADO ORIGINAL
         ==================================================== -->

    <header>

      <p class="etiqueta">
        MÓDULO SELECCIONADO
      </p>

      <h2 class="titulo-sistemas">
        <MonitorCog :size="28" />
        <span> Sistemas</span>
      </h2>

      <p>
        Administración y gestión de sistemas.
      </p>

    </header>


    <!-- ====================================================
         TARJETA PRINCIPAL
         ==================================================== -->

    <div class="tarjeta">

      <!-- ==================================================
           VISTA 1: LISTADO DE SISTEMAS
           ==================================================

           v-if permite mostrar esta sección solamente
           cuando mostrarFormulario es false.

           Cuando se presiona Agregar, desaparece
           esta sección y aparece el formulario.
      -->

      <div v-if="!mostrarFormulario">

        <!-- Encabezado del listado -->

        <div class="encabezado-tabla">

          <div>

            <h3>Listado de sistemas</h3>

            <p>
              Consulta y administra los sistemas
              que se encuentran registrados.
            </p>

          </div>


          <!-- BOTÓN AGREGAR SISTEMA -->

          <button
            type="button"
            class="btn-agregar"
            @click="agregarSistema"
          >
            + Agregar sistema
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



        <!-- ================================================
             TABLA DE SISTEMAS
             ================================================ -->

        <!-- LEYENDA DE ESTATUS (alineada al lado del botón) -->
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

        <div class="contenedor-tabla">

          <table class="tabla-sistemas">

            <!-- ENCABEZADOS DE LA TABLA -->

            <thead>

              <tr>

                <th>ID</th>
                <th>Seleccionar</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha de actualización</th>
                <th>Responsable</th>
                <th>Estatus</th>
                <th>Acciones</th>

              </tr>

            </thead>


            <!-- CUERPO DE LA TABLA -->

            <tbody>
              
              <!-- ==========================================
                   REGISTROS EXISTENTES
                   ==========================================

                   v-for recorre el arreglo sistemas.

                   Por cada sistema registrado,
                   Vue genera una fila de la tabla.

                   :key identifica cada registro.
              -->

              <tr
                v-for="sistema in sistemas"
                :key="sistema.id"
              >

                <td>
                  {{ sistema.id }}
                </td>
                 
                <td>
                  <input
                    type="checkbox"
                    class="check-sistema"
                    :checked="sistemaSeleccionadoGlobal?.id === sistema.id"
                    @change="manejarSeleccion(sistema)"
                    aria-label="Seleccionar sistema"
                  />
                </td>
                <td>
                  {{ sistema.nombre }}
                </td>

                <td>
                  {{ sistema.descripcion }}
                </td>

                <td>
                  {{ sistema.fechaActualizacion }}
                </td>

                <td>
                  {{ sistema.nombreResponsable }}
                </td>

                <td>

                  <!-- Icono del estatus (el texto aparece al pasar el cursor) -->
                  <span
                    v-if="estatusConfig[sistema.estatus]"
                    class="estatus-icono"
                    :class="estatusConfig[sistema.estatus].clase"
                    :title="sistema.estatus"
                    role="img"
                    :aria-label="sistema.estatus"
                  >
                    <component
                      :is="estatusConfig[sistema.estatus].icono"
                      :size="18"
                    />
                  </span>

                  <!-- Respaldo por si llega un estatus desconocido -->
                  <span v-else class="estatus">
                    {{ sistema.estatus }}
                  </span>

                </td>
                                
                <td>
                  <div class="acciones-tabla">

                    <!-- VER DETALLE -->
                    <button
                      type="button"
                      class="btn-icono btn-ver"
                      title="Ver detalles"
                      aria-label="Ver detalles"
                      @click="verDetalle(sistema)"
                    >
                      <Eye :size="18" />
                    </button>

                    <!-- MODIFICAR -->
                    <button
                      type="button"
                      class="btn-icono btn-editar"
                      title="Modificar"
                      aria-label="Modificar sistema"
                      @click="modificarSistema(sistema)"
                    >
                      <Pencil :size="18" />
                    </button>

                    <!-- ELIMINAR -->
                    <button
                      type="button"
                      class="btn-icono btn-eliminar"
                      title="Eliminar"
                      aria-label="Eliminar sistema"
                      @click="confirmarEliminar(sistema.id)"
                    >
                      <Trash2 :size="18" />
                    </button>

                  </div>
                </td>


              </tr>


              <!-- ==========================================
                   MENSAJE CUANDO NO HAY SISTEMAS
                   ==========================================

                   v-if verifica si el arreglo está vacío.

                   colspan="7" hace que el mensaje
                   ocupe las siete columnas de la tabla.
              -->

              <tr v-if="sistemas.length === 0">

                <td
                  colspan="9"
                  class="mensaje-vacio"
                >

                  <div class="estado-vacio">

                    <h4>
                      No existen sistemas registrados
                    </h4>

                    <p>
                      Actualmente no hay sistemas
                      dados de alta.
                    </p>

                    <p>
                      Presiona "Agregar sistema"
                      para registrar uno nuevo.
                    </p>

                  </div>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>



      <!-- ==================================================
           VISTA 2: FORMULARIO DE REGISTRO
           ==================================================

           v-else significa que esta sección aparece
           cuando mostrarFormulario es true.

           El formulario sustituye al listado.
      -->

      <div v-else>

        <!-- ENCABEZADO DEL FORMULARIO -->

        <div class="encabezado-formulario">

          <h3>
            {{
              idEnEdicion !== null
                ? 'Modificar sistema'
                : 'Registrar nuevo sistema'
            }}
          </h3>

        </div>


        <!-- ================================================
             FORMULARIO
             ================================================

             @submit.prevent evita que la página se recargue.

             Cuando se envía el formulario,
             se ejecuta guardarSistema().
        -->

        <form @submit.prevent="guardarSistema">

          <!-- FECHA DE ACTUALIZACIÓN -->

          <div
            class="campo-fecha"
            v-if="idEnEdicion !== null"
          >
            <label for="fechaActualizacion">Fecha de actualización:</label>

            <input
              id="fechaActualizacion"
              type="text"
              :value="fechaActualizacion"
              readonly
            />
          </div>

          <!-- NOMBRE DEL SISTEMA -->

          <div class="campo">

            <label for="nombre">
              Nombre del sistema
            </label>

            <input
              id="nombre"
              v-model="formulario.nombre"
              type="text"
              placeholder="Escribe el nombre del sistema"
              required
            />

          </div>


          <!-- DESCRIPCIÓN DEL SISTEMA -->

          <div class="campo">

            <label for="descripcion">
              Descripción
            </label>

            <textarea
              id="descripcion"
              v-model="formulario.descripcion"
              placeholder="Describe brevemente el sistema"
              rows="4"
              required
            ></textarea>

          </div>


          <!-- NOMBRE DEL RESPONSABLE -->

       <div class="seccion-formulario-sub">
            <h4 class="subtitulo-seccion">DATOS DEL RESPONSABLE</h4>
            <hr class="divisor-seccion" />

            <div class="fila-campos">
              <!-- CORREO ELECTRÓNICO -->
              <div class="campo">
                <label for="correoResponsable">
                  Correo Electrónico
                </label>
                <input
                  id="correoResponsable"
                  v-model="formulario.correoResponsable"
                  type="email"
                  placeholder="ejemplo@dominio.com"
                  required
                />
              </div>

              <!-- NOMBRE -->
              <div class="campo">
                <label for="nombreResponsable">
                  Nombre
                </label>
                <input
                  id="nombreResponsable"
                  v-model="formulario.nombreResponsable"
                  type="text"
                  placeholder="Nombre(s)"
                  required
                />
              </div>
            </div>

            <div class="fila-campos">
              <!-- APELLIDO PATERNO -->
              <div class="campo">
                <label for="apellidoPaterno">
                  Apellido Paterno
                </label>
                <input
                  id="apellidoPaterno"
                  v-model="formulario.apellidopaterno"
                  type="text"
                  placeholder="Primer apellido"
                  required
                />
              </div>

              <!-- APELLIDO MATERNO -->
              <div class="campo">
                <label for="apellidoMaterno">
                  Apellido Materno
                </label>
                <input
                  id="apellidoMaterno"
                  v-model="formulario.apellidomaterno"
                  type="text"
                  placeholder="Segundo apellido (opcional)"
                />
              </div>
            </div>
          </div>

      
          <!-- FECHAS DEL PROYECTO -->
           <hr class="divisor-seccion" />
           <h4 class="subtitulo-seccion">FECHAS DEL PROYECTO</h4>

          <div class="fila-campos">


            <!-- FECHA DE INICIO -->

            <div class="campo">

              <label for="fechaInicio">
                Fecha de inicio
              </label>

              <input
                id="fechaInicio"
                v-model="formulario.fechaInicio"
                type="date"
                required
              />

            </div>


            <!-- FECHA DE FINALIZACIÓN -->

            <div class="campo">

              <label for="fechaFinalizacion">
                Fecha de finalización
              </label>

              <input
                id="fechaFinalizacion"
                v-model="formulario.fechaFinalizacion"
                type="date"
                :min="formulario.fechaInicio || undefined"
                required
              />

            </div>

          </div>

          <div class="fila-campos">
          <!-- METODOLOGÍA -->

          <div class="campo">

            <label for="metodologia">
              Metodología de desarrollo
            </label>

            <select
              id="metodologia"
              v-model="formulario.metodologia"
              required
            >
              <option value="">
                Selecciona una metodología
              </option>

              <option
                v-for="metodologia in cat_metodologias"
                :key="metodologia.id"
                :value="metodologia.nombre"
              >
                {{ metodologia.nombre }}
              </option>
            </select>

          </div>


          <!-- ESTATUS -->

          <div class="campo">

            <label for="estatus">
              Estatus del sistema
            </label>

            <select
              id="estatus"
              v-model="formulario.estatus"
              required
            >

              <option value="">
                Selecciona un estatus
              </option>

              <option value="Planeación">
                Planeación
              </option>

              <option value="En desarrollo">
                En desarrollo
              </option>

              <option value="En pruebas">
                En pruebas
              </option>

              <option value="Finalizado">
                Finalizado
              </option>

            </select>

          </div>
          </div>

          <!-- ==============================================
               BOTONES DEL FORMULARIO
               ============================================== -->

          <div class="acciones-formulario">


            <!-- BOTÓN CANCELAR -->

            <button
              type="button"
              class="btn-cancelar"
              @click="cancelarRegistro"
            >
              Cancelar
            </button>


            <!-- BOTÓN GUARDAR -->

            <button type="submit" class="btn-guardar">
            {{
              idEnEdicion !== null
                ? 'Guardar cambios'
                : 'Guardar sistema'
            }}
          </button>

          </div>

        </form>

      </div>

    </div>

    <div
      v-if="sistemaSeleccionado"
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
            <MonitorCog :size="26" />
          </div>

          <div class="titulo-detalles">
            <h3 id="titulo-detalles">Detalles del sistema</h3>
            <p>Información general del registro</p>
          </div>

          <button
            type="button"
            class="btn-cerrar-modal"
            aria-label="Cerrar detalles"
            @click="cerrarDetalle"
          >
            ×
          </button>
        </div>

        <!-- Nombre e ID -->
        <div class="resumen-sistema">
          <div>
            <span class="etiqueta-detalle">NOMBRE DEL SISTEMA</span>
            <h4>{{ sistemaSeleccionado.nombre }}</h4>
          </div>

          <span class="id-sistema">
            ID: {{ sistemaSeleccionado.id }}
          </span>
        </div>

        <!-- Descripción -->
        <div class="seccion-detalles">
          <h5>Descripción</h5>
          <p class="descripcion-detalle">
            {{ sistemaSeleccionado.descripcion }}
          </p>
        </div>

        <!-- Responsable -->
        <div class="seccion-detalles">
          <h5>Responsable</h5>

          <div class="rejilla-detalles">
            <div class="dato-detalle">
              <span>Nombre completo</span>
              <p>{{ sistemaSeleccionado.nombreResponsable }}</p>
            </div>

            <div class="dato-detalle">
              <span>Correo electrónico</span>
              <p>{{ sistemaSeleccionado.correoResponsable }}</p>
            </div>
          </div>
        </div>

        <!-- Fechas -->
        <div class="seccion-detalles">
          <h5>Planificación</h5>

          <div class="rejilla-detalles">
            <div class="dato-detalle">
              <span>Fecha de inicio</span>
              <p>{{ sistemaSeleccionado.fechaInicio }}</p>
            </div>

            <div class="dato-detalle">
              <span>Fecha de finalización</span>
              <p>{{ sistemaSeleccionado.fechaFinalizacion }}</p>
            </div>
          </div>
        </div>

        <!-- Metodología y estatus -->
        <div class="seccion-detalles">
          <h5>Desarrollo del sistema</h5>

          <div class="rejilla-detalles">
            <div class="dato-detalle">
              <span>Metodología</span>
              <p>{{ sistemaSeleccionado.metodologia }}</p>
            </div>

            <div class="dato-detalle">
              <span>Estatus actual</span>
              <p>
                <span
                  class="estatus-detalle"
                  :class="{
                    'estatus-planeacion':
                      sistemaSeleccionado.estatus === 'Planeación',
                    'estatus-desarrollo':
                      sistemaSeleccionado.estatus === 'En desarrollo',
                    'estatus-pruebas':
                      sistemaSeleccionado.estatus === 'En pruebas',
                    'estatus-finalizado':
                      sistemaSeleccionado.estatus === 'Finalizado'
                  }"
                >
                  {{ sistemaSeleccionado.estatus }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Pie de la ventana -->
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

    <!-- Confirmación para eliminar -->
    <div
      v-if="idPorEliminar !== null"
      class="fondo-modal"
      @click.self="cancelarEliminar"
    >
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-eliminar"
      >
        <h3 id="titulo-eliminar">Eliminar sistema</h3>
        <p>¿Estás segura de que deseas eliminar este sistema?</p>

        <div class="acciones-formulario">
          <button
            type="button"
            class="btn-cancelar"
            @click="cancelarEliminar"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="btn-guardar btn-peligro"
            @click="eliminarSistema"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

/*
==========================================================
1. CONTENEDOR GENERAL
==========================================================
*/

.modulo {
  width: 100%;
}

/*
==========================================================
2. ENCABEZADO ORIGINAL
==========================================================
*/

header {
  margin-bottom: 25px;
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

header p:last-child {
  color: #777777;
}


/*
==========================================================
3. TARJETA PRINCIPAL
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


/* Mensajes de éxito y error */
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

/* Mensaje de éxito */
.mensaje.exito {
  background: #E8F5E9;
  color: #256B32;
  border-color: #C8E6C9;
}

/* Mensaje de error */
.mensaje.error {
  background: #FCE8E8;
  color: #B62A2D;
  border-color: #F2C6C6;
}

/* Botón para cerrar el mensaje */
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

.cerrar-mensaje:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
  border-radius: 3px;
}


/*
==========================================================
4. ENCABEZADO DE LA TABLA
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


/*
==========================================================
5. BOTÓN AGREGAR
==========================================================
*/

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


/*
==========================================================
6. TABLA DE SISTEMAS
==========================================================
*/

.contenedor-tabla {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eeeeee;
  border-radius: 10px;
}

.tabla-sistemas {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: auto;
}

.tabla-sistemas th {
  padding: 15px;
  background: #F7F7F7;
  color: #222223;
  text-align: left;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 2px solid #eeeeee;
}

.tabla-sistemas td {
  padding: 5px;
  color: #555555;
  border-bottom: 1px solid #eeeeee;
  vertical-align: middle;
}

.tabla-sistemas tbody tr:hover {
  background: #FAFAFA;
}


/*
==========================================================
7. MENSAJE CUANDO LA TABLA ESTÁ VACÍA
==========================================================
*/

.mensaje-vacio {
  text-align: center;
}

.estado-vacio {
  padding: 35px 15px;
}

.icono-vacio {
  font-size: 38px;
  margin-bottom: 15px;
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
8. ESTATUS DE LOS SISTEMAS
==========================================================
*/

.estatus {
  display: inline-block;
  padding: 6px 12px;
  background: #FCE8E8;
  color: #B62A2D;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}


/*
==========================================================
9. ENCABEZADO DEL FORMULARIO
==========================================================
*/

.encabezado-formulario {
  margin-bottom: 25px;
}

.encabezado-formulario p {
  margin-bottom: 0;
}


/*
==========================================================
10. CAMPOS DEL FORMULARIO
==========================================================
*/

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
.campo textarea,
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
.campo textarea:focus,
.campo select:focus {
  border-color: #B62A2D;
}

.campo textarea {
  resize: vertical;
  min-height: 100px;
}


/*
==========================================================
11. DISTRIBUCIÓN DE FECHAS
==========================================================
*/

.fila-campos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
/* Campo de fecha actualizado */
.campo-fecha {
  width: 220px;
  margin-left: auto;
  margin-bottom: 10px;
}

.campo-fecha label {
  font-size: 12px;
  color: #888;
  text-align: right;
}

.campo-fecha input {
  width: 100%;
  padding: 7px 10px;
  font-size: 12px;
  color: #777;
  background-color: #eeeeee;
  border: 1px solid #d6d6d6;
  border-radius: 6px;
  cursor: not-allowed;
}

/*
==========================================================
12. BOTONES DEL FORMULARIO
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


/*
==========================================================
13. DISEÑO RESPONSIVO
==========================================================

Permite adaptar el contenido a pantallas pequeñas.
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
.titulo-sistemas {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #222223;
  font-size: 28px;
}

.titulo-sistemas svg {
  color: #B62A2D;
  flex-shrink: 0;
}


/* =========================================
   ACCIONES DE LA TABLA
   ========================================= */

.acciones-tabla {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

/* Botones de los iconos */
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

/* Ver detalles */
.btn-ver {
  color: #2563EB;
}

.btn-ver:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
}

/* Modificar */
.btn-editar {
  color: #B7791F;
}

.btn-editar:hover {
  background: #FFFBEB;
  border-color: #FDE68A;
}

/* Eliminar */
.btn-eliminar {
  color: #B62A2D;
}

.btn-eliminar:hover {
  background: #FCE8E8;
  border-color: #F2C6C6;
}

.check-sistema {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #B62A2D; /* Cambia el color del check al color principal de tu tema */
  vertical-align: middle;
}

/* Accesibilidad del teclado */
.acciones-tabla button:focus-visible {
  outline: 2px solid #B62A2D;
  outline-offset: 3px;
}

/* Fondo que cubre toda la pantalla */
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

/* Tarjeta central */
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

/* Título de la ventana */
.modal h3 {
  margin-top: 0;
  color: #222223;
}

/* Texto de los detalles */
.modal p {
  color: #555555;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

/* Botón de confirmar eliminación */
.btn-peligro {
  background: #C62828;
}

.btn-peligro:hover {
  background: #A61F1F;
}
/* =========================================
   MODAL DE DETALLES DEL SISTEMA
   ========================================= */

.modal-detalles {
  max-width: 650px;
  padding: 0;
  border-radius: 16px;
  overflow-x: hidden;
}

/* Encabezado */
.modal-encabezado {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px;
  border-bottom: 1px solid #EEEEEE;
}

.icono-detalles {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #FCE8E8;
  color: #B62A2D;
}

.titulo-detalles {
  flex: 1;
  min-width: 0;
}

.modal .titulo-detalles h3 {
  margin: 0 0 5px;
  font-size: 20px;
}

.modal .titulo-detalles p {
  margin: 0;
  color: #777777;
  font-size: 13px;
}

.btn-cerrar-modal {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: #F5F5F5;
  color: #555555;
  font-size: 24px;
  cursor: pointer;
}

.btn-cerrar-modal:hover {
  background: #EEEEEE;
}

/* Nombre e ID */
.resumen-sistema {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 22px 24px;
  background: #FAFAFA;
  border-bottom: 1px solid #EEEEEE;
}

.etiqueta-detalle {
  color: #888888;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.resumen-sistema h4 {
  margin: 7px 0 0;
  color: #222223;
  font-size: 19px;
  overflow-wrap: anywhere;
}

.id-sistema {
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: #FCE8E8;
  color: #B62A2D;
  font-size: 12px;
  font-weight: 600;
}

/* Secciones */
.seccion-detalles {
  padding: 18px 24px;
  border-bottom: 1px solid #EEEEEE;
}

.modal .seccion-detalles h5 {
  margin: 0 0 14px;
  color: #B62A2D;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.modal .descripcion-detalle {
  margin: 0;
  padding: 13px;
  border-radius: 8px;
  background: #F8F8F8;
  color: #555555;
  font-size: 14px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* Distribución de los datos */
.rejilla-detalles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.dato-detalle {
  min-width: 0;
  padding: 12px;
  border: 1px solid #EEEEEE;
  border-radius: 9px;
  background: #FFFFFF;
}

.dato-detalle > span:first-child {
  color: #888888;
  font-size: 12px;
}

.modal .dato-detalle p {
  margin: 7px 0 0;
  color: #333333;
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

/* Estatus */
.estatus-detalle {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.estatus-planeacion {
  background: #FFF3CD;
  color: #856404;
}

.estatus-desarrollo {
  background: #E3EEFF;
  color: #2457A7;
}

.estatus-pruebas {
  background: #F0E5FF;
  color: #7040A0;
}

.estatus-finalizado {
  background: #E3F5E8;
  color: #237442;
}

/* Pie del modal */
.pie-modal {
  display: flex;
  justify-content: flex-end;
  padding: 18px 24px;
  background: #FAFAFA;
}

.pie-modal .btn-guardar {
  min-width: 100px;
}

/* Adaptación a celulares */
@media (max-width: 520px) {
  .modal-detalles {
    max-height: 90vh;
  }

  .modal-encabezado {
    padding: 18px;
  }

  .resumen-sistema,
  .seccion-detalles {
    padding: 16px 18px;
  }

  .resumen-sistema {
    align-items: flex-start;
    flex-direction: column;
  }

  .rejilla-detalles {
    grid-template-columns: 1fr;
  }

  .pie-modal {
    padding: 16px 18px;
  }
}

/* =========================================
   ICONOS DE ESTATUS Y LEYENDA
   ========================================= */

/* Leyenda sobre la tabla, del mismo lado que el botón Agregar */
.leyenda-estatus {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 18px;
  margin-bottom: 16px;
  color: #666666;
  font-size: 12px;
}

.leyenda-titulo {
  font-weight: 700;
  color: #222223;
}

.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Círculo que contiene el icono */
.estatus-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: help;
}

.estatus-icono-sm {
  width: 24px;
  height: 24px;
  cursor: default;
}

@media (max-width: 768px) {
  .leyenda-estatus {
    justify-content: flex-start;
  }
}

</style>