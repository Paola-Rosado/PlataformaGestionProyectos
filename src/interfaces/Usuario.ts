export interface Usuario {
  id: number
  // El correo funciona como nombre de usuario.
  correo: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  activo: boolean
  // null = todavía no tiene rol asignado.
  rolId: number | null
}
