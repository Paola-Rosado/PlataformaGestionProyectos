/*
  LISTADO DE HISTORIAS DE USUARIO COMPARTIDO

  El listado vive aquí (y no dentro de HistoriasView) para que no se
  pierda al cambiar de módulo o de sistema: una vista de Vue se destruye
  al salir de ella, y con ella los datos que tuviera guardados dentro.

  Cada historia pertenece a un sistema (sistemaId) y guarda sus
  criterios de aceptación.

  IMPORTANTE: mientras no haya base de datos, las historias y sus criterios
  se guardan en el navegador (ver UseAlmacenamiento.ts).
*/
import { refPersistente } from './UseAlmacenamiento'
import type { HistoriaUsuario } from '../interfaces/HistoriaUsuario'

// Las variables se declaran fuera de la función para que todas las
// vistas trabajen sobre los mismos datos (datos de ejemplo).
const historias = refPersistente<HistoriaUsuario>('historias', [
  {
    id: 1,
    sistemaId: 1,
    nombre: 'Autenticación de usuarios',
    descripcion: 'Permitir inicio de sesión mediante credenciales.',
    usuarioId: 2,
    prioridad: 'Alta',
    estatus: 'En proceso',
    fechaCaptura: '01/11/2026 08:30',
    fechaActualizacion: '01/11/2026 08:30',
    activo: true,
    criterios: [
      {
        id: 1,
        nombre: 'Inicio de sesión válido',
        descripcion: 'El usuario accede al panel al escribir credenciales correctas.',
        estatus: 'En proceso'
      }
    ]
  },
  {
    id: 2,
    sistemaId: 1,
    nombre: 'Módulo de reportes',
    descripcion: 'Generar reporte en formato PDF de los registros.',
    usuarioId: 1,
    prioridad: 'Media',
    estatus: 'No iniciado',
    fechaCaptura: '01/11/2026 09:15',
    fechaActualizacion: '01/11/2026 09:15',
    activo: true,
    criterios: []
  }
])

export function useHistorias() {
  return {
    historias
  }
}
