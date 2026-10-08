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
import { ref } from 'vue'


/*
==========================================================
1. DEFINICIÓN DE LOS DATOS DE UN SISTEMA
==========================================================

La interfaz establece qué información debe tener
cada sistema registrado.
*/

interface Sistema {
  id: number
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFinalizacion: string
  metodologia: string
  estatus: string
}


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

const sistemas = ref<Sistema[]>([])


/*
==========================================================
3. CONTROL DE LAS VISTAS
==========================================================

Esta variable controla qué contenido aparece.

false = Mostrar tabla de sistemas.
true  = Mostrar formulario de registro.

Cuando cambia su valor, Vue actualiza la pantalla.
*/

const mostrarFormulario = ref(false)


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
  fechaInicio: '',
  fechaFinalizacion: '',
  metodologia: '',
  estatus: ''
})


/*
==========================================================
5. FUNCIÓN PARA MOSTRAR EL FORMULARIO
==========================================================

Se ejecuta cuando el usuario presiona
el botón "+ Agregar sistema".

Oculta la tabla y muestra el formulario.
*/

function agregarSistema() {
  mostrarFormulario.value = true
}


/*
==========================================================
6. FUNCIÓN PARA CANCELAR EL REGISTRO
==========================================================

Permite regresar al listado de sistemas
sin guardar la información.
*/

function cancelarRegistro() {
  mostrarFormulario.value = false
}


/*
==========================================================
7. FUNCIÓN PARA LIMPIAR EL FORMULARIO
==========================================================

Restablece los campos después de registrar
un sistema correctamente.
*/

function limpiarFormulario() {
  formulario.value = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFinalizacion: '',
    metodologia: '',
    estatus: ''
  }
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

function guardarSistema() {

  // Verificar que los campos tengan información.
  if (
    !formulario.value.nombre.trim() ||
    !formulario.value.descripcion.trim() ||
    !formulario.value.fechaInicio ||
    !formulario.value.fechaFinalizacion ||
    !formulario.value.metodologia ||
    !formulario.value.estatus
  ) {
    alert('Por favor, completa todos los campos.')
    return
  }

  // Validar que la fecha final no sea anterior al inicio.
  if (
    formulario.value.fechaFinalizacion <
    formulario.value.fechaInicio
  ) {
    alert(
      'La fecha de finalización no puede ser anterior a la fecha de inicio.'
    )
    return
  }

  // Crear un nuevo sistema con los datos del formulario.
  const nuevoSistema: Sistema = {
    id: Date.now(),
    nombre: formulario.value.nombre.trim(),
    descripcion: formulario.value.descripcion.trim(),
    fechaInicio: formulario.value.fechaInicio,
    fechaFinalizacion: formulario.value.fechaFinalizacion,
    metodologia: formulario.value.metodologia,
    estatus: formulario.value.estatus
  }

  // Agregar el sistema al arreglo reactivo.
  sistemas.value.push(nuevoSistema)

  // Limpiar los campos.
  limpiarFormulario()

  // Regresar al listado de sistemas.
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

      <h2>Sistemas</h2>

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


        <!-- ================================================
             TABLA DE SISTEMAS
             ================================================ -->

        <div class="contenedor-tabla">

          <table class="tabla-sistemas">

            <!-- ENCABEZADOS DE LA TABLA -->

            <thead>

              <tr>

                <th>ID</th>

                <th>Nombre</th>

                <th>Descripción</th>

                <th>Fecha de inicio</th>

                <th>Fecha de finalización</th>

                <th>Metodología</th>

                <th>Estatus</th>

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
                  {{ sistema.nombre }}
                </td>

                <td>
                  {{ sistema.descripcion }}
                </td>

                <td>
                  {{ sistema.fechaInicio }}
                </td>

                <td>
                  {{ sistema.fechaFinalizacion }}
                </td>

                <td>
                  {{ sistema.metodologia }}
                </td>

                <td>

                  <span class="estatus">
                    {{ sistema.estatus }}
                  </span>

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
                  colspan="7"
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

          <h3>Registrar nuevo sistema</h3>

          <p>
            Completa la información solicitada
            para registrar un nuevo sistema.
          </p>

        </div>


        <!-- ================================================
             FORMULARIO
             ================================================

             @submit.prevent evita que la página se recargue.

             Cuando se envía el formulario,
             se ejecuta guardarSistema().
        -->

        <form @submit.prevent="guardarSistema">


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


          <!-- FECHAS DEL PROYECTO -->

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

              <option value="Scrum">
                Scrum
              </option>

              <option value="XP">
                Programación Extrema (XP)
              </option>

              <option value="Kanban">
                Kanban
              </option>

              <option value="Cascada">
                Cascada
              </option>

              <option value="Espiral">
                Espiral
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

              <option value="Cancelado">
                Cancelado
              </option>

            </select>

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

            <button
              type="submit"
              class="btn-guardar"
            >
              Guardar sistema
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
  padding: 15px;
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

</style>