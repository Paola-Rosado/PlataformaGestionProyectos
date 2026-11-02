/*
  USUARIOS Y ROLES POR SISTEMA

  - Cada usuario pertenece a un sistema (sistemaId).
  - Los roles disponibles dependen de la metodología del sistema:
    Scrum tiene sus roles, Kanban los suyos, etc.
  - El módulo de Roles se descartó: los roles solo se eligen
    en el combo del formulario de Usuarios.

  Las variables se declaran fuera de la función para que
  todas las vistas trabajen sobre los mismos datos.

  IMPORTANTE: por ahora los datos viven en memoria.
  Los registros y roles de ejemplo deben validarse y sustituirse
  por la base de datos.
*/
import { ref } from 'vue'
import type { Usuario } from '../interfaces/Usuario'

// Las llaves deben coincidir con el nombre de la metodología del sistema.
const rolesPorMetodologia: Record<string, string[]> = {
  'Scrum': ['Product Owner', 'Scrum Master', 'Equipo de desarrollo'],
  'Programación Extrema (XP)': [
    'Cliente', 'Programador', 'Entrenador (Coach)',
    'Rastreador (Tracker)', 'Probador (Tester)'
  ],
  'Kanban': [
    'Gestor de solicitudes de servicio',
    'Gestor de entrega de servicio',
    'Miembro del equipo'
  ],
  'Cascada': [
    'Gerente de proyecto', 'Analista', 'Diseñador',
    'Programador', 'Probador (QA)'
  ],
  'Espiral': [
    'Gerente de proyecto', 'Analista de riesgos', 'Arquitecto',
    'Programador', 'Evaluador'
  ]
}

const usuarios = ref<Usuario[]>([
  { id: 1, sistemaId: 1, correo: 'Rubyl@gmail.com', nombre: 'Ruby', apellidoPaterno: 'Sosa', apellidoMaterno: '', rol: 'Product Owner', activo: true },
  { id: 2, sistemaId: 1, correo: 'monserrath@gmail.com', nombre: 'Monserrath', apellidoPaterno: 'Dzul', apellidoMaterno: '', rol: 'Equipo de desarrollo', activo: true },
  { id: 3, sistemaId: 2, correo: 'paola@gmail.com', nombre: 'Paola', apellidoPaterno: 'Pech', apellidoMaterno: '', rol: 'Gestor de entrega de servicio', activo: true },
  { id: 4, sistemaId: 3, correo: 'gabriela@gmail.com', nombre: 'Gabriela', apellidoPaterno: 'Cuellar', apellidoMaterno: '', rol: 'Gerente de proyecto', activo: true }
])

export function useAccesos() {

  // Roles que se muestran en el combo según la metodología.
  function rolesDeMetodologia(metodologia: string) {
    return rolesPorMetodologia[metodologia] ?? []
  }

  function usuariosDeSistema(sistemaId: number) {
    return usuarios.value.filter(u => u.sistemaId === sistemaId)
  }

  // "Nombre Apellido Apellido" sin espacios sobrantes.
  function nombreCompleto(usuario: Usuario) {
    return [usuario.nombre, usuario.apellidoPaterno, usuario.apellidoMaterno]
      .filter(Boolean)
      .join(' ')
  }

  // El correo es el nombre de usuario: no se repite dentro del mismo sistema.
  function correoExiste(sistemaId: number, correo: string, ignorarId?: number) {
    const buscado = correo.trim().toLowerCase()
    return usuarios.value.some(u =>
      u.sistemaId === sistemaId &&
      u.id !== ignorarId &&
      u.correo.toLowerCase() === buscado
    )
  }

  // El ID es el mayor existente + 1.
  function agregarUsuario(datos: Omit<Usuario, 'id'>) {
    const siguienteId = usuarios.value.reduce(
      (mayor, u) => Math.max(mayor, u.id), 0
    ) + 1

    usuarios.value.push({ id: siguienteId, ...datos })
  }

  function actualizarUsuario(id: number, datos: Omit<Usuario, 'id' | 'sistemaId'>) {
    const usuario = usuarios.value.find(u => u.id === id)
    if (usuario) Object.assign(usuario, datos)
  }

  // Activa o desactiva y devuelve el nuevo estado.
  function alternarActivo(id: number) {
    const usuario = usuarios.value.find(u => u.id === id)
    if (!usuario) return false
    usuario.activo = !usuario.activo
    return usuario.activo
  }

  return {
    usuarios,
    rolesDeMetodologia,
    usuariosDeSistema,
    nombreCompleto,
    correoExiste,
    agregarUsuario,
    actualizarUsuario,
    alternarActivo
  }
}
