import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/core/api/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue([]),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    post: vi.fn().mockResolvedValue({}),
  },
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useContacts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('REGRESSION: fetches from /api/contacts not /contacts', async () => {
    const { apiClient } = await import('@/core/api/api-client')
    const { useContacts } = await import('@/modules/contacts/hooks/useContacts')

    renderHook(() => useContacts(), { wrapper: createWrapper() })
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled())

    const calledUrl = vi.mocked(apiClient.get).mock.calls[0][0] as string
    expect(calledUrl).toMatch(/^\/api\/contacts/)
    expect(calledUrl).not.toBe('/contacts')
  })

  it('calls PATCH /api/contacts/:id on update', async () => {
    const { apiClient } = await import('@/core/api/api-client')
    const { useUpdateContact } = await import('@/modules/contacts/hooks/useContacts')
    vi.mocked(apiClient.patch).mockResolvedValue({ id: 1, name: 'Updated' })

    const { result } = renderHook(() => useUpdateContact(), { wrapper: createWrapper() })
    await result.current.mutateAsync({ id: 1, payload: { name: 'Updated' } })

    expect(apiClient.patch).toHaveBeenCalledWith('/api/contacts/1', { name: 'Updated' })
  })

  it('shows success toast on update', async () => {
    const { toast } = await import('sonner')
    const { apiClient } = await import('@/core/api/api-client')
    const { useUpdateContact } = await import('@/modules/contacts/hooks/useContacts')
    vi.mocked(apiClient.patch).mockResolvedValue({ id: 1 })

    const { result } = renderHook(() => useUpdateContact(), { wrapper: createWrapper() })
    await result.current.mutateAsync({ id: 1, payload: { name: 'Test' } })

    expect(toast.success).toHaveBeenCalled()
  })
})
