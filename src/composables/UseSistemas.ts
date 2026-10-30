/*
  LISTADO DE SISTEMAS COMPARTIDO

  El listado vive aquí (y no dentro de SystemsView) para que
  Usuarios y el resto de módulos puedan consultarlo, y para poder
  seleccionar un sistema por defecto desde cualquier vista.

  IMPORTANTE: por ahora los datos viven en memoria.
*/
import { ref } from 'vue'
import type { Sistema } from '../interfaces/Sistema'
import { useAccesos } from './UseAccesos'

const sistemas = ref<Sistema[]>([
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
    fechaActualizacion: '10/01/2026 10:00',
    activo: true
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
    fechaActualizacion: '01/02/2026 09:30',
    activo: true
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
    fechaActualizacion: '01/02/2026 09:30',
    activo: true
  }
])

// La selección por defecto se aplica una sola vez por carga de la página,
// para no volver a marcar un sistema que el usuario desmarcó a propósito.
let defectoAplicado = false

// Convierte "dd/mm/aaaa hh:mm" (con o sin a. m./p. m.) en un número comparable.
function marcaDeFecha(texto: string): number {
  const f = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!f) return 0

  const h = texto.match(/(\d{1,2}):(\d{2})[\s\u202f\u00a0]*([ap])?/i)
  let horas = h ? Number(h[1]) : 0
  const minutos = h ? Number(h[2]) : 0
  const sufijo = h?.[3]?.toLowerCase()

  if (sufijo === 'p' && horas < 12) horas += 12
  if (sufijo === 'a' && horas === 12) horas = 0

  return new Date(Number(f[3]), Number(f[2]) - 1, Number(f[1]), horas, minutos).getTime()
}

export function useSistemas() {
  const { usuarios } = useAccesos()

  // Sistema ACTIVO con la actualización más reciente (desempata por fecha de inicio).
  function sistemaMasReciente(): Sistema | null {
    const ordenados = sistemas.value.filter(s => s.activo).sort((a, b) =>
      marcaDeFecha(b.fechaActualizacion) - marcaDeFecha(a.fechaActualizacion) ||
      b.fechaInicio.localeCompare(a.fechaInicio) ||
      b.id - a.id
    )
    return ordenados[0] ?? null
  }

  /*
    Selecciona un sistema por defecto para ahorrar clics:
    - Administrador: el sistema más reciente.
    - Cualquier otro usuario: el sistema donde está dado de alta
      (por su correo). Si no está en ninguno, el más reciente.
  */
  function aplicarSistemaPorDefecto(
    actual: Sistema | null,
    seleccionar: (sistema: Sistema) => void
  ) {
    if (defectoAplicado) return
    defectoAplicado = true

    if (actual || sistemas.value.length === 0) return

    let sesion: { correo?: string; rol?: string } | null = null
    try {
      const guardado = localStorage.getItem('user')
      sesion = guardado ? JSON.parse(guardado) : null
    } catch {
      sesion = null
    }

    let elegido: Sistema | null = null

    if (sesion?.rol !== 'Administrador' && sesion?.correo) {
      const correo = sesion.correo.toLowerCase()
      const membresia = usuarios.value.find(
        u => u.activo && u.correo.toLowerCase() === correo
      )
      elegido = sistemas.value.find(s => s.id === membresia?.sistemaId && s.activo) ?? null
    }

    elegido = elegido ?? sistemaMasReciente()

    if (elegido) seleccionar(elegido)
  }

  return {
    sistemas,
    aplicarSistemaPorDefecto
  }
}
