import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthValidation } from '@/core/routes/hooks/useAuthValidation'

vi.mock('@/core/store/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

describe('useAuthValidation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns isValid=true when authenticated with token and tenantId', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      session: {
        accessToken: 'valid-token',
        tenantId: 'tenant-1',
        refreshToken: 'rt',
        userId: 'u1',
        tenantSlug: 'acme',
        email: 'a@b.com',
        fullName: 'Test',
        role: 'admin',
        loginAt: new Date().toISOString(),
      },
      user: null,
    } as any)

    const { result } = renderHook(() => useAuthValidation())
    expect(result.current.isValid).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns isValid=false when not authenticated', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      session: null,
      user: null,
    } as any)

    const { result } = renderHook(() => useAuthValidation())
    expect(result.current.isValid).toBe(false)
  })

  it('returns isValid=false when session has no tenantId', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      session: {
        accessToken: 'valid-token',
        tenantId: '',
        refreshToken: 'rt',
        userId: 'u1',
        tenantSlug: '',
        email: 'a@b.com',
        fullName: 'Test',
        role: 'admin',
        loginAt: new Date().toISOString(),
      },
      user: null,
    } as any)

    const { result } = renderHook(() => useAuthValidation())
    expect(result.current.isValid).toBe(false)
  })

  it('returns isLoading=true when store is loading', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      session: null,
      user: null,
    } as any)

    const { result } = renderHook(() => useAuthValidation())
    expect(result.current.isLoading).toBe(true)
  })
})
