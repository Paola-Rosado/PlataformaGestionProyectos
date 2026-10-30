export interface Sistema {
  id: number
  nombre: string
  descripcion: string
  correoResponsable: string,
  nombreResponsable: string,
  fechaInicio: string
  fechaFinalizacion: string
  metodologia: string
  estatus: string
  fechaActualizacion: string
  // false = sistema desactivado (no se elimina, solo se desactiva).
  activo: boolean
}