/*
  ESTADO COMPARTIDO DE USUARIOS Y ROLES

  Las variables se declaran fuera de la función para que
  UsersView y RolesView trabajen sobre los mismos datos
  (igual que SistemaActivo en router/index.ts).

  Así, si asignas un rol desde Usuarios, también se ve
  reflejado en Roles, y viceversa.

  IMPORTANTE: por ahora los datos viven en memoria.
  Los registros de ejemplo deben sustituirse por la base de datos.
*/
import { ref } from 'vue'
import type { Usuario } from '../interfaces/Usuario'
import type { Rol } from '../interfaces/Rol'

const roles = ref<Rol[]>([
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo a todos los módulos.' },
  { id: 2, nombre: 'Líder de proyecto', descripcion: 'Gestiona los sistemas y su equipo.' },
  { id: 3, nombre: 'Desarrollador', descripcion: 'Consulta y actualiza el avance de los sistemas.' }
])

const usuarios = ref<Usuario[]>([
  { id: 1, correo: 'Rubyl@gmail.com', nombre: 'Ruby', apellidoPaterno: 'Sosa', apellidoMaterno: '', activo: true, rolId: 1 },
  { id: 2, correo: 'Paola@gmail.com', nombre: 'Paola', apellidoPaterno: 'Pech', apellidoMaterno: '', activo: true, rolId: 2 },
  { id: 3, correo: 'gabriela@gmail.com', nombre: 'Gabriela', apellidoPaterno: 'Cuellar', apellidoMaterno: '', activo: false, rolId: null }
])

export function useAccesos() {

  // "Nombre Apellido Apellido" sin espacios sobrantes.
  function nombreCompleto(usuario: Usuario) {
    return [usuario.nombre, usuario.apellidoPaterno, usuario.apellidoMaterno]
      .filter(Boolean)
      .join(' ')
  }

  function nombreRol(rolId: number | null) {
    return roles.value.find(rol => rol.id === rolId)?.nombre ?? 'Sin rol'
  }

  function usuariosDeRol(rolId: number) {
    return usuarios.value.filter(usuario => usuario.rolId === rolId)
  }

  function correoExiste(correo: string) {
    const buscado = correo.trim().toLowerCase()
    return usuarios.value.some(u => u.correo.toLowerCase() === buscado)
  }

  // El ID es consecutivo: el mayor existente + 1.
  function agregarUsuario(
    datos: Pick<Usuario, 'correo' | 'nombre' | 'apellidoPaterno' | 'apellidoMaterno'>
  ) {
    const siguienteId = usuarios.value.reduce(
      (mayor, u) => Math.max(mayor, u.id), 0
    ) + 1

    usuarios.value.push({
      id: siguienteId,
      ...datos,
      activo: true,
      rolId: null
    })
  }

  // Activa o desactiva y devuelve el nuevo estado.
  function alternarActivo(usuarioId: number) {
    const usuario = usuarios.value.find(u => u.id === usuarioId)
    if (!usuario) return false
    usuario.activo = !usuario.activo
    return usuario.activo
  }

  // Un usuario tiene un solo rol: asignar uno nuevo reemplaza el anterior.
  function asignarRol(usuarioId: number, rolId: number) {
    const usuario = usuarios.value.find(u => u.id === usuarioId)
    if (usuario) usuario.rolId = rolId
  }

  return {
    usuarios,
    roles,
    nombreCompleto,
    nombreRol,
    usuariosDeRol,
    correoExiste,
    agregarUsuario,
    alternarActivo,
    asignarRol
  }
}
