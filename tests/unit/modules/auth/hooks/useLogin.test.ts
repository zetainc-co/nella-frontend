import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const mockSetSession = vi.fn()
const mockSetUser = vi.fn()
vi.mock('@/core/store/auth-store', () => ({
  useAuthStore: () => ({
    setSession: mockSetSession,
    setUser: mockSetUser,
    setTenantSubdomain: vi.fn(),
  }),
}))

vi.mock('@/modules/auth/services/auth-service', () => ({
  authService: {
    login: vi.fn(),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useLogin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /dashboard on successful login', async () => {
    const { authService } = await import('@/modules/auth/services/auth-service')
    const { useLogin } = await import('@/modules/auth/hooks/useLogin')

    vi.mocked(authService.login).mockResolvedValue({
      user: {
        id: 'u1',
        email: 'a@b.com',
        fullName: 'Test',
        tenantId: 't1',
        tenantSlug: 'acme',
        role: 'admin',
        emailVerified: true,
        createdAt: '',
      },
      session: {
        userId: 'u1',
        tenantId: 't1',
        tenantSlug: 'acme',
        email: 'a@b.com',
        fullName: 'Test',
        role: 'admin',
        accessToken: 'tok',
        refreshToken: 'ref',
        loginAt: '',
      },
    })

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ email: 'a@b.com', password: 'pass1234' })
    })

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows error toast on failed login', async () => {
    const { toast } = await import('sonner')
    const { authService } = await import('@/modules/auth/services/auth-service')
    const { useLogin } = await import('@/modules/auth/hooks/useLogin')

    vi.mocked(authService.login).mockRejectedValue(new Error('Credenciales invalidas'))

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ email: 'wrong@b.com', password: 'wrong' })
    })

    // useApiError shows error.message when no HTTP status is present
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Credenciales invalidas'))
    expect(mockPush).not.toHaveBeenCalled()
  })
})
