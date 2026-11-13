/*
  LISTAS QUE SE GUARDAN EN EL NAVEGADOR

  Mientras no exista una base de datos, las listas (sistemas, usuarios e
  historias con sus criterios) se guardan en el localStorage del navegador.
  Así sobreviven a recargar la página (F5) o a reiniciar el servidor.

  - Si no hay nada guardado, se usan los datos de ejemplo.
  - Cada cambio se guarda automáticamente.
  - Los datos son solo de ese navegador y de esa dirección (por ejemplo,
    localhost:5173 y 127.0.0.1:5173 NO comparten datos).

  Si cambias la estructura de los datos o los datos de ejemplo y no se
  reflejan, sube el número de VERSION para descartar lo guardado, o borra
  los datos del sitio desde las herramientas del navegador.

  DEPURAR: mientras está en true, la consola del navegador (F12) muestra
  cuándo se carga y cuándo se guarda cada lista. Ponlo en false cuando
  ya no lo necesites.
*/
import { ref, watch, type Ref } from 'vue'

const VERSION = 'v1'
const DEPURAR = true

function registrar(mensaje: string) {
  if (DEPURAR) console.info(`[plataforma] ${mensaje}`)
}

registrar(`almacenamiento listo en ${location.origin}`)

export function refPersistente<T>(nombre: string, inicial: T[]): Ref<T[]> {
  const clave = `plataforma:${VERSION}:${nombre}`
  let valor: T[] = inicial
  let origen = 'datos de ejemplo (no había nada guardado)'

  try {
    const guardado = localStorage.getItem(clave)

    if (guardado) {
      const datos: unknown = JSON.parse(guardado)

      if (Array.isArray(datos)) {
        valor = datos as T[]
        origen = 'cargado del navegador'
      }
    }
  } catch (error) {
    console.warn(`[plataforma] ${nombre}: no se pudo leer lo guardado`, error)
  }

  registrar(`${nombre}: ${origen}, ${valor.length} registro(s)`)

  const lista = ref(valor) as Ref<T[]>

  watch(
    lista,
    (nuevo) => {
      try {
        localStorage.setItem(clave, JSON.stringify(nuevo))
        registrar(`${nombre}: guardado, ${nuevo.length} registro(s)`)
      } catch (error) {
        console.warn(`[plataforma] ${nombre}: no se pudo guardar`, error)
      }
    },
    { deep: true }
  )

  return lista
}

