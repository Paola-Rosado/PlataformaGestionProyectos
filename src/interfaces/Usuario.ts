export interface Usuario {
  id: number
  // Sistema al que pertenece el usuario.
  sistemaId: number
  // El correo funciona como nombre de usuario.
  correo: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  // Rol dentro del sistema (depende de su metodología).
  rol: string
  activo: boolean

  // Contraseña asignada al registrar un nuevo usuario.
  // Es opcional para conservar los registros anteriores.
  password?: string
}