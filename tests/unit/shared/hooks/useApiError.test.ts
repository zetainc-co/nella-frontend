import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useApiError } from '@/shared/hooks/useApiError'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

describe('useApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps 400 to validation error message', async () => {
    const { toast } = await import('sonner')
    const { result } = renderHook(() => useApiError())
    const err = Object.assign(new Error('Bad Request'), { status: 400 })
    result.current.handleError(err, { showToast: true })
    expect(toast.error).toHaveBeenCalledWith(
      'Datos inválidos, revisa el formulario'
    )
  })

  it('maps 401 error to Spanish session message', async () => {
    const { toast } = await import('sonner')
    const { result } = renderHook(() => useApiError())
    const err = Object.assign(new Error('Unauthorized'), { status: 401 })
    result.current.handleError(err, { showToast: true })
    expect(toast.error).toHaveBeenCalledWith(
      'Tu sesión expiró, inicia sesión nuevamente'
    )
  })

  it('maps 403 to permissions message', async () => {
    const { toast } = await import('sonner')
    const { result } = renderHook(() => useApiError())
    const err = Object.assign(new Error('Forbidden'), { status: 403 })
    result.current.handleError(err, { showToast: true })
    expect(toast.error).toHaveBeenCalledWith(
      'No tienes permisos para realizar esta acción'
    )
  })

  it('maps 404 to not found message', async () => {
    const { toast } = await import('sonner')
    const { result } = renderHook(() => useApiError())
    const err = Object.assign(new Error('Not Found'), { status: 404 })
    result.current.handleError(err, { showToast: true })
    expect(toast.error).toHaveBeenCalledWith(
      'El recurso solicitado no existe'
    )
  })

  it('maps 500 to generic server error', async () => {
    const { toast } = await import('sonner')
    const { result } = renderHook(() => useApiError())
    const err = Object.assign(new Error('Internal Server Error'), { status: 500 })
    result.current.handleError(err, { showToast: true })
    expect(toast.error).toHaveBeenCalledWith('Error interno, intenta de nuevo')
  })

  it('shows error.message when error has no status and message exists', async () => {
    const { toast } = await import('sonner')
    const { result } = renderHook(() => useApiError())
    result.current.handleError(new Error('Network error'), {
      showToast: true,
      fallbackMessage: 'Error al cargar contactos',
    })
    expect(toast.error).toHaveBeenCalledWith('Network error')
  })

  it('withErrorHandling returns success result', async () => {
    const { result } = renderHook(() => useApiError())
    const output = await result.current.withErrorHandling(
      async () => ({ id: 1 }),
      {}
    )
    expect(output).toEqual({ data: { id: 1 }, error: null, success: true })
  })

  it('withErrorHandling returns error result on failure', async () => {
    const { result } = renderHook(() => useApiError())
    const output = await result.current.withErrorHandling(
      async () => { throw new Error('oops') },
      { showToast: false }
    )
    expect(output.success).toBe(false)
    expect(output.error).toBeInstanceOf(Error)
  })
})
