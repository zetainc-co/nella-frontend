import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/core/api/api-client'

// Mock the auth store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: () => ({
      session: {
        accessToken: 'test-token',
        tenantSlug: 'acme',
        refreshToken: 'test-refresh-token',
      },
      logout: vi.fn(),
      setSession: vi.fn(),
    }),
  },
}))

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
    )
  })

  it('injects Authorization header automatically', async () => {
    await apiClient.get('/api/contacts')
    expect(fetch).toHaveBeenCalledWith(
      '/api/contacts',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    )
  })

  it('injects X-Tenant-Id header automatically', async () => {
    await apiClient.get('/api/contacts')
    expect(fetch).toHaveBeenCalledWith(
      '/api/contacts',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Tenant-Id': 'acme',
        }),
      })
    )
  })

  it('returns parsed JSON on success', async () => {
    const result = await apiClient.get('/api/contacts')
    expect(result).toEqual({ data: 'ok' })
  })

  it('throws error with backend message on non-ok response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Contacto no encontrado' }), { status: 404 })
    )
    await expect(apiClient.get('/api/contacts/999')).rejects.toThrow('Contacto no encontrado')
  })

  it('throws generic error when backend has no message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 500 })
    )
    await expect(apiClient.get('/api/contacts')).rejects.toThrow('Error en la solicitud')
  })

  it('throws on 401 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
    )
    await expect(apiClient.get('/api/contacts')).rejects.toThrow('Sesión expirada')
  })

  it('attempts token refresh on 401 before logging out', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: 'new-token', refreshToken: 'new-refresh' }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
      )

    const result = await apiClient.get('/api/contacts')
    expect(result).toEqual({ data: 'ok' })
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('logs out when refresh token also fails', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Invalid refresh token' }), { status: 401 })
      )

    await expect(apiClient.get('/api/contacts')).rejects.toThrow('Sesión expirada')
  })

  it('does not attempt refresh on auth endpoints returning 401', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
    )

    await expect(apiClient.post('/api/auth/login', { email: 'a', password: 'b' }))
      .rejects.toThrow()
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
