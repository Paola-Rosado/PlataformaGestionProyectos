/*
  REGLAS DE NEGOCIO DE LAS HISTORIAS DE USUARIO

  Aquí viven las validaciones y reglas del módulo, separadas de la vista
  para que sean fáciles de revisar. No usan Vue: son funciones simples
  que reciben datos y devuelven un resultado.

  Resumen de las reglas:
  1. Campos: nombre (texto, 3 a 300 caracteres) y descripción (área de
     texto, hasta 500). Obligatorios, sin espacios sobrantes y sin
     repetir el nombre dentro del mismo sistema.
  2. La persona que proporcionó el requerimiento debe existir, estar
     activa y pertenecer al sistema.
  3. Numeración: cada historia lleva un número consecutivo dentro de su
     sistema, a partir de la última registrada (aunque esté inactiva).
  4. Estatus de la historia:
     - 'Finalizado' solo si tiene criterios y todos están finalizados.
     - 'No iniciado' no se permite si ya hay criterios en avance.
  5. Estatus automático al cambiar los criterios:
     - Todos finalizados -> la historia pasa a 'Finalizado'.
     - Historia finalizada con un criterio pendiente -> 'En proceso'.
     - Historia 'No iniciado' con criterios en avance -> 'En proceso'.
  6. Criterios: nombre (3 a 300), descripción (hasta 500), sin repetir
     el nombre dentro de la misma historia.
*/
import type {
  HistoriaUsuario,
  CriterioAceptacion,
  EstatusAvance
} from '../interfaces/HistoriaUsuario'

export const ESTATUS_AVANCE: EstatusAvance[] = ['No iniciado', 'En proceso', 'Finalizado']
export const PRIORIDADES: HistoriaUsuario['prioridad'][] = ['Alta', 'Media', 'Baja']

export const MAX_TEXTO = 300
export const MAX_AREA = 500
export const MIN_NOMBRE = 3

type ConCriterios = { criterios: CriterioAceptacion[] }

/* ==========================================================
   LIMPIEZA DE TEXTO
   ========================================================== */

// Una sola línea: quita espacios, tabulaciones y saltos de línea repetidos.
export function limpiarLinea(texto: string): string {
  return String(texto ?? '').replace(/\s+/g, ' ').trim()
}

