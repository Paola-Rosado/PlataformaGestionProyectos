// Criterio de aceptación: detalle de una historia de usuario.
export interface CriterioAceptacion {
  id: number
  // Texto, máximo 300 caracteres.
  nombre: string
  // Área de texto, máximo 500 caracteres.
  descripcion: string
}

// Historia de usuario (requerimiento).
export interface HistoriaUsuario {
  id: number
  // Sistema al que pertenece.
  sistemaId: number
  // Texto, máximo 300 caracteres.
  nombre: string
  // Área de texto, máximo 500 caracteres.
  descripcion: string
  // ID del usuario que proporcionó el requerimiento (product owner / stakeholder).
  usuarioId: number
  prioridad: 'Alta' | 'Media' | 'Baja'
  estatus: 'Planeación' | 'En desarrollo' | 'En pruebas' | 'Finalizado'
  // Fecha y hora en que se capturó (no cambia al editar).
  fechaCaptura: string
  fechaActualizacion?: string
  // false = historia desactivada (no se elimina, solo se desactiva).
  activo: boolean
  criterios: CriterioAceptacion[]
}
