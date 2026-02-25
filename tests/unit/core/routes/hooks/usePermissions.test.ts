import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions } from '@/core/routes/hooks/usePermissions'

vi.mock('@/core/store/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

describe('usePermissions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('admin has permission to any module', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({ user: { role: 'admin' } } as any)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('workflows')).toBe(true)
    expect(result.current.hasPermission('contacts')).toBe(true)
    expect(result.current.hasPermission('administration')).toBe(true)
  })

  it('agent has permission to contacts but not administration', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({ user: { role: 'agent' } } as any)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('contacts')).toBe(true)
    expect(result.current.hasPermission('dashboard')).toBe(true)
    expect(result.current.hasPermission('administration')).toBe(false)
  })

  it('viewer cannot access kanban or workflows', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({ user: { role: 'viewer' } } as any)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('dashboard')).toBe(true)
    expect(result.current.hasPermission('contacts')).toBe(true)
    expect(result.current.hasPermission('kanban')).toBe(false)
    expect(result.current.hasPermission('administration')).toBe(false)
  })

  it('hasAnyPermission returns true when user has at least one', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({ user: { role: 'agent' } } as any)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasAnyPermission(['administration', 'contacts'])).toBe(true)
  })

  it('hasAnyPermission with requireAll returns false when missing one', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({ user: { role: 'agent' } } as any)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasAnyPermission(['administration', 'contacts'], true)).toBe(false)
  })

  it('returns no permissions when user is null', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({ user: null } as any)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('dashboard')).toBe(false)
  })
})