// Varias líneas: conserva los saltos de línea pero quita los espacios sobrantes.
export function limpiarParrafo(texto: string): string {
  return String(texto ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(linea => linea.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Para comparar nombres sin importar mayúsculas, acentos ni espacios.
export function claveTexto(texto: string): string {
  return limpiarLinea(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/* ==========================================================
   NUMERACIÓN CONSECUTIVA
   ========================================================== */

// ID interno: el mayor existente + 1.
export function siguienteId(lista: { id: number }[]): number {
  return lista.reduce((mayor, item) => Math.max(mayor, item.id), 0) + 1
}

// Número de la historia dentro de su sistema: el de la última registrada + 1.
// Cuentan también las historias inactivas, para no repetir números.
export function siguienteNumero(historias: HistoriaUsuario[], sistemaId: number): number {
  return historias
    .filter(h => h.sistemaId === sistemaId)
    .reduce((mayor, h) => Math.max(mayor, Number(h.numero) || 0), 0) + 1
}

/* ==========================================================
   CRITERIOS Y ESTATUS
   ========================================================== */

// Criterios que todavía no están finalizados.
export function criteriosPendientes(h: ConCriterios): number {
  return h.criterios.filter(c => c.estatus !== 'Finalizado').length
}

// Criterios que ya empezaron (en proceso o finalizados).
export function criteriosEnAvance(h: ConCriterios): number {
  return h.criterios.filter(c => c.estatus !== 'No iniciado').length
}

export interface Evaluacion {
  permitido: boolean
  mensaje?: string
  tipo?: 'error' | 'advertencia'
}

// ¿Puede la historia pasar a este estatus?
export function evaluarEstatus(
  h: { nombre: string } & ConCriterios,
  nuevo: EstatusAvance
): Evaluacion {
  if (nuevo === 'Finalizado') {
    if (h.criterios.length === 0) {
      return {
        permitido: false,
        tipo: 'advertencia',
        mensaje:
          `No se puede finalizar "${h.nombre}": todavía no tiene criterios de aceptación. ` +
          'Agrega al menos uno y finalízalo.'
      }
    }

    const pendientes = criteriosPendientes(h)

    if (pendientes > 0) {
      return {
        permitido: false,
        tipo: 'advertencia',
        mensaje:
          `No se puede finalizar "${h.nombre}": tiene ${pendientes} ` +
          (pendientes === 1 ? 'criterio de aceptación pendiente' : 'criterios de aceptación pendientes') +
          '. Finaliza todos los criterios antes de cerrar la historia.'
      }
    }
  }

  if (nuevo === 'No iniciado') {
    const enAvance = criteriosEnAvance(h)

    if (enAvance > 0) {
      return {
        permitido: false,
        tipo: 'advertencia',
        mensaje:
          `No se puede regresar "${h.nombre}" a "No iniciado": ya tiene ${enAvance} ` +
          (enAvance === 1 ? 'criterio en proceso o finalizado' : 'criterios en proceso o finalizados') +
          '.'
      }
    }
  }

  return { permitido: true }
}

export type MotivoCambio = 'finalizada' | 'reabierta' | 'iniciada'

// Estatus que le corresponde a la historia después de cambiar sus criterios.
// Devuelve null cuando no debe cambiar.
export function estatusTrasCriterios(
  h: { estatus: EstatusAvance } & ConCriterios
): { estatus: EstatusAvance; motivo: MotivoCambio } | null {
  if (h.criterios.length === 0) return null

  const pendientes = criteriosPendientes(h)

  if (pendientes === 0 && h.estatus !== 'Finalizado') {
    return { estatus: 'Finalizado', motivo: 'finalizada' }
  }

  if (pendientes > 0 && h.estatus === 'Finalizado') {
    return { estatus: 'En proceso', motivo: 'reabierta' }
  }

  if (h.estatus === 'No iniciado' && criteriosEnAvance(h) > 0) {
    return { estatus: 'En proceso', motivo: 'iniciada' }
  }

  return null
}

// ¿Guardar este criterio dejaría pendiente una historia finalizada?
// idCriterio = null cuando el criterio es nuevo.
export function reabriria(
  h: { estatus: EstatusAvance } & ConCriterios,
  idCriterio: number | null,
  estatusNuevo: EstatusAvance
): boolean {
  if (h.estatus !== 'Finalizado' || estatusNuevo === 'Finalizado') return false

  // Criterio nuevo y pendiente.
  if (idCriterio === null) return true

  // Criterio que estaba finalizado y regresa a pendiente.
  const criterio = h.criterios.find(c => c.id === idCriterio)
  return criterio?.estatus === 'Finalizado'
}

/* ==========================================================
   VALIDACIÓN DE LOS FORMULARIOS
   ========================================================== */

export interface DatosHistoria {
  nombre: string
  descripcion: string
  usuarioId: number | ''
  prioridad: string
  estatus: string
}

export interface ContextoHistoria {
  // Todas las historias (de todos los sistemas).
  historias: HistoriaUsuario[]
  sistemaId: number
  // null = historia nueva.
  idEnEdicion: number | null
  // Usuarios registrados.
  personas: { id: number; sistemaId: number; activo: boolean }[]
  // Persona que ya tenía asignada la historia que se edita.
  usuarioActualId: number | null
}

// Devuelve la lista de errores (vacía si todo está bien).
export function validarHistoria(d: DatosHistoria, ctx: ContextoHistoria): string[] {
  const errores: string[] = []

  const nombre = limpiarLinea(d.nombre)
  const descripcion = limpiarParrafo(d.descripcion)

  // Nombre del requerimiento.
  if (!nombre) {
    errores.push('El nombre del requerimiento es obligatorio.')
  } else if (nombre.length < MIN_NOMBRE) {
    errores.push(`El nombre debe tener al menos ${MIN_NOMBRE} caracteres.`)
  } else if (nombre.length > MAX_TEXTO) {
    errores.push(`El nombre admite máximo ${MAX_TEXTO} caracteres.`)
  } else {
    const repetida = ctx.historias.find(h =>
      h.sistemaId === ctx.sistemaId &&
      h.id !== ctx.idEnEdicion &&
      claveTexto(h.nombre) === claveTexto(nombre)
    )

    if (repetida) {
      errores.push(
        `Ya existe una historia con el nombre "${nombre}" en este sistema` +
        (repetida.activo ? '.' : ' (está desactivada).')
      )
    }
  }

  // Descripción.
  if (!descripcion) {
    errores.push('La descripción es obligatoria.')
  } else if (descripcion.length > MAX_AREA) {
    errores.push(`La descripción admite máximo ${MAX_AREA} caracteres.`)
  }

  // Persona que proporcionó el requerimiento.
  if (d.usuarioId === '' || d.usuarioId === null || d.usuarioId === undefined) {
    errores.push('Selecciona quién proporcionó el requerimiento.')
  } else {
    const persona = ctx.personas.find(u => u.id === d.usuarioId)

    if (!persona) {
      errores.push('La persona seleccionada ya no existe.')
    } else if (persona.sistemaId !== ctx.sistemaId) {
      errores.push('La persona seleccionada no pertenece a este sistema.')
    } else if (!persona.activo && persona.id !== ctx.usuarioActualId) {
      errores.push('La persona seleccionada está desactivada.')
    }
  }

  // Prioridad y estatus.
  if (!PRIORIDADES.includes(d.prioridad as HistoriaUsuario['prioridad'])) {
    errores.push('Selecciona una prioridad válida.')
  }

  if (!ESTATUS_AVANCE.includes(d.estatus as EstatusAvance)) {
    errores.push('Selecciona un estatus válido.')
  }

  return errores
}

export interface DatosCriterio {
  nombre: string
  descripcion: string
  estatus: string
}

// idEnEdicion = null cuando el criterio es nuevo.
export function validarCriterio(
  d: DatosCriterio,
  historia: ConCriterios,
  idEnEdicion: number | null
): string[] {
  const errores: string[] = []

  const nombre = limpiarLinea(d.nombre)
  const descripcion = limpiarParrafo(d.descripcion)

  if (!nombre) {
    errores.push('El nombre del criterio es obligatorio.')
  } else if (nombre.length < MIN_NOMBRE) {
    errores.push(`El nombre debe tener al menos ${MIN_NOMBRE} caracteres.`)
  } else if (nombre.length > MAX_TEXTO) {
    errores.push(`El nombre admite máximo ${MAX_TEXTO} caracteres.`)
  } else if (
    historia.criterios.some(c =>
      c.id !== idEnEdicion && claveTexto(c.nombre) === claveTexto(nombre)
    )
  ) {
    errores.push('Ya existe un criterio con ese nombre en esta historia.')
  }

  if (!descripcion) {
    errores.push('La descripción del criterio es obligatoria.')
  } else if (descripcion.length > MAX_AREA) {
    errores.push(`La descripción admite máximo ${MAX_AREA} caracteres.`)
  }

  if (!ESTATUS_AVANCE.includes(d.estatus as EstatusAvance)) {
    errores.push('Selecciona un estatus válido para el criterio.')
  }

  return errores
}

/* ==========================================================
   DATOS GUARDADOS
   ========================================================== */

/*
  Revisa las historias guardadas en el navegador y completa lo que
  falte, por si se guardaron con una versión anterior de la plataforma:
  - Les asigna número consecutivo por sistema (si no lo tenían o se repite).
  - Corrige estatus o prioridades desconocidos.
  - Evita ids repetidos.
  - Una historia finalizada con criterios pendientes pasa a 'En proceso'.
*/
export function normalizarHistorias(entrada: unknown): HistoriaUsuario[] {
  if (!Array.isArray(entrada)) return []

  const estatusValidos = new Set<string>(ESTATUS_AVANCE)
  const idsUsados = new Set<number>()

  let maxId = 0
  for (const x of entrada as any[]) {
    const id = Number(x?.id)
    if (Number.isFinite(id)) maxId = Math.max(maxId, id)
  }

  const historias: HistoriaUsuario[] = (entrada as any[])
    .filter(x => x && typeof x === 'object')
    .map((x: any) => {
      let id = Number(x.id)
      if (!Number.isFinite(id) || idsUsados.has(id)) id = ++maxId
      idsUsados.add(id)

      const criteriosEntrada: any[] = Array.isArray(x.criterios) ? x.criterios : []
      const idsCriterio = new Set<number>()
      let maxCriterio = 0
      for (const c of criteriosEntrada) {
        const cid = Number(c?.id)
        if (Number.isFinite(cid)) maxCriterio = Math.max(maxCriterio, cid)
      }

      const criterios: CriterioAceptacion[] = criteriosEntrada
        .filter(c => c && typeof c === 'object')
        .map((c: any) => {
          let cid = Number(c.id)
          if (!Number.isFinite(cid) || idsCriterio.has(cid)) cid = ++maxCriterio
          idsCriterio.add(cid)

          return {
            id: cid,
            nombre: String(c.nombre ?? ''),
            descripcion: String(c.descripcion ?? ''),
            estatus: estatusValidos.has(c.estatus) ? c.estatus : 'No iniciado'
          }
        })

      const historia: HistoriaUsuario = {
        id,
        numero: Number(x.numero),
        sistemaId: Number(x.sistemaId),
        nombre: String(x.nombre ?? ''),
        descripcion: String(x.descripcion ?? ''),
        usuarioId: Number(x.usuarioId),
        prioridad: PRIORIDADES.includes(x.prioridad) ? x.prioridad : 'Media',
        estatus: estatusValidos.has(x.estatus) ? x.estatus : 'No iniciado',
        fechaCaptura: String(x.fechaCaptura ?? x.fechaActualizacion ?? ''),
        fechaActualizacion: x.fechaActualizacion ? String(x.fechaActualizacion) : undefined,
        activo: x.activo !== false,
        criterios
      }

      if (historia.estatus === 'Finalizado' && criteriosPendientes(historia) > 0) {
        historia.estatus = 'En proceso'
      }

      return historia
    })

  // Numeración consecutiva por sistema.
  const porSistema = new Map<number, HistoriaUsuario[]>()
  for (const h of historias) {
    porSistema.set(h.sistemaId, [...(porSistema.get(h.sistemaId) ?? []), h])
  }

  for (const lista of porSistema.values()) {
    const usados = new Set<number>()
    let max = 0

    for (const h of lista) {
      if (Number.isInteger(h.numero) && h.numero > 0) max = Math.max(max, h.numero)
    }

    for (const h of [...lista].sort((a, b) => a.id - b.id)) {
      if (Number.isInteger(h.numero) && h.numero > 0 && !usados.has(h.numero)) {
        usados.add(h.numero)
      } else {
        h.numero = ++max
        usados.add(h.numero)
      }
    }
  }

  return historias
}
