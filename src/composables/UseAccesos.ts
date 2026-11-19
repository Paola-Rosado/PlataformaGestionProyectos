/*
  USUARIOS Y ROLES POR SISTEMA

  - Cada usuario pertenece a un sistema (sistemaId).
  - Los roles disponibles dependen de la metodología del sistema:
    Scrum tiene sus roles, Kanban los suyos, etc.
  - El módulo de Roles se descartó: los roles solo se eligen
    en el combo del formulario de Usuarios.

  Las variables se declaran fuera de la función para que
  todas las vistas trabajen sobre los mismos datos.

  IMPORTANTE: mientras no haya base de datos, los usuarios se guardan en
  el navegador (ver UseAlmacenamiento.ts). Los registros y roles de
  ejemplo deben validarse y sustituirse por la base de datos.
*/
import { refPersistente } from './UseAlmacenamiento'
import type { Usuario } from '../interfaces/Usuario'

// ======================================================
// CAMBIO AÑADIDO:
// Contraseña predeterminada para los nuevos usuarios.
// ======================================================
const PASSWORD_DEFAULT = '123456'
// FIN DEL CAMBIO AÑADIDO.

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

const usuarios = refPersistente<Usuario>('usuarios', [
  { id: 1, sistemaId: 1, correo: 'Rubyl@gmail.com', nombre: 'Ruby', apellidoPaterno: 'Sosa', apellidoMaterno: '', rol: 'Product Owner', activo: true },
  { id: 2, sistemaId: 1, correo: 'monserrath@gmail.com', nombre: 'Monserrath', apellidoPaterno: 'Dzul', apellidoMaterno: '', rol: 'Equipo de desarrollo', activo: true },
  { id: 3, sistemaId: 2, correo: 'paola@gmail.com', nombre: 'Paola', apellidoPaterno: 'Pech', apellidoMaterno: '', rol: 'Gestor de entrega de servicio', activo: true },
  { id: 4, sistemaId: 3, correo: 'gabriela@gmail.com', nombre: 'Gabriela', apellidoPaterno: 'Cuellar', apellidoMaterno: '', rol: 'Gerente de proyecto', activo: true }
])

// ======================================================
// CAMBIO AÑADIDO:
// Conserva las contraseñas originales de los usuarios
// de prueba para que puedan seguir ingresando normalmente.
// ======================================================
const passwordsOriginales: Record<string, string> = {
  'paola@gmail.com': '1234',
  'rubyl@gmail.com': '5678',
  'monserrath@gmail.com': '5678',
  'gabriela@gmail.com': '9012'
}

// Asigna una contraseña a los usuarios registrados
// anteriormente que todavía no cuentan con una.
usuarios.value.forEach(usuario => {
  if (!usuario.password) {
    usuario.password =
      passwordsOriginales[usuario.correo.trim().toLowerCase()]
      ?? PASSWORD_DEFAULT
  }
})
// FIN DEL CAMBIO AÑADIDO.

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

    // ======================================================
    // CAMBIO AÑADIDO:
    // Asigna automáticamente una contraseña al usuario nuevo.
    // Si el correo ya existe en otro sistema, conserva
    // la contraseña que tiene asignada.
    // ======================================================

    const existente = usuarios.value.find(u =>
      u.correo.trim().toLowerCase() === datos.correo.trim().toLowerCase()
    )

    const nuevoUsuario: Usuario = {
      id: siguienteId,
      ...datos,
      password: existente?.password ??
        passwordsOriginales[datos.correo.trim().toLowerCase()] ??
        PASSWORD_DEFAULT
    }

    usuarios.value.push(nuevoUsuario)

    // Devuelve los datos del usuario registrado para mostrar
    // su correo y contraseña en el mensaje de confirmación.
    return nuevoUsuario

    // FIN DEL CAMBIO AÑADIDO.
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

  // ======================================================
  // CAMBIO AÑADIDO ANTERIORMENTE:
  // VALIDACIÓN DEL ESTADO DEL USUARIO.
  //
  // Verifica si el usuario está activo o desactivado.
  // Si está desactivado, no podrá iniciar sesión.
  // Si vuelve a activarse, podrá ingresar normalmente.
  // Si pertenece a varios sistemas, debe estar activo
  // en al menos uno de ellos.
  // ======================================================
  function usuarioEstaActivo(correo: string): boolean {
    if (typeof correo !== 'string') return false

    const buscado = correo.trim().toLowerCase()

    return usuarios.value.some(u =>
      u.correo.trim().toLowerCase() === buscado &&
      u.activo === true
    )
  }
  // FIN DEL CAMBIO AÑADIDO.

  // ======================================================
  // CAMBIO AÑADIDO:
  // VALIDACIÓN DE CREDENCIALES DE LOS USUARIOS REGISTRADOS.
  //
  // Busca al usuario mediante su correo y contraseña.
  // Permite iniciar sesión a los usuarios nuevos sin
  // agregarlos manualmente al código del Login.
  //
  // Si el usuario está desactivado, devuelve su registro
  // para que el Login muestre el mensaje correspondiente.
  // ======================================================
  function buscarUsuarioLogin(correo: string, password: string) {

    const buscado = correo.trim().toLowerCase()

    const coincidencias = usuarios.value.filter(u =>
      u.correo.trim().toLowerCase() === buscado &&
      u.password === password
    )

    return coincidencias.find(u => u.activo === true)
      ?? coincidencias[0]
  }
  // FIN DEL CAMBIO AÑADIDO.

  return {
    usuarios,
    rolesDeMetodologia,
    usuariosDeSistema,
    nombreCompleto,
    correoExiste,
    agregarUsuario,
    actualizarUsuario,
    alternarActivo,

    // CAMBIO AÑADIDO ANTERIORMENTE:
    // Permite verificar el estado desde el Login y Router.
    usuarioEstaActivo,

    // CAMBIO AÑADIDO:
    // Permite validar las credenciales de los usuarios nuevos.
    buscarUsuarioLogin
  }
}