// Estatus de avance de una historia y de sus criterios de aceptación.
export type EstatusAvance = 'No iniciado' | 'En proceso' | 'Finalizado'

// Criterio de aceptación: detalle de una historia de usuario.
export interface CriterioAceptacion {
  id: number
  // Texto, máximo 300 caracteres.
  nombre: string
  // Área de texto, máximo 500 caracteres.
  descripcion: string
  // Por defecto 'No iniciado'.
  estatus: EstatusAvance
}

// Historia de usuario (requerimiento).
export interface HistoriaUsuario {
  id: number
  // Número consecutivo dentro de su sistema (1, 2, 3…). Se asigna al
  // registrar la historia y no cambia aunque otras se desactiven.
  numero: number
  // Sistema al que pertenece.
  sistemaId: number
  // Texto, máximo 300 caracteres.
  nombre: string
  // Área de texto, máximo 500 caracteres.
  descripcion: string
  // ID del usuario que proporcionó el requerimiento (product owner / stakeholder).
  usuarioId: number
  prioridad: 'Alta' | 'Media' | 'Baja'
  // 'Finalizado' solo si tiene criterios y todos están finalizados.
  estatus: EstatusAvance
  // Fecha y hora en que se capturó (no cambia al editar).
  fechaCaptura: string
  fechaActualizacion?: string
  // false = historia desactivada (no se elimina, solo se desactiva).
  activo: boolean
  criterios: CriterioAceptacion[]
}


