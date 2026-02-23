import { toast } from 'sonner'

interface HandleErrorOptions {
  showToast?: boolean
  fallbackMessage?: string
  logToConsole?: boolean
}

interface ApiError extends Error {
  status?: number
}

function getMessageForStatus(error: ApiError, fallback?: string): string {
  const status = error.status
  if (status === 401) return 'Tu sesión expiró, inicia sesión nuevamente'
  if (status === 403) return 'No tienes permisos para realizar esta acción'
  if (status === 404) return 'El recurso solicitado no existe'
  if (status && status >= 500) return 'Error interno, intenta de nuevo'
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'No hay conexión con el servidor'
  return fallback ?? error.message ?? 'Ocurrió un error inesperado'
}

export function useApiError() {
  function handleError(error: unknown, options: HandleErrorOptions = {}) {
    const { showToast = true, fallbackMessage, logToConsole = false } = options
    const apiError = error instanceof Error ? (error as ApiError) : new Error(String(error))
    const message = getMessageForStatus(apiError, fallbackMessage)

    if (logToConsole) console.error('[useApiError]', error)
    if (showToast) toast.error(message)
  }

  async function withErrorHandling<T>(
    operation: () => Promise<T>,
    options: HandleErrorOptions
  ): Promise<{ data: T | null; error: Error | null; success: boolean }> {
    try {
      const data = await operation()
      return { data, error: null, success: true }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      handleError(err, options)
      return { data: null, error: err, success: false }
    }
  }

  return { handleError, withErrorHandling }
}
