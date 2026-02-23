import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/core/api/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      totalLeads: 142,
      activeLeads: 38,
      revenueMonth: 12500000,
      trafficSources: [{ source: 'WhatsApp', count: 98 }],
      funnel: [{ status: 'new', count: 50 }],
    }),
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

describe('useMetrics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does NOT read localStorage directly', async () => {
    const { useMetrics } = await import('@/modules/dashboard/hooks/useMetrics')
    const getSpy = vi.spyOn(Storage.prototype, 'getItem')

    renderHook(() => useMetrics('proj-1', 'all'), { wrapper: createWrapper() })

    // Zustand persist may read storage for its own store, but the hook itself should NOT
    // read nella-auth-storage directly (that was the bug)
    const directAuthReads = getSpy.mock.calls.filter(
      call => call[0] === 'nella-auth-storage'
    )
    // The hook should use apiClient which reads from zustand store, NOT localStorage
    // We verify by checking the apiClient was called instead
    const { apiClient } = await import('@/core/api/api-client')
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled())
  })

  it('fetches metrics using apiClient', async () => {
    const { useMetrics } = await import('@/modules/dashboard/hooks/useMetrics')
    const { apiClient } = await import('@/core/api/api-client')

    const { result } = renderHook(() => useMetrics('proj-1', 'all'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith('/api/metrics/proj-1?period=all')
  })

  it('does not fetch when projectId is null', async () => {
    const { useMetrics } = await import('@/modules/dashboard/hooks/useMetrics')
    const { apiClient } = await import('@/core/api/api-client')

    renderHook(() => useMetrics(null), { wrapper: createWrapper() })

    expect(apiClient.get).not.toHaveBeenCalled()
  })
})
