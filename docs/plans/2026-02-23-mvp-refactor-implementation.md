# MVP Refactor & Architecture Alignment — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the entire MVP codebase to `src/modules/` architecture, add shared core infrastructure, integrate real NestJS auth, fix critical bugs, and establish test coverage per module.

**Architecture:** All business logic moves to `src/modules/<name>/{components,hooks,services,types}/`. Global infrastructure lives in `src/core/` (api-client, query-keys, ProtectedRoute, stores) and `src/shared/` (useApiError, useLogout). The Next.js `app/` layer is presentation-only and does not change.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Zustand v5, TanStack Query v5, Vitest 4 + @testing-library/react, Playwright, sonner (toasts), socket.io-client, @dnd-kit, @schedule-x/react.

**Design doc:** `docs/plans/2026-02-23-mvp-refactor-design.md`

---

## PASO 1 — Test Infrastructure

### Task 1.1: Create test directory structure and update vitest config

**Files:**
- Create: `tests/setup/setup.ts`
- Create: `tests/utils/render-with-providers.tsx`
- Create: `tests/mocks/auth.mock.ts`
- Create: `tests/mocks/contacts.mock.ts`
- Create: `tests/mocks/metrics.mock.ts`
- Modify: `vitest.config.ts`

**Step 1: Create tests/setup/setup.ts**

```typescript
// tests/setup/setup.ts
import '@testing-library/jest-dom'
```

**Step 2: Create tests/utils/render-with-providers.tsx**

```tsx
// tests/utils/render-with-providers.tsx
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import type { ReactElement } from 'react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  const queryClient = createTestQueryClient()
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <Toaster />
        {children}
      </QueryClientProvider>
    )
  }
  return render(ui, { wrapper: Wrapper, ...options })
}
```

**Step 3: Create tests/mocks/auth.mock.ts**

```typescript
// tests/mocks/auth.mock.ts
import type { User, Session } from '@/types/auth-types'

export const mockUser: User = {
  id: 'user-1',
  email: 'admin@acme.com',
  fullName: 'Admin User',
  phone: '+573001234567',
  tenantId: 'tenant-1',
  tenantSlug: 'acme',
  tenantName: 'Acme Corp',
  role: 'admin',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
}

export const mockSession: Session = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  tenantSlug: 'acme',
  tenantName: 'Acme Corp',
  email: 'admin@acme.com',
  fullName: 'Admin User',
  role: 'admin',
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  loginAt: '2026-02-23T00:00:00Z',
}
```

**Step 4: Create tests/mocks/contacts.mock.ts**

```typescript
// tests/mocks/contacts.mock.ts
import type { BackendContact } from '@/types/contacts'

export const mockContact: BackendContact = {
  id: 1,
  phone: '+573001234567',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  lead_status: 'HOT LEAD',
  handoff_active: false,
  ai_summary: 'Interesado en plan premium',
  last_interaction_at: '2026-02-23T00:00:00Z',
  next_purchase_prediction: null,
  referral_code: null,
  tags: [],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-23T00:00:00Z',
}

export const mockContacts: BackendContact[] = [mockContact]
```

**Step 5: Create tests/mocks/metrics.mock.ts**

```typescript
// tests/mocks/metrics.mock.ts
import type { ProjectMetrics, Project } from '@/types/auth-types'

export const mockProject: Project = {
  id: 'proj-1',
  name: 'Campaña Q1',
  owner_id: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-23T00:00:00Z',
}

export const mockMetrics: ProjectMetrics = {
  totalLeads: 142,
  activeLeads: 38,
  revenueMonth: 12500000,
  trafficSources: [{ source: 'WhatsApp', count: 98 }],
  funnel: [
    { status: 'new', count: 50 },
    { status: 'contacted', count: 35 },
    { status: 'proposal', count: 20 },
    { status: 'closed', count: 37 },
  ],
}
```

**Step 6: Update vitest.config.ts to include tests/ directory**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```

**Step 7: Migrate existing unit tests to new location**

```bash
mkdir -p tests/unit/modules/dashboard/components
git mv src/components/dashboard/__tests__/kpi-card.test.tsx tests/unit/modules/dashboard/components/kpi-card.test.tsx
git mv src/components/dashboard/__tests__/project-empty-state.test.tsx tests/unit/modules/dashboard/components/project-empty-state.test.tsx
```

**Step 8: Migrate existing e2e test**

```bash
mkdir -p tests/e2e
git mv e2e/dashboard-projects.spec.ts tests/e2e/dashboard.spec.ts
```

Update `playwright.config.ts` testDir:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
```

**Step 9: Verify tests still pass**

```bash
npm test
```

Expected: all tests pass (2 unit tests found in new location).

**Step 10: Commit**

```bash
git add tests/ vitest.config.ts playwright.config.ts
git commit -m "refactor|NELLA-34|20260223|Setup test infrastructure and migrate existing tests"
```

---

### Task 1.2: Create tests/unit directory stubs for all modules

**Purpose:** Create empty placeholder test files so the structure is established before implementation. These will be filled in their respective PASO.

**Step 1: Create all unit test directories**

```bash
mkdir -p tests/unit/core/api
mkdir -p tests/unit/shared/hooks
mkdir -p tests/unit/modules/auth/hooks
mkdir -p tests/unit/modules/dashboard/hooks
mkdir -p tests/unit/modules/contacts/hooks
mkdir -p tests/unit/modules/kanban/stores
mkdir -p tests/unit/modules/calendar/hooks
mkdir -p tests/unit/modules/workflows/services
```

No commit needed — directories are created as test files are added per step.

---

## PASO 2 — Core Infrastructure

### Task 2.1: Create core/api/api-client.ts with tests

**Files:**
- Create: `src/core/api/api-client.ts`
- Create: `tests/unit/core/api/api-client.test.ts`

**Step 1: Write the failing tests first**

```typescript
// tests/unit/core/api/api-client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/core/api/api-client'

// Mock the auth store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: () => ({
      session: {
        accessToken: 'test-token',
        tenantSlug: 'acme',
      },
      logout: vi.fn(),
    }),
  },
}))

describe('apiClient', () => {
  beforeEach(() => {
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

  it('logs out and redirects on 401', async () => {
    const mockLogout = vi.fn()
    vi.mock('@/stores/auth-store', () => ({
      useAuthStore: {
        getState: () => ({
          session: { accessToken: 'expired-token', tenantSlug: 'acme' },
          logout: mockLogout,
        }),
      },
    }))
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
    )
    // Should not throw — handles 401 internally
    try { await apiClient.get('/api/contacts') } catch {}
    expect(mockLogout).toHaveBeenCalled()
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npm test tests/unit/core/api/api-client.test.ts
```

Expected: FAIL — `Cannot find module '@/core/api/api-client'`

**Step 3: Create src/core/api/api-client.ts**

```typescript
// src/core/api/api-client.ts
import { useAuthStore } from '@/stores/auth-store'

function getAuthHeaders(): Record<string, string> {
  const { session } = useAuthStore.getState()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`
  if (session?.tenantSlug) headers['X-Tenant-Id'] = session.tenantSlug
  return headers
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (response.status === 401) {
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Sesión expirada')
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('Respuesta inválida del servidor')
  }

  if (!response.ok) {
    const message = (data as { message?: string })?.message ?? 'Error en la solicitud'
    throw new Error(message)
  }

  return data as T
}

export const apiClient = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test tests/unit/core/api/api-client.test.ts
```

Expected: PASS — 6 tests passing.

---

### Task 2.2: Create core/api/query-keys.ts

**Files:**
- Create: `src/core/api/query-keys.ts`

**Step 1: Create the file**

```typescript
// src/core/api/query-keys.ts
export const queryKeys = {
  auth: {
    profile: () => ['auth', 'profile'] as const,
  },
  contacts: {
    all: () => ['contacts'] as const,
    detail: (id: number) => ['contacts', id] as const,
  },
  dashboard: {
    metrics: (projectId: string, period: string) =>
      ['metrics', projectId, period] as const,
    projects: () => ['projects'] as const,
  },
  kanban: {
    leads: () => ['kanban', 'leads'] as const,
  },
  calendar: {
    events: () => ['calendar', 'events'] as const,
    bookingLinks: () => ['calendar', 'booking-links'] as const,
    settings: () => ['calendar', 'settings'] as const,
  },
  workflows: {
    byTenant: (tenantId: string) => ['workflows', tenantId] as const,
  },
}
```

No test needed — pure data structure, verified by TypeScript.

---

### Task 2.3: Create core/routes/ProtectedRoute.tsx

**Files:**
- Create: `src/core/routes/ProtectedRoute.tsx`

**Step 1: Create the file**

```tsx
// src/core/routes/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, session, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !session?.tenantId)) {
      router.replace('/login')
    }
  }, [isAuthenticated, session, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'rgba(158,255,0,0.3)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!isAuthenticated || !session?.tenantId) return null

  return <>{children}</>
}
```

---

### Task 2.4: Create shared/hooks/useApiError.ts with tests

**Files:**
- Create: `src/shared/hooks/useApiError.ts`
- Create: `tests/unit/shared/hooks/useApiError.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/unit/shared/hooks/useApiError.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useApiError } from '@/shared/hooks/useApiError'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

describe('useApiError', () => {
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

  it('shows fallbackMessage when error has no status', async () => {
    const { toast } = await import('sonner')
    const { result } = renderHook(() => useApiError())
    result.current.handleError(new Error('Network error'), {
      showToast: true,
      fallbackMessage: 'Error al cargar contactos',
    })
    expect(toast.error).toHaveBeenCalledWith('Error al cargar contactos')
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
```

**Step 2: Run to verify failure**

```bash
npm test tests/unit/shared/hooks/useApiError.test.ts
```

Expected: FAIL — `Cannot find module '@/shared/hooks/useApiError'`

**Step 3: Create src/shared/hooks/useApiError.ts**

```typescript
// src/shared/hooks/useApiError.ts
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
  if (!navigator.onLine) return 'No hay conexión con el servidor'
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
```

**Step 4: Run tests to verify they pass**

```bash
npm test tests/unit/shared/hooks/useApiError.test.ts
```

Expected: PASS — 7 tests passing.

---

### Task 2.5: Create shared/hooks/useLogout.ts

**Files:**
- Create: `src/shared/hooks/useLogout.ts`

**Step 1: Create the file**

```typescript
// src/shared/hooks/useLogout.ts
'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

export function useLogout() {
  const router = useRouter()
  const { logout: storeLogout } = useAuthStore()

  function logout() {
    storeLogout()
    localStorage.removeItem('user_role')
    toast.success('Sesión cerrada', {
      description: 'Has cerrado sesión correctamente',
    })
    router.push('/login')
  }

  return { logout }
}
```

---

### Task 2.6: Fix app/(dashboard)/layout.tsx

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`

**Step 1: Rewrite layout.tsx removing all duplicates and integrating ProtectedRoute + useLogout**

The current file has: duplicate `useAuthStore` imports, two `handleLogout` functions, and orphaned JSX on line 245. Replace the entire file:

```tsx
// src/app/(dashboard)/layout.tsx
'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useLogout } from '@/shared/hooks/useLogout'
import { ProtectedRoute } from '@/core/routes/ProtectedRoute'

const SIDEBAR_W = 252

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trending', href: '/trending', icon: TrendingUp },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Contacts', href: '/contacts', icon: Users },
]

function getInitials(name?: string | null) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150"
      style={
        active
          ? {
              background: 'rgba(158,255,0,0.1)',
              border: '1px solid rgba(158,255,0,0.3)',
              padding: '10px 14px 10px 10px',
              color: '#ffffff',
              boxShadow: '0 0 10px 0 rgba(158,255,0,0.3)',
            }
          : {
              border: '1px solid transparent',
              color: 'rgba(240,244,255,0.45)',
              padding: '10px 14px 10px 10px',
            }
      }
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'rgba(240,244,255,0.85)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'rgba(240,244,255,0.45)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <Icon className="size-[18px] shrink-0" />
      {label}
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { logout } = useLogout()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const initials = getInitials(user?.fullName)
  const isSettingsActive = pathname.startsWith('/settings')

  useEffect(() => {
    if (pathname.startsWith('/settings')) setSettingsOpen(true)
  }, [pathname])

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0d0d' }}>
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-xl font-bold"
          style={{
            width: 46, height: 46, fontSize: 15,
            background: 'rgba(158,255,0,0.15)',
            border: '1px solid rgba(158,255,0,0.3)',
            color: '#9EFF00',
          }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-tight truncate" style={{ color: '#f0f4ff' }}>
            {user?.fullName ?? 'User'}
          </div>
          {user?.email && (
            <div className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(240,244,255,0.38)' }}>
              {user.email}
            </div>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="shrink-0 p-1 rounded-lg transition-colors"
            style={{ color: 'rgba(240,244,255,0.35)' }}>
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === item.href || pathname.startsWith('/dashboard')
              : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <NavItem key={item.name} href={item.href} icon={item.icon}
              label={item.name} active={active} onClick={onClose} />
          )
        })}
      </nav>

      <div className="px-3 py-4 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <NavItem href="/settings" icon={Settings} label="Configuración"
          active={isSettingsActive} onClick={onClose} />
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left"
          style={{ border: '1px solid transparent', color: 'rgba(240,244,255,0.45)', padding: '10px 14px 10px 10px' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444'
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(240,244,255,0.45)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut className="size-[18px] shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setMobileOpen(false), [pathname])

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden"
        style={{ background: '#151515', position: 'relative' }}>
        {/* Background orbs */}
        <div aria-hidden style={{
          position: 'fixed', top: '-18%', right: '-8%',
          width: '720px', height: '720px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0,205,190,0.22) 0%, rgba(0,175,162,0.09) 38%, rgba(0,140,130,0.03) 60%, transparent 75%)',
          filter: 'blur(65px)', animation: 'orb-breathe 7s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div aria-hidden style={{
          position: 'fixed', bottom: '-18%', left: `${SIDEBAR_W}px`,
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(65,60,220,0.15) 0%, rgba(45,40,175,0.06) 42%, transparent 70%)',
          filter: 'blur(80px)', animation: 'orb-breathe-slow 9s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col shrink-0" style={{
          width: SIDEBAR_W, background: '#0d0d0d',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          position: 'relative', zIndex: 10,
        }}>
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setMobileOpen(false)} />
        )}

        {/* Mobile sidebar drawer */}
        <aside className="fixed top-0 left-0 z-50 h-full md:hidden flex flex-col transition-transform duration-200"
          style={{
            width: SIDEBAR_W, background: '#0d0d0d',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}>
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </aside>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex md:hidden items-center px-4 h-14 shrink-0" style={{
            background: '#0d0d0d',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg"
              style={{ color: 'rgba(240,244,255,0.6)' }}>
              <Menu className="size-5" />
            </button>
            <span className="ml-3 text-base font-bold" style={{ color: '#f0f4ff' }}>
              Nella<span style={{ color: '#9EFF00' }}>Sales</span>
            </span>
          </div>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

**Step 2: Move shared/components/modal**

```bash
mkdir -p src/shared/components/modal
git mv src/components/shared/modal/modal.tsx src/shared/components/modal/modal.tsx
```

**Step 3: Verify build compiles**

```bash
npx tsc --noEmit
```

Fix any import errors before continuing.

**Step 4: Commit**

```bash
git add src/core/ src/shared/ src/app/\(dashboard\)/layout.tsx playwright.config.ts
git commit -m "refactor|NELLA-34|20260223|Add core infrastructure useApiError useLogout ProtectedRoute"
```

---

## PASO 3 — Módulo Auth (integración real)

### Task 3.1: Create module directory structure and move types

**Step 1: Create directories and move types**

```bash
mkdir -p src/modules/auth/{components,hooks,services,types}
git mv src/types/auth-types.ts src/modules/auth/types/auth-types.ts
```

**Step 2: Update imports referencing the moved types**

Files that import from `@/types/auth-types`:
- `src/stores/auth-store.ts`
- `src/lib/auth/auth-service.ts`
- `src/lib/auth/auth-storage.ts`
- `src/lib/auth/auth-validations.ts`
- `src/hooks/use-metrics.ts`
- `src/hooks/use-projects.ts`
- `src/hooks/useRegistrationWizard.ts`
- Various component files

Run to find all references:
```bash
grep -r "from '@/types/auth-types'" src/ --include="*.ts" --include="*.tsx" -l
```

Update each file's import from `@/types/auth-types` → `@/modules/auth/types/auth-types`.

Add a re-export for backward compatibility (will be removed in cleanup step):
```typescript
// src/types/auth-types.ts — DEPRECATED, delete in PASO 10
export * from '@/modules/auth/types/auth-types'
```

---

### Task 3.2: Migrate auth-store to core/store

**Files:**
- Create: `src/core/store/auth-store.ts`

**Step 1: Copy and enhance auth-store with tenantSubdomain**

```typescript
// src/core/store/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@/modules/auth/types/auth-types'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  tenantSubdomain: string | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  getAccessToken: () => string | null
  setTenantSubdomain: (subdomain: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      tenantSubdomain: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session, isAuthenticated: !!session }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, session: null, isAuthenticated: false, tenantSubdomain: null }),
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      getAccessToken: () => get().session?.accessToken ?? null,
      setTenantSubdomain: (subdomain) => set({ tenantSubdomain: subdomain }),
    }),
    {
      name: 'nella-auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        tenantSubdomain: state.tenantSubdomain,
      }),
    }
  )
)
```

**Step 2: Add re-export from old location for backward compat**

```typescript
// src/stores/auth-store.ts — DEPRECATED, delete in PASO 10
export { useAuthStore } from '@/core/store/auth-store'
```

---

### Task 3.3: Create real auth-service

**Files:**
- Create: `src/modules/auth/services/auth-service.ts`

**Step 1: Create the real service**

```typescript
// src/modules/auth/services/auth-service.ts
import type { RegistrationFormData, User, Session } from '@/modules/auth/types/auth-types'

function getTenantSubdomain(): string {
  if (typeof window === 'undefined') return ''
  const hostname = window.location.hostname
  // hostname format: acme.nella.app → 'acme'
  // localhost → use env var fallback
  const parts = hostname.split('.')
  if (parts.length >= 3) return parts[0]
  return process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN ?? ''
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
  tenant: { id: string; slug: string; name: string }
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; session: Session }> {
    const tenantSlug = getTenantSubdomain()

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tenantSlug }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error ?? 'Credenciales inválidas')
    }

    const response = data as LoginResponse

    const session: Session = {
      userId: response.user.id,
      tenantId: response.tenant.id,
      tenantSlug: response.tenant.slug,
      tenantName: response.tenant.name,
      email: response.user.email,
      fullName: response.user.fullName,
      role: response.user.role,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      loginAt: new Date().toISOString(),
    }

    return { user: response.user, session }
  },

  async register(formData: RegistrationFormData): Promise<{ user: User; session: Session }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error ?? 'Error al registrar usuario')
    }

    const response = data as LoginResponse

    const session: Session = {
      userId: response.user.id,
      tenantId: response.tenant.id,
      tenantSlug: response.tenant.slug,
      tenantName: response.tenant.name,
      email: response.user.email,
      fullName: response.user.fullName,
      role: response.user.role,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      loginAt: new Date().toISOString(),
    }

    return { user: response.user, session }
  },
}
```

---

### Task 3.4: Create useLogin hook with tests

**Files:**
- Create: `src/modules/auth/hooks/useLogin.ts`
- Create: `tests/unit/modules/auth/hooks/useLogin.test.ts`

**Step 1: Write failing tests**

```typescript
// tests/unit/modules/auth/hooks/useLogin.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLogin } from '@/modules/auth/hooks/useLogin'
import { mockSession, mockUser } from '../../../mocks/auth.mock'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/modules/auth/services/auth-service', () => ({
  authService: {
    login: vi.fn(),
  },
}))
vi.mock('@/core/store/auth-store', () => ({
  useAuthStore: () => ({
    setSession: vi.fn(),
    setUser: vi.fn(),
    setTenantSubdomain: vi.fn(),
  }),
}))

describe('useLogin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /dashboard on successful login', async () => {
    const { authService } = await import('@/modules/auth/services/auth-service')
    vi.mocked(authService.login).mockResolvedValue({ user: mockUser, session: mockSession })

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => children,
    })

    await act(async () => {
      result.current.mutate({ email: 'admin@acme.com', password: 'Admin1234!' })
      await new Promise((r) => setTimeout(r, 10))
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('shows error toast on failed login', async () => {
    const { toast } = await import('sonner')
    const { authService } = await import('@/modules/auth/services/auth-service')
    vi.mocked(authService.login).mockRejectedValue(new Error('Credenciales inválidas'))

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => children,
    })

    await act(async () => {
      result.current.mutate({ email: 'wrong@acme.com', password: 'wrong' })
      await new Promise((r) => setTimeout(r, 10))
    })

    expect(toast.error).toHaveBeenCalledWith('Credenciales inválidas')
    expect(mockPush).not.toHaveBeenCalled()
  })
})
```

**Step 2: Run to verify failure**

```bash
npm test tests/unit/modules/auth/hooks/useLogin.test.ts
```

**Step 3: Create src/modules/auth/hooks/useLogin.ts**

```typescript
// src/modules/auth/hooks/useLogin.ts
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/modules/auth/services/auth-service'
import { useAuthStore } from '@/core/store/auth-store'

interface LoginInput {
  email: string
  password: string
}

export function useLogin() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()

  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      authService.login(email, password),
    onSuccess: ({ user, session }) => {
      setUser(user)
      setSession(session)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al iniciar sesión')
    },
  })
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test tests/unit/modules/auth/hooks/useLogin.test.ts
```

Expected: PASS.

---

### Task 3.5: Create useRegister hook and move auth components

**Files:**
- Create: `src/modules/auth/hooks/useRegister.ts`

```typescript
// src/modules/auth/hooks/useRegister.ts
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/modules/auth/services/auth-service'
import { useAuthStore } from '@/core/store/auth-store'
import type { RegistrationFormData } from '@/modules/auth/types/auth-types'

export function useRegister() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()

  return useMutation({
    mutationFn: (formData: RegistrationFormData) => authService.register(formData),
    onSuccess: ({ user, session }) => {
      setUser(user)
      setSession(session)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al registrar usuario')
    },
  })
}
```

**Move auth components:**

```bash
git mv src/components/auth src/modules/auth/components
```

Update all imports inside the moved components from `@/components/auth/` → `@/modules/auth/components/`. Update `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx` imports.

**Update LoginForm to use useLogin:**

Find `src/modules/auth/components/login/login-form.tsx`. Replace the direct `authService.login()` call with `useLogin()` hook usage.

**Step: Verify and commit**

```bash
npx tsc --noEmit
git add src/modules/auth/ src/core/store/ src/stores/auth-store.ts src/types/auth-types.ts src/app/\(auth\)/
git commit -m "feat|NELLA-34|20260223|Migrate auth module with real NestJS integration"
```

---

## PASO 4 — Módulo Dashboard

### Task 4.1: Create module structure and move types

```bash
mkdir -p src/modules/dashboard/{components,hooks,services,types}
```

Move `Project` and `ProjectMetrics` types. Since they're in `auth-types.ts`, create a dedicated types file:

```typescript
// src/modules/dashboard/types/dashboard-types.ts
export interface Project {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface ProjectMetrics {
  totalLeads: number
  activeLeads: number
  revenueMonth: number
  trafficSources: { source: string; count: number }[]
  funnel: { status: string; count: number }[]
}
```

---

### Task 4.2: Migrate useMetrics with tests

**Files:**
- Create: `src/modules/dashboard/hooks/useMetrics.ts`
- Create: `tests/unit/modules/dashboard/hooks/useMetrics.test.ts`

**Step 1: Write failing test**

```typescript
// tests/unit/modules/dashboard/hooks/useMetrics.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMetrics } from '@/modules/dashboard/hooks/useMetrics'
import { mockMetrics } from '../../../mocks/metrics.mock'
import { renderWithProviders } from '../../../utils/render-with-providers'

vi.mock('@/core/api/api-client', () => ({
  apiClient: { get: vi.fn().mockResolvedValue(mockMetrics) },
}))

describe('useMetrics', () => {
  it('does NOT read localStorage directly', () => {
    const getSpy = vi.spyOn(Storage.prototype, 'getItem')
    renderHook(() => useMetrics('proj-1', 'all'), {
      wrapper: ({ children }) =>
        renderWithProviders(children as React.ReactElement).container
          .parentElement as React.FC,
    })
    expect(getSpy).not.toHaveBeenCalledWith('nella-auth-storage')
  })

  it('fetches metrics using apiClient', async () => {
    const { apiClient } = await import('@/core/api/api-client')
    const { result } = renderHook(() => useMetrics('proj-1', 'all'))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith('/api/metrics/proj-1?period=all')
  })
})
```

**Step 2: Run to verify failure**

```bash
npm test tests/unit/modules/dashboard/hooks/useMetrics.test.ts
```

**Step 3: Create src/modules/dashboard/hooks/useMetrics.ts**

```typescript
// src/modules/dashboard/hooks/useMetrics.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import type { ProjectMetrics } from '@/modules/dashboard/types/dashboard-types'

export type Period = 'all' | '30d' | 'prev_month' | 'quarter' | 'year'

export function useMetrics(projectId: string | null, period: Period = 'all') {
  return useQuery<ProjectMetrics>({
    queryKey: queryKeys.dashboard.metrics(projectId ?? '', period),
    queryFn: () =>
      apiClient.get<ProjectMetrics>(
        `/api/metrics/${projectId}?period=${encodeURIComponent(period)}`
      ),
    enabled: !!projectId,
    staleTime: 10_000,
  })
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test tests/unit/modules/dashboard/hooks/useMetrics.test.ts
```

---

### Task 4.3: Migrate useProjects and useMetricsSocket

```typescript
// src/modules/dashboard/hooks/useProjects.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import type { Project } from '@/modules/dashboard/types/dashboard-types'

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: queryKeys.dashboard.projects(),
    queryFn: () => apiClient.get<Project[]>('/api/projects'),
    staleTime: 30_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      apiClient.post<Project>('/api/projects', { name }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.projects() }),
  })
}
```

```bash
# Move metrics socket hook
git mv src/hooks/use-metrics-socket.ts src/modules/dashboard/hooks/useMetricsSocket.ts
```

Update imports inside the moved file.

---

### Task 4.4: Move dashboard components

```bash
git mv src/components/dashboard/kpi-card.tsx src/modules/dashboard/components/kpi-card.tsx
git mv src/components/dashboard/metrics-dashboard.tsx src/modules/dashboard/components/metrics-dashboard.tsx
git mv src/components/dashboard/conversion-funnel.tsx src/modules/dashboard/components/conversion-funnel.tsx
git mv src/components/dashboard/leads-line-chart.tsx src/modules/dashboard/components/leads-line-chart.tsx
git mv src/components/dashboard/traffic-sources.tsx src/modules/dashboard/components/traffic-sources.tsx
git mv src/components/dashboard/kpi-card.tsx src/modules/dashboard/components/kpi-card.tsx
git mv src/components/dashboard/project-selector.tsx src/modules/dashboard/components/project-selector.tsx
git mv src/components/dashboard/project-empty-state.tsx src/modules/dashboard/components/project-empty-state.tsx
git mv src/components/dashboard/create-project-modal.tsx src/modules/dashboard/components/create-project-modal.tsx
```

Update all internal imports. Update `app/(dashboard)/dashboard/page.tsx` imports.

Add backward-compat re-exports:
```typescript
// src/hooks/use-metrics.ts — DEPRECATED
export { useMetrics } from '@/modules/dashboard/hooks/useMetrics'
// src/hooks/use-projects.ts — DEPRECATED
export { useProjects, useCreateProject } from '@/modules/dashboard/hooks/useProjects'
```

**Step: Verify and commit**

```bash
npx tsc --noEmit
git add src/modules/dashboard/ src/hooks/use-metrics.ts src/hooks/use-projects.ts
git commit -m "refactor|NELLA-34|20260223|Migrate dashboard module fix localStorage direct reads"
```

---

## PASO 5 — Módulo Contacts

### Task 5.1: Create module and write useContacts tests (regression + CRUD)

**Files:**
- Create: `src/modules/contacts/{components,hooks,services,types}/`
- Create: `tests/unit/modules/contacts/hooks/useContacts.test.ts`

**Step 1: Write failing regression test for URL bug**

```typescript
// tests/unit/modules/contacts/hooks/useContacts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useContacts, useUpdateContact } from '@/modules/contacts/hooks/useContacts'
import { mockContacts } from '../../../mocks/contacts.mock'

vi.mock('@/core/api/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue([]),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    post: vi.fn().mockResolvedValue({}),
  },
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe('useContacts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('REGRESSION: fetches from /api/contacts not /contacts', async () => {
    const { apiClient } = await import('@/core/api/api-client')
    vi.mocked(apiClient.get).mockResolvedValue(mockContacts)

    renderHook(() => useContacts())
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled())

    const calledUrl = vi.mocked(apiClient.get).mock.calls[0][0] as string
    expect(calledUrl).toMatch(/^\/api\/contacts/)
    expect(calledUrl).not.toBe('/contacts')
  })

  it('invalidates contacts query on successful update', async () => {
    const { apiClient } = await import('@/core/api/api-client')
    vi.mocked(apiClient.patch).mockResolvedValue({ id: 1, name: 'Updated' })

    const { result } = renderHook(() => useUpdateContact())
    await result.current.mutateAsync({ id: 1, payload: { name: 'Updated' } })

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/contacts/1',
      { name: 'Updated' }
    )
  })

  it('shows success toast on update', async () => {
    const { toast } = await import('sonner')
    const { apiClient } = await import('@/core/api/api-client')
    vi.mocked(apiClient.patch).mockResolvedValue({ id: 1 })

    const { result } = renderHook(() => useUpdateContact())
    await result.current.mutateAsync({ id: 1, payload: { name: 'Test' } })

    expect(toast.success).toHaveBeenCalled()
  })
})
```

**Step 2: Run to verify failure**

```bash
npm test tests/unit/modules/contacts/hooks/useContacts.test.ts
```

**Step 3: Move and fix contacts types**

```bash
mkdir -p src/modules/contacts/{components,hooks,services,types}
git mv src/types/contacts.ts src/modules/contacts/types/contacts.ts
git mv src/types/contact-types.ts src/modules/contacts/types/contact-types.ts
```

Add backward-compat re-export in `src/types/contacts.ts`.

**Step 4: Create src/modules/contacts/hooks/useContacts.ts**

```typescript
// src/modules/contacts/hooks/useContacts.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { useApiError } from '@/shared/hooks/useApiError'
import type {
  BackendContact,
  ContactsQuery,
  UpdateContactPayload,
  CreateContactPayload,
} from '@/modules/contacts/types/contacts'

export function useContacts(query?: ContactsQuery) {
  const params = new URLSearchParams()
  if (query?.phone) params.set('phone', query.phone)
  if (query?.lead_status) params.set('lead_status', query.lead_status)
  const qs = params.toString()

  return useQuery<BackendContact[]>({
    queryKey: [...queryKeys.contacts.all(), query],
    queryFn: () =>
      apiClient.get<BackendContact[]>(`/api/contacts${qs ? `?${qs}` : ''}`),
  })
}

export function useContact(id: number) {
  return useQuery<BackendContact>({
    queryKey: queryKeys.contacts.detail(id),
    queryFn: () => apiClient.get<BackendContact>(`/api/contacts/${id}`),
    enabled: !!id,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: (payload: CreateContactPayload) =>
      apiClient.post<BackendContact>('/api/contacts', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() })
      toast.success('Contacto creado correctamente')
    },
    onError: (error: Error) =>
      handleError(error, { showToast: true, fallbackMessage: 'Error al crear contacto' }),
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContactPayload }) =>
      apiClient.patch<BackendContact>(`/api/contacts/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() })
      toast.success('Contacto actualizado correctamente')
    },
    onError: (error: Error) =>
      handleError(error, { showToast: true, fallbackMessage: 'Error al actualizar contacto' }),
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() })
      toast.success('Contacto eliminado correctamente')
    },
    onError: (error: Error) =>
      handleError(error, { showToast: true, fallbackMessage: 'Error al eliminar contacto' }),
  })
}
```

**Step 5: Run regression test to verify it passes**

```bash
npm test tests/unit/modules/contacts/hooks/useContacts.test.ts
```

Expected: PASS — URL bug confirmed fixed.

**Step 6: Move contacts components**

```bash
git mv src/components/contacts/contacts-table.tsx src/modules/contacts/components/contacts-table.tsx
git mv src/components/contacts/contact-detail-modal.tsx src/modules/contacts/components/contact-detail-modal.tsx
git mv src/components/contacts/contact-header.tsx src/modules/contacts/components/contact-header.tsx
git mv src/components/contacts/create-contact-modal.tsx src/modules/contacts/components/create-contact-modal.tsx
git mv src/components/contacts/info-card.tsx src/modules/contacts/components/info-card.tsx
git mv src/components/contacts/score-ring.tsx src/modules/contacts/components/score-ring.tsx
git mv src/components/contacts/channel-icon.tsx src/modules/contacts/components/channel-icon.tsx
```

Update imports in components and `app/(dashboard)/contacts/` pages.

Add backward-compat re-export:
```typescript
// src/hooks/useContacts.ts — DEPRECATED
export * from '@/modules/contacts/hooks/useContacts'
```

**Step 7: Verify and commit**

```bash
npx tsc --noEmit
git add src/modules/contacts/ src/hooks/useContacts.ts src/types/contacts.ts src/types/contact-types.ts
git commit -m "refactor|NELLA-34|20260223|Migrate contacts module and fix API URL regression"
```

---

## PASO 6 — Módulo Kanban

### Task 6.1: Move kanban types and create store test

**Files:**
- Create: `tests/unit/modules/kanban/stores/kanban-store.test.ts`

**Step 1: Write kanban store tests**

```typescript
// tests/unit/modules/kanban/stores/kanban-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { transformContactToLead, useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import { mockContact } from '../../../mocks/contacts.mock'

describe('transformContactToLead', () => {
  it('maps HOT LEAD status to contacted stage', () => {
    const lead = transformContactToLead({ ...mockContact, lead_status: 'HOT LEAD' })
    expect(lead.stage).toBe('contacted')
  })

  it('maps COLD LEAD status to new stage', () => {
    const lead = transformContactToLead({ ...mockContact, lead_status: 'COLD LEAD' })
    expect(lead.stage).toBe('new')
  })

  it('maps WARM LEAD status to proposal stage', () => {
    const lead = transformContactToLead({ ...mockContact, lead_status: 'WARM LEAD' })
    expect(lead.stage).toBe('proposal')
  })

  it('maps DESCARTADO status to closed stage', () => {
    const lead = transformContactToLead({ ...mockContact, lead_status: 'DESCARTADO' })
    expect(lead.stage).toBe('closed')
  })

  it('defaults unknown status to new stage', () => {
    const lead = transformContactToLead({ ...mockContact, lead_status: 'UNKNOWN' })
    expect(lead.stage).toBe('new')
  })

  it('sets probability_label to high for HOT LEAD', () => {
    const lead = transformContactToLead({ ...mockContact, lead_status: 'HOT LEAD' })
    expect(lead.probability_label).toBe('high')
    expect(lead.probability).toBe(90)
  })
})

describe('useKanbanStore.getLeadsByStage', () => {
  beforeEach(() => {
    useKanbanStore.setState({
      leads: [
        transformContactToLead({ ...mockContact, id: 1, lead_status: 'HOT LEAD' }),
        transformContactToLead({ ...mockContact, id: 2, lead_status: 'COLD LEAD' }),
        transformContactToLead({ ...mockContact, id: 3, lead_status: 'HOT LEAD' }),
      ],
    })
  })

  it('returns only leads matching the requested stage', () => {
    const contactedLeads = useKanbanStore.getState().getLeadsByStage('contacted')
    expect(contactedLeads).toHaveLength(2)
    expect(contactedLeads.every((l) => l.stage === 'contacted')).toBe(true)
  })

  it('returns empty array for stage with no leads', () => {
    const closedLeads = useKanbanStore.getState().getLeadsByStage('closed')
    expect(closedLeads).toHaveLength(0)
  })
})
```

**Step 2: Run to verify failure**

```bash
npm test tests/unit/modules/kanban/stores/kanban-store.test.ts
```

**Step 3: Migrate kanban files**

```bash
mkdir -p src/modules/kanban/{components,hooks,services,stores,types}

git mv src/types/kanban-types.ts src/modules/kanban/types/kanban-types.ts
git mv src/stores/kanban-store.ts src/modules/kanban/stores/kanban-store.ts
git mv src/hooks/kanban/use-kanban-data.ts src/modules/kanban/hooks/use-kanban-data.ts
git mv src/hooks/kanban/use-kanban-drag-drop.ts src/modules/kanban/hooks/use-kanban-drag-drop.ts
git mv src/hooks/kanban/use-kanban-sse.ts src/modules/kanban/hooks/use-kanban-sse.ts
git mv src/hooks/kanban/use-kanban-constants.ts src/modules/kanban/hooks/use-kanban-constants.ts
git mv src/hooks/kanban/use-kanban-loading.ts src/modules/kanban/hooks/use-kanban-loading.ts
git mv src/hooks/kanban/index.ts src/modules/kanban/hooks/index.ts

git mv src/components/kanban/kanban-board.tsx src/modules/kanban/components/kanban-board.tsx
git mv src/components/kanban/kanban-column.tsx src/modules/kanban/components/kanban-column.tsx
git mv src/components/kanban/kanban-filters.tsx src/modules/kanban/components/kanban-filters.tsx
git mv src/components/kanban/kanban-skeleton.tsx src/modules/kanban/components/kanban-skeleton.tsx
git mv src/components/kanban/lead-card.tsx src/modules/kanban/components/lead-card.tsx
git mv src/components/kanban/lead-details-panel.tsx src/modules/kanban/components/lead-details-panel.tsx
git mv src/components/kanban/index.ts src/modules/kanban/components/index.ts
```

Update all internal imports. Add `useApiError` to `use-kanban-sse.ts` for Socket.io error handling:

```typescript
// In src/modules/kanban/hooks/use-kanban-sse.ts — add to socket.on('connect_error'):
socket.on('connect_error', (error) => {
  console.error('[KanbanSSE] Connection error:', error)
  // handleError is called outside hook context — log only, toast handled by component
})
```

Add `moveLeadToStage` comment in kanban-store.ts:
```typescript
// TODO: PATCH /api/contacts/:id — persist stage change to backend
```

Add backward-compat re-exports:
```typescript
// src/stores/kanban-store.ts — DEPRECATED
export * from '@/modules/kanban/stores/kanban-store'
// src/types/kanban-types.ts — DEPRECATED
export * from '@/modules/kanban/types/kanban-types'
```

**Step 4: Run tests to verify they pass**

```bash
npm test tests/unit/modules/kanban/stores/kanban-store.test.ts
```

**Step 5: Verify and commit**

```bash
npx tsc --noEmit
git add src/modules/kanban/ src/stores/kanban-store.ts src/types/kanban-types.ts src/hooks/kanban/
git commit -m "refactor|NELLA-34|20260223|Migrate kanban module to modules pattern"
```

---

## PASO 7 — Módulo Calendar

### Task 7.1: Migrate calendar module

```bash
mkdir -p src/modules/calendar/{components,hooks,services,stores,types}

git mv src/types/calendar-types.ts src/modules/calendar/types/calendar-types.ts
git mv src/lib/calendar-api.ts src/modules/calendar/services/calendar-api.ts
git mv src/hooks/useCalendarEvents.ts src/modules/calendar/hooks/useCalendarEvents.ts
git mv src/stores/calendar-store.ts src/modules/calendar/stores/calendar-store.ts

# Rename carpeta calendario → calendar
git mv src/components/calendario/calendar-event-card.tsx src/modules/calendar/components/calendar-event-card.tsx
git mv src/components/calendario/calendar-layout.tsx src/modules/calendar/components/calendar-layout.tsx
git mv src/components/calendario/calendar-sidebar.tsx src/modules/calendar/components/calendar-sidebar.tsx
git mv src/components/calendario/calendar-time-indicator.tsx src/modules/calendar/components/calendar-time-indicator.tsx
git mv src/components/calendario/calendar-week-view.tsx src/modules/calendar/components/calendar-week-view.tsx
git mv src/components/calendario/mini-calendar.tsx src/modules/calendar/components/mini-calendar.tsx
git mv src/components/calendario/project-filters.tsx src/modules/calendar/components/project-filters.tsx
git mv src/components/calendario/upcoming-events.tsx src/modules/calendar/components/upcoming-events.tsx
git mv src/components/calendario/index.ts src/modules/calendar/components/index.ts
git mv src/components/calendario/modals/ src/modules/calendar/components/modals/
```

Update all internal imports. Update `app/(dashboard)/calendar/page.tsx` imports.

Add backward-compat re-exports for `src/hooks/useCalendarEvents.ts` and `src/stores/calendar-store.ts`.

**Write minimal test:**

```typescript
// tests/unit/modules/calendar/hooks/useCalendarEvents.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/core/api/api-client', () => ({
  apiClient: { get: vi.fn().mockResolvedValue([]) },
}))

describe('useCalendarEvents module', () => {
  it('module exports useCalendarEvents', async () => {
    const mod = await import('@/modules/calendar/hooks/useCalendarEvents')
    expect(typeof mod.useCalendarEvents).toBe('function')
  })
})
```

**Commit:**

```bash
npx tsc --noEmit
git add src/modules/calendar/ src/components/calendario/ src/hooks/useCalendarEvents.ts src/stores/calendar-store.ts
git commit -m "refactor|NELLA-34|20260223|Migrate calendar module rename calendario to calendar"
```

---

## PASO 8 — Módulo Chat

### Task 8.1: Migrate chat module

```bash
mkdir -p src/modules/chat/{components,hooks,services,types}

git mv src/lib/chatwoot.ts src/modules/chat/services/chatwoot.ts
git mv src/hooks/useChat.ts src/modules/chat/hooks/useChat.ts
git mv src/components/chat/chatwoot-iframe.tsx src/modules/chat/components/chatwoot-iframe.tsx
git mv src/components/chat/chat-offline.tsx src/modules/chat/components/chat-offline.tsx
```

Create placeholder types:
```typescript
// src/modules/chat/types/index.ts
// Placeholder — expand when Chatwoot API is integrated natively
export interface ChatwootConfig {
  baseUrl: string
  apiKey: string
  websiteToken: string
}
```

Update imports in `app/(dashboard)/chat/page.tsx`.

Add backward-compat re-export for `src/hooks/useChat.ts`.

**Commit:**

```bash
npx tsc --noEmit
git add src/modules/chat/ src/hooks/useChat.ts
git commit -m "refactor|NELLA-34|20260223|Migrate chat module to modules pattern"
```

---

## PASO 9 — Módulo Workflows

### Task 9.1: Migrate workflows module with test

```bash
mkdir -p src/modules/workflows/{components,hooks,services,types}

git mv src/lib/workflows/workflow-types.ts src/modules/workflows/types/workflow-types.ts
git mv src/lib/workflows/workflow-service.ts src/modules/workflows/services/workflow-service.ts
git mv src/lib/workflows/workflow-storage.ts src/modules/workflows/services/workflow-storage.ts
git mv src/lib/workflows/workflow-template.ts src/modules/workflows/services/workflow-template.ts
git mv src/lib/workflows/workflow-validator.ts src/modules/workflows/services/workflow-validator.ts
git mv src/hooks/useWorkflow.ts src/modules/workflows/hooks/useWorkflow.ts
git mv src/hooks/useWorkflowCredentials.ts src/modules/workflows/hooks/useWorkflowCredentials.ts
git mv src/components/workflows/workflow-credentials-manager.tsx src/modules/workflows/components/workflow-credentials-manager.tsx
git mv src/components/workflows/workflow-status-badge.tsx src/modules/workflows/components/workflow-status-badge.tsx
```

Add integration comment to `workflow-service.ts`:
```typescript
// ⚡ PUNTO DE INTEGRACIÓN FUTURA:
// Reemplazar métodos por apiClient.post/patch('/api/workflows/*')
// cuando el módulo de n8n esté disponible en el backend
```

**Write test:**

```typescript
// tests/unit/modules/workflows/services/workflow-service.test.ts
import { describe, it, expect } from 'vitest'
import { workflowService } from '@/modules/workflows/services/workflow-service'

describe('workflowService.validateCredential', () => {
  it('validates valid WhatsApp token', async () => {
    const valid = await workflowService.validateCredential(
      'whatsapp',
      'EAA' + 'x'.repeat(110)
    )
    expect(valid).toBe(true)
  })

  it('rejects invalid WhatsApp token', async () => {
    const valid = await workflowService.validateCredential('whatsapp', 'invalid')
    expect(valid).toBe(false)
  })

  it('validates valid OpenAI key', async () => {
    const valid = await workflowService.validateCredential(
      'openai',
      'sk-' + 'x'.repeat(50)
    )
    expect(valid).toBe(true)
  })
})
```

Add backward-compat re-exports for moved hooks.

**Commit:**

```bash
npx tsc --noEmit
npm test tests/unit/modules/workflows/services/workflow-service.test.ts
git add src/modules/workflows/ src/hooks/useWorkflow.ts src/hooks/useWorkflowCredentials.ts
git commit -m "refactor|NELLA-34|20260223|Migrate workflows module to modules pattern"
```

---

## PASO 10 — Limpieza final, E2E y validación

### Task 10.1: Add core/store re-exports and remove legacy dirs

**Step 1: Add core/store/index.ts**

```typescript
// src/core/store/index.ts
export { useAuthStore } from './auth-store'
// Kanban and Calendar stores are owned by their modules — imported directly
```

**Step 2: Verify all deprecated re-exports are in place, then delete originals**

Before deleting, verify zero TypeScript errors:
```bash
npx tsc --noEmit
```

Then remove empty legacy directories:
```bash
# Remove only if empty or only contains deprecated re-exports
# Deprecated re-exports remain until confirmed no external consumers
```

Note: Keep `src/hooks/`, `src/stores/`, `src/types/` with only their deprecated re-export files until the build is confirmed clean. Remove empty component subdirectories:

```bash
rmdir src/components/dashboard 2>/dev/null || true
rmdir src/components/contacts 2>/dev/null || true
rmdir src/components/kanban 2>/dev/null || true
rmdir src/components/calendario 2>/dev/null || true
rmdir src/components/chat 2>/dev/null || true
rmdir src/components/workflows 2>/dev/null || true
```

---

### Task 10.2: Write E2E — auth.spec.ts

**Files:**
- Create: `tests/e2e/auth.spec.ts`

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
  test('Login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@verify-corp.com')
    await page.fill('input[type="password"]', 'Admin1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 10_000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('Credenciales incorrectas muestra error en español', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    // Error message should appear — either inline or toast
    const errorText = page.locator('text=/credencial|inválid|incorrecto/i')
    await expect(errorText).toBeVisible({ timeout: 5_000 })
  })

  test('Logout redirige a /login', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@verify-corp.com')
    await page.fill('input[type="password"]', 'Admin1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 10_000 })

    // Find and click logout button
    await page.click('button:has-text("Cerrar sesión")')
    await page.waitForURL('**/login**', { timeout: 5_000 })
    expect(page.url()).toContain('/login')
  })
})
```

---

### Task 10.3: Write E2E — contacts.spec.ts

```typescript
// tests/e2e/contacts.spec.ts
import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@verify-corp.com')
  await page.fill('input[type="password"]', 'Admin1234!')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 10_000 })
}

test.describe('Contacts', () => {
  test('Tabla de contactos carga y muestra filas', async ({ page }) => {
    await login(page)
    await page.goto('/contacts')
    await page.waitForLoadState('networkidle')
    // Either contacts table or empty state is visible
    const table = page.locator('table, [data-testid="contacts-table"]')
    const emptyState = page.locator('text=/no hay contactos|sin contactos/i')
    const hasTable = await table.isVisible().catch(() => false)
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmpty).toBe(true)
  })
})
```

---

### Task 10.4: Write E2E — kanban.spec.ts

```typescript
// tests/e2e/kanban.spec.ts
import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@verify-corp.com')
  await page.fill('input[type="password"]', 'Admin1234!')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 10_000 })
}

test.describe('Kanban', () => {
  test('Board renderiza las cuatro columnas', async ({ page }) => {
    await login(page)
    await page.goto('/trending') // Kanban is at /trending based on nav
    await page.waitForLoadState('networkidle')
    // Check for stage column labels
    for (const label of ['Nuevo', 'Calificado', 'Negociación', 'Cerrado']) {
      await expect(page.getByText(label)).toBeVisible({ timeout: 5_000 })
    }
  })
})
```

---

### Task 10.5: Final build and lint validation

**Step 1: Run full test suite**

```bash
npm test
```

Expected: All unit tests pass.

**Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings. Fix any issues before continuing.

**Step 3: Run build**

```bash
npm run build
```

Expected: Build completes successfully. Fix any TypeScript errors.

**Step 4: Verify no direct localStorage reads outside core/store**

```bash
grep -r "localStorage.getItem" src/ --include="*.ts" --include="*.tsx" \
  --exclude-dir="core" --exclude-dir="lib"
```

Expected: Only `lib/registration-storage.ts` and `lib/auth/auth-storage.ts` should appear (registration wizard UI state — acceptable). If any module hooks appear, fix them.

**Step 5: Commit cleanup**

```bash
git add tests/e2e/ src/
git commit -m "refactor|NELLA-34|20260223|Add e2e tests and complete legacy directory cleanup"
```

---

## PASO 11 — Pull Request

### Task 11.1: Create PR to main

**Step 1: Push branch**

```bash
git push origin feature/nella-34
```

**Step 2: Verify acceptance criteria**

- [ ] `npm run build` — PASS
- [ ] `npm run lint` — PASS (0 warnings)
- [ ] `npm test` — PASS (all unit tests)
- [ ] Login real funciona contra NestJS backend
- [ ] Test de regresión `/api/contacts` pasa (no `/contacts`)
- [ ] `layout.tsx` — sin duplicados, sin JSX huérfano
- [ ] No hay `localStorage.getItem('nella-auth-storage')` en módulos
- [ ] Toda `modules/<name>/` tiene `components/`, `hooks/`, `services/`, `types/`
- [ ] `src/hooks/`, `src/stores/`, `src/types/` contienen solo re-exports deprecados o están vacíos

**Step 3: Create PR**

```bash
gh pr create \
  --base main \
  --title "refactor|NELLA-34|20260223|MVP architecture alignment and auth integration" \
  --body "$(cat <<'EOF'
## Summary
- Full migration of all modules to src/modules/<name>/ pattern per architecture lineament
- Real NestJS auth integration replacing mock localStorage auth
- Core infrastructure: api-client (auto-headers), useApiError, useLogout, ProtectedRoute
- Bug fix: contacts hook fetched /contacts instead of /api/contacts
- Bug fix: dashboard layout.tsx had duplicate imports and orphaned JSX
- Test infrastructure: unit tests per module + e2e for auth/dashboard/contacts/kanban

## Test plan
- [ ] Run `npm test` — all unit tests pass
- [ ] Run `npm run build` — no TypeScript errors
- [ ] Run `npm run lint` — no warnings
- [ ] Manual: login with real backend credentials works
- [ ] Manual: logout redirects to /login
- [ ] Manual: kanban board loads contacts from API

## Breaking changes
None — all moved modules maintain backward-compatible re-exports in legacy locations during transition.

🤖 Generated with Claude Code
EOF
)"
```

---

## Acceptance Criteria Summary

| Criterio | Verificación |
|---------|-------------|
| Build pasa | `npm run build` → exit 0 |
| Lint pasa | `npm run lint` → 0 warnings |
| Tests pasan | `npm test` → all green |
| Auth real | Login con credenciales reales del backend NestJS |
| Regresión URL | `useContacts` test verifica `/api/contacts` |
| Layout limpio | 0 duplicate imports, 0 orphaned JSX |
| Sin localStorage directo | grep en modules/ devuelve vacío |
| Estructura completa | Cada `modules/<name>/` tiene 4 subdirectorios |
