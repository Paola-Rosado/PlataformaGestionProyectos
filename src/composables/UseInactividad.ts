// ======================================================
// 1. IMPORTACIONES
// ======================================================

import { onMounted, onUnmounted } from 'vue'

// ======================================================
// 2. CONTROL DEL TIEMPO DE INACTIVIDAD
// ======================================================

export function useInactividad(
  cerrarSesion: () => void,
  minutos = 15
) {

  // Convierte los minutos a milisegundos.
  const tiempoLimite = minutos * 60 * 1000

  // Guarda el temporizador.
  let temporizador: ReturnType<typeof setTimeout>

  // Guarda la última actividad del usuario.
  let ultimaActividad = Date.now()

  // Evita cerrar la sesión más de una vez.
  let sesionExpirada = false

  // Eventos que se consideran actividad del usuario.
  const eventos = [
    'mousemove',
    'mousedown',
    'keydown',
    'scroll',
    'touchstart'
  ]

  // ======================================================
  // 3. CERRAR SESIÓN POR INACTIVIDAD
  // ======================================================

  function expirarSesion() {

    if (sesionExpirada) return

    sesionExpirada = true

    clearTimeout(temporizador)

    // Elimina la sesión y regresa al Login.
    cerrarSesion()

    // Notifica al usuario.
    alert(
      'Tu sesión se ha cerrado automáticamente ' +
      'por inactividad. Por favor, vuelve a iniciar sesión.'
    )
  }

  // ======================================================
  // 4. VERIFICAR TIEMPO TRANSCURRIDO
  // ======================================================

  function verificarInactividad() {

    if (sesionExpirada) return

    const tiempoTranscurrido =
      Date.now() - ultimaActividad

    if (tiempoTranscurrido >= tiempoLimite) {

      expirarSesion()

    } else {

      clearTimeout(temporizador)

      temporizador = setTimeout(
        verificarInactividad,
        tiempoLimite - tiempoTranscurrido
      )
    }
  }

  // ======================================================
  // 5. REINICIAR TEMPORIZADOR
  // ======================================================

  function reiniciarTemporizador() {

    if (sesionExpirada) return

    // Comprueba si la sesión ya expiró.
    if (Date.now() - ultimaActividad >= tiempoLimite) {

      expirarSesion()

      return
    }

    // Actualiza la última actividad.
    ultimaActividad = Date.now()

    // Elimina el temporizador anterior.
    clearTimeout(temporizador)

    // Comienza nuevamente el contador.
    temporizador = setTimeout(
      verificarInactividad,
      tiempoLimite
    )
  }

  // ======================================================
  // 6. INICIAR MONITOREO
  // ======================================================

  onMounted(() => {

    ultimaActividad = Date.now()

    reiniciarTemporizador()

    // Detecta las acciones del usuario.
    eventos.forEach(evento => {

      window.addEventListener(
        evento,
        reiniciarTemporizador,
        true
      )
    })

    // Verifica la sesión al regresar a la pestaña.
    document.addEventListener(
      'visibilitychange',
      verificarInactividad
    )

    window.addEventListener(
      'focus',
      verificarInactividad
    )
  })

  // ======================================================
  // 7. DETENER MONITOREO AL CERRAR SESIÓN
  // ======================================================

  onUnmounted(() => {

    clearTimeout(temporizador)

    eventos.forEach(evento => {

      window.removeEventListener(
        evento,
        reiniciarTemporizador,
        true
      )
    })

    document.removeEventListener(
      'visibilitychange',
      verificarInactividad
    )

    window.removeEventListener(
      'focus',
      verificarInactividad
    )
  })
}