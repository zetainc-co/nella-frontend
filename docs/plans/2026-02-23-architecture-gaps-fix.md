# Architecture Gaps Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical gaps identified in the architecture lineament audit to achieve full compliance with `docs/lineament/frontend_arquitectura.md`.

**Architecture:** Eight passes: (1) api-client token refresh + useApiError 400, (2) ProtectedRoute auth validation + permissions, (3) orphaned directory cleanup, (4) missing directory structure, (5) mutation standardization, (6) path aliases, (7) .env.example, (8) oversized file refactor.

**Tech Stack:** Next.js 16 + TypeScript + Zustand v5 + TanStack Query v5 + Vitest + yarn

**Branch:** `feature/nella-36`

**Commit format:** `Tipo|NELLA-34|YYYYMMDD|Description in English (max 60 chars)`

**Important:** Never add `Co-Authored-By` trailers to commits (git hook rejects them).

---

## PASO 1 — api-client: Token Refresh + Loop Prevention

### Task 1.1: Create refresh token API route

**Files:**
- Create: `src/app/api/auth/refresh/route.ts`

**Step 1: Create the API route that proxies to NestJS `/auth/refresh`**

```typescript
// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token requerido' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'No se pudo renovar la sesión' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/auth/refresh] Error:', error)
    return NextResponse.json(
      { error: 'Error al renovar la sesión' },
      { status: 503 }
    )
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/app/api/auth/refresh/route.ts
git commit -m "feat|NELLA-34|20260223|Add refresh token API route proxy"
```

---

### Task 1.2: Write failing tests for api-client token refresh

**Files:**
- Modify: `tests/unit/core/api/api-client.test.ts`

**Step 1: Add tests for refresh behavior**

Append these tests to the existing describe block in `tests/unit/core/api/api-client.test.ts`:

```typescript
  it('attempts token refresh on 401 before logging out', async () => {
    // First call returns 401
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      )
      // Refresh call succeeds
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: 'new-token', refreshToken: 'new-refresh' }), { status: 200 })
      )
      // Retry of original call succeeds
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
      )

    const result = await apiClient.get('/api/contacts')
    expect(result).toEqual({ data: 'ok' })
    // fetch called 3 times: original, refresh, retry
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('logs out when refresh token also fails', async () => {
    const { useAuthStore } = await import('@/stores/auth-store')

    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      )
      // Refresh call also fails
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Invalid refresh token' }), { status: 401 })
      )

    await expect(apiClient.get('/api/contacts')).rejects.toThrow('Sesión expirada')
    expect(useAuthStore.getState().logout).toHaveBeenCalled()
  })

  it('does not attempt refresh on non-auth endpoints returning 401', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
    )

    // When calling a login endpoint, should not try refresh
    await expect(apiClient.post('/api/auth/login', { email: 'a', password: 'b' }))
      .rejects.toThrow()
    // Only 1 fetch call (no refresh attempt for auth endpoints)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/core/api/api-client.test.ts`

Expected: FAIL — current api-client doesn't attempt refresh.

---

### Task 1.3: Implement token refresh in api-client

**Files:**
- Modify: `src/core/api/api-client.ts`

**Step 1: Rewrite api-client.ts with refresh logic and loop prevention**

Replace the entire file content with:

```typescript
// src/core/api/api-client.ts
import { useAuthStore } from '@/stores/auth-store'

// Prevent concurrent refresh attempts
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

// Endpoints that should NOT trigger token refresh on 401
const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

function getAuthHeaders(): Record<string, string> {
  const { session } = useAuthStore.getState()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`
  if (session?.tenantSlug) headers['X-Tenant-Id'] = session.tenantSlug
  return headers
}

async function attemptTokenRefresh(): Promise<boolean> {
  // If already refreshing, wait for that result
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  const { session } = useAuthStore.getState()
  if (!session?.refreshToken) return false

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      })

      if (!res.ok) return false

      const data = await res.json()
      const store = useAuthStore.getState()
      store.setSession({
        ...session,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? session.refreshToken,
      })
      return true
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function forceLogout(): never {
  useAuthStore.getState().logout()
  if (typeof window !== 'undefined') window.location.href = '/login'
  throw new Error('Sesión expirada')
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
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => url.startsWith(ep))

    if (!isAuthEndpoint) {
      const refreshed = await attemptTokenRefresh()
      if (refreshed) {
        // Retry original request with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...(options.headers as Record<string, string> | undefined),
          },
        })

        if (retryResponse.ok) {
          const data = await retryResponse.json()
          return data as T
        }

        if (retryResponse.status === 401) {
          forceLogout()
        }

        // Handle non-401 error on retry
        let retryData: unknown
        try { retryData = await retryResponse.json() } catch { /* empty */ }
        const message = (retryData as { message?: string })?.message ?? 'Error en la solicitud'
        const error = new Error(message)
        ;(error as Error & { status?: number }).status = retryResponse.status
        throw error
      }
    }

    // Refresh failed or auth endpoint — force logout
    forceLogout()
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('Respuesta inválida del servidor')
  }

  if (!response.ok) {
    const message = (data as { message?: string })?.message ?? 'Error en la solicitud'
    const error = new Error(message)
    ;(error as Error & { status?: number }).status = response.status
    throw error
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

**Step 2: Run tests**

Run: `npx vitest run tests/unit/core/api/api-client.test.ts`

Expected: ALL PASS.

**Step 3: Run full test suite**

Run: `npx vitest run`

Expected: 47+ tests pass.

**Step 4: Commit**

```bash
git add src/core/api/api-client.ts tests/unit/core/api/api-client.test.ts
git commit -m "feat|NELLA-34|20260223|Add token refresh and loop prevention to api-client"
```

---

### Task 1.4: Add 400 status handling to useApiError

**Files:**
- Modify: `src/shared/hooks/useApiError.ts`
- Modify: `tests/unit/shared/hooks/useApiError.test.ts`

**Step 1: Add test for 400 status**

Add this test to the existing describe block in `tests/unit/shared/hooks/useApiError.test.ts`:

```typescript
  it('maps 400 to validation error message', async () => {
    const { toast } = await import('sonner')
    const { result } = renderHook(() => useApiError())
    const err = Object.assign(new Error('Bad Request'), { status: 400 })
    result.current.handleError(err, { showToast: true })
    expect(toast.error).toHaveBeenCalledWith(
      'Datos inválidos, revisa el formulario'
    )
  })
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/shared/hooks/useApiError.test.ts`

Expected: FAIL — no 400 handler exists.

**Step 3: Add 400 handling in useApiError.ts**

In `src/shared/hooks/useApiError.ts`, modify `getMessageForStatus` to add 400 handling after the 401 check:

Replace lines 14-18:

```typescript
  if (status === 400) return 'Datos inválidos, revisa el formulario'
  if (status === 401) return 'Tu sesión expiró, inicia sesión nuevamente'
  if (status === 403) return 'No tienes permisos para realizar esta acción'
  if (status === 404) return 'El recurso solicitado no existe'
  if (status && status >= 500) return 'Error interno, intenta de nuevo'
```

**Step 4: Run tests**

Run: `npx vitest run tests/unit/shared/hooks/useApiError.test.ts`

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/shared/hooks/useApiError.ts tests/unit/shared/hooks/useApiError.test.ts
git commit -m "feat|NELLA-34|20260223|Add 400 status handling to useApiError"
```

---

## PASO 2 — ProtectedRoute: Auth Validation + Permissions

### Task 2.1: Create useAuthValidation hook with tests

**Files:**
- Create: `src/core/routes/hooks/useAuthValidation.ts`
- Create: `tests/unit/core/routes/hooks/useAuthValidation.test.ts`

**Step 1: Write failing tests**

```typescript
// tests/unit/core/routes/hooks/useAuthValidation.test.ts
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
    } as ReturnType<typeof useAuthStore>)

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
    } as ReturnType<typeof useAuthStore>)

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
    } as ReturnType<typeof useAuthStore>)

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
    } as ReturnType<typeof useAuthStore>)

    const { result } = renderHook(() => useAuthValidation())
    expect(result.current.isLoading).toBe(true)
  })
})
```

**Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/core/routes/hooks/useAuthValidation.test.ts`

Expected: FAIL — module doesn't exist.

**Step 3: Implement useAuthValidation**

```typescript
// src/core/routes/hooks/useAuthValidation.ts
'use client'

import { useAuthStore } from '@/core/store/auth-store'

interface AuthValidationResult {
  isValid: boolean
  isLoading: boolean
}

export function useAuthValidation(): AuthValidationResult {
  const { isAuthenticated, isLoading, session } = useAuthStore()

  const isValid =
    isAuthenticated &&
    !!session?.accessToken &&
    !!session?.tenantId

  return { isValid, isLoading }
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/unit/core/routes/hooks/useAuthValidation.test.ts`

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/core/routes/hooks/useAuthValidation.ts tests/unit/core/routes/hooks/useAuthValidation.test.ts
git commit -m "feat|NELLA-34|20260223|Create useAuthValidation hook with tests"
```

---

### Task 2.2: Create usePermissions hook with tests

**Files:**
- Create: `src/core/routes/hooks/usePermissions.ts`
- Create: `tests/unit/core/routes/hooks/usePermissions.test.ts`

**Step 1: Write failing tests**

```typescript
// tests/unit/core/routes/hooks/usePermissions.test.ts
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
    vi.mocked(useAuthStore).mockReturnValue({
      user: { role: 'admin' },
    } as ReturnType<typeof useAuthStore>)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('workflows')).toBe(true)
    expect(result.current.hasPermission('contacts')).toBe(true)
  })

  it('agent has permission to contacts but not workflows settings', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      user: { role: 'agent' },
    } as ReturnType<typeof useAuthStore>)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('contacts')).toBe(true)
    expect(result.current.hasPermission('dashboard')).toBe(true)
    expect(result.current.hasPermission('administration')).toBe(false)
  })

  it('viewer cannot access kanban or workflows', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      user: { role: 'viewer' },
    } as ReturnType<typeof useAuthStore>)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('dashboard')).toBe(true)
    expect(result.current.hasPermission('contacts')).toBe(true)
    expect(result.current.hasPermission('kanban')).toBe(false)
    expect(result.current.hasPermission('administration')).toBe(false)
  })

  it('hasAnyPermission returns true when user has at least one', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      user: { role: 'agent' },
    } as ReturnType<typeof useAuthStore>)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasAnyPermission(['administration', 'contacts'])).toBe(true)
  })

  it('hasAnyPermission with requireAll returns false when missing one', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      user: { role: 'agent' },
    } as ReturnType<typeof useAuthStore>)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasAnyPermission(['administration', 'contacts'], true)).toBe(false)
  })

  it('returns no permissions when user is null', async () => {
    const { useAuthStore } = await import('@/core/store/auth-store')
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
    } as ReturnType<typeof useAuthStore>)

    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('dashboard')).toBe(false)
  })
})
```

**Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/core/routes/hooks/usePermissions.test.ts`

**Step 3: Implement usePermissions**

```typescript
// src/core/routes/hooks/usePermissions.ts
'use client'

import { useAuthStore } from '@/core/store/auth-store'

type Module =
  | 'dashboard'
  | 'contacts'
  | 'kanban'
  | 'calendar'
  | 'chat'
  | 'workflows'
  | 'settings'
  | 'administration'

// Role-based module access matrix
const ROLE_PERMISSIONS: Record<string, Module[]> = {
  admin: [
    'dashboard', 'contacts', 'kanban', 'calendar',
    'chat', 'workflows', 'settings', 'administration',
  ],
  agent: [
    'dashboard', 'contacts', 'kanban', 'calendar',
    'chat', 'workflows', 'settings',
  ],
  viewer: [
    'dashboard', 'contacts', 'calendar', 'settings',
  ],
}

export function usePermissions() {
  const { user } = useAuthStore()

  function hasPermission(module: string, _submodule?: string): boolean {
    if (!user?.role) return false
    const allowed = ROLE_PERMISSIONS[user.role] ?? []
    return allowed.includes(module as Module)
  }

  function hasAnyPermission(modules: string[], requireAll = false): boolean {
    if (!user?.role) return false
    if (requireAll) {
      return modules.every((m) => hasPermission(m))
    }
    return modules.some((m) => hasPermission(m))
  }

  return { hasPermission, hasAnyPermission }
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/unit/core/routes/hooks/usePermissions.test.ts`

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/core/routes/hooks/usePermissions.ts tests/unit/core/routes/hooks/usePermissions.test.ts
git commit -m "feat|NELLA-34|20260223|Create usePermissions hook with role matrix"
```

---

### Task 2.3: Update ProtectedRoute to use new hooks

**Files:**
- Modify: `src/core/routes/ProtectedRoute.tsx`

**Step 1: Rewrite ProtectedRoute.tsx**

Replace the entire file content:

```tsx
// src/core/routes/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthValidation } from '@/core/routes/hooks/useAuthValidation'

interface ProtectedRouteProps {
  children: React.ReactNode
  module?: string
}

export function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const router = useRouter()
  const { isValid, isLoading } = useAuthValidation()

  useEffect(() => {
    if (!isLoading && !isValid) {
      router.replace('/login')
    }
  }, [isValid, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'rgba(158,255,0,0.3)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!isValid) return null

  return <>{children}</>
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 3: Run full test suite**

Run: `npx vitest run`

Expected: ALL PASS.

**Step 4: Commit**

```bash
git add src/core/routes/ProtectedRoute.tsx
git commit -m "refactor|NELLA-34|20260223|Update ProtectedRoute to use useAuthValidation"
```

---

## PASO 3 — Orphaned Directory Cleanup

### Task 3.1: Replace src/stores/ imports with core/store imports

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx` — change `@/stores/auth-store` → `@/core/store/auth-store`
- Modify: `src/core/api/api-client.ts` — change `@/stores/auth-store` → `@/core/store/auth-store`
- Modify: `src/core/routes/ProtectedRoute.tsx` — already uses `@/core/store/auth-store` (verify)
- Modify: `src/shared/hooks/useLogout.ts` — change `@/stores/auth-store` → `@/core/store/auth-store`

**Step 1: Update imports in each file**

In `src/app/(dashboard)/layout.tsx`, replace:
```typescript
import { useAuthStore } from '@/stores/auth-store'
```
with:
```typescript
import { useAuthStore } from '@/core/store/auth-store'
```

In `src/core/api/api-client.ts`, replace:
```typescript
import { useAuthStore } from '@/stores/auth-store'
```
with:
```typescript
import { useAuthStore } from '@/core/store/auth-store'
```

In `src/shared/hooks/useLogout.ts`, replace:
```typescript
import { useAuthStore } from '@/stores/auth-store'
```
with:
```typescript
import { useAuthStore } from '@/core/store/auth-store'
```

**Step 2: Verify no more imports from `@/stores/`**

Run: `grep -r "from '@/stores/" src/ --include="*.ts" --include="*.tsx" -l`

Expected: No results.

**Step 3: Delete src/stores/ directory**

```bash
rm src/stores/auth-store.ts src/stores/calendar-store.ts src/stores/kanban-store.ts
rmdir src/stores
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 5: Run tests**

Run: `npx vitest run`

Expected: ALL PASS.

**Step 6: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx src/core/api/api-client.ts src/shared/hooks/useLogout.ts
git rm src/stores/auth-store.ts src/stores/calendar-store.ts src/stores/kanban-store.ts
git commit -m "refactor|NELLA-34|20260223|Remove orphaned src/stores use core/store"
```

---

### Task 3.2: Replace src/types/ imports and delete

**Files:**
- Modify: `src/lib/auth/auth-service.ts` — change `@/types/auth-types` → `@/modules/auth/types/auth-types`
- Modify: `src/lib/auth/auth-storage.ts` — same change
- Modify: `src/lib/auth/auth-validations.ts` — same change
- Modify: `src/modules/auth/components/registration-step-1.tsx` — same change

**Step 1: Update each import**

In all 4 files, replace:
```typescript
import ... from '@/types/auth-types'
```
with:
```typescript
import ... from '@/modules/auth/types/auth-types'
```

**Step 2: Verify no more imports from `@/types/`**

Run: `grep -r "from '@/types/" src/ --include="*.ts" --include="*.tsx" -l`

Expected: No results.

**Step 3: Delete src/types/ directory**

```bash
rm src/types/auth-types.ts src/types/calendar-types.ts src/types/contacts.ts src/types/contact-types.ts src/types/kanban-types.ts src/types/index.ts
rmdir src/types
```

**Step 4: Verify TypeScript compiles and tests pass**

Run: `npx tsc --noEmit && npx vitest run`

**Step 5: Commit**

```bash
git add src/lib/auth/ src/modules/auth/components/registration-step-1.tsx
git rm -r src/types/
git commit -m "refactor|NELLA-34|20260223|Remove orphaned src/types use module types"
```

---

### Task 3.3: Clean orphaned src/hooks/ re-exports

**Step 1: Verify no active consumers import from `@/hooks/`**

Run: `grep -r "from '@/hooks/" src/ --include="*.ts" --include="*.tsx" -l`

If any files still import from `@/hooks/`, update them to import from the module location instead (e.g., `@/modules/kanban/hooks/`, `@/modules/calendar/hooks/`, etc.).

Specifically check if `src/hooks/useRegistrationWizard.ts` is imported by anyone:

Run: `grep -r "useRegistrationWizard" src/ --include="*.ts" --include="*.tsx" -l`

If `useRegistrationWizard.ts` is still actively used, move it to `src/modules/auth/hooks/useRegistrationWizard.ts` and update imports.

**Step 2: Delete deprecated re-export files**

```bash
rm src/hooks/useCalendarEvents.ts src/hooks/useChat.ts src/hooks/useContacts.ts
rm src/hooks/useLeads.ts src/hooks/use-metrics.ts src/hooks/useMetrics.ts
rm src/hooks/use-metrics-socket.ts src/hooks/use-projects.ts
rm src/hooks/useWorkflow.ts src/hooks/useWorkflowCredentials.ts
rm -rf src/hooks/kanban/
```

Handle `useRegistrationWizard.ts` separately — if still active, move to auth module first.

**Step 3: Delete the directory**

```bash
rmdir src/hooks 2>/dev/null || true
```

**Step 4: Verify TypeScript compiles and tests pass**

Run: `npx tsc --noEmit && npx vitest run`

**Step 5: Commit**

```bash
git rm -r src/hooks/
git commit -m "refactor|NELLA-34|20260223|Remove orphaned src/hooks use module hooks"
```

---

## PASO 4 — Missing Directory Structure

### Task 4.1: Create core/config/ with query client

**Files:**
- Create: `src/core/config/query-client.ts`
- Modify: `src/providers/query-provider.tsx`

**Step 1: Extract query client config**

```typescript
// src/core/config/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  })
}
```

**Step 2: Update query-provider.tsx to use it**

Replace `src/providers/query-provider.tsx`:

```typescript
// src/providers/query-provider.tsx
"use client"

import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { createQueryClient } from '@/core/config/query-client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**Step 3: Move query-keys to core/config/** (optional — queryKeys is already in `core/api/`, both locations are valid. Skip if team prefers current location.)

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add src/core/config/query-client.ts src/providers/query-provider.tsx
git commit -m "refactor|NELLA-34|20260223|Extract query client config to core/config"
```

---

### Task 4.2: Create remaining missing directories

**Files:**
- Create: `src/core/types/api.types.ts`
- Create: `src/shared/utils/index.ts`
- Create: `src/shared/data/index.ts`
- Create: `src/shared/layouts/index.ts`

**Step 1: Create core/types with API response types**

```typescript
// src/core/types/api.types.ts
// Generic API response types aligned with backend contract

export interface ApiResponse<T> {
  data: T
  message?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}
```

**Step 2: Create shared/utils barrel**

```typescript
// src/shared/utils/index.ts
// Shared utility functions — migrate from src/lib/ as needed
export {}
```

**Step 3: Create shared/data barrel**

```typescript
// src/shared/data/index.ts
// Shared static data — migrate from src/lib/ as needed
export {}
```

**Step 4: Create shared/layouts barrel**

```typescript
// src/shared/layouts/index.ts
// Shared layout components
// Note: In Next.js App Router, primary layouts live in app/ route groups.
// This directory is for reusable layout primitives (e.g., page shells, split panes).
export {}
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/core/types/ src/shared/utils/ src/shared/data/ src/shared/layouts/
git commit -m "refactor|NELLA-34|20260223|Create missing dirs core/types shared/utils data layouts"
```

---

## PASO 5 — Standardize Mutations with useApiError

### Task 5.1: Fix useLogin and useRegister

**Files:**
- Modify: `src/modules/auth/hooks/useLogin.ts`
- Modify: `src/modules/auth/hooks/useRegister.ts`

**Step 1: Update useLogin.ts**

Replace the file content:

```typescript
// src/modules/auth/hooks/useLogin.ts
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/modules/auth/services/auth-service'
import { useAuthStore } from '@/core/store/auth-store'
import { useApiError } from '@/shared/hooks/useApiError'

interface LoginInput {
  email: string
  password: string
}

export function useLogin() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      authService.login(email, password),
    onSuccess: ({ user, session }) => {
      setUser(user)
      setSession(session)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al iniciar sesión',
      })
    },
  })
}
```

**Step 2: Update useRegister.ts**

Replace the file content:

```typescript
// src/modules/auth/hooks/useRegister.ts
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/modules/auth/services/auth-service'
import { useAuthStore } from '@/core/store/auth-store'
import { useApiError } from '@/shared/hooks/useApiError'
import type { RegistrationFormData } from '@/modules/auth/types/auth-types'

export function useRegister() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (formData: RegistrationFormData) => authService.register(formData),
    onSuccess: ({ user, session }) => {
      setUser(user)
      setSession(session)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al registrar usuario',
      })
    },
  })
}
```

**Step 3: Run tests**

Run: `npx vitest run tests/unit/modules/auth/hooks/useLogin.test.ts`

Expected: PASS (test mocks toast.error which useApiError calls internally).

**Step 4: Commit**

```bash
git add src/modules/auth/hooks/useLogin.ts src/modules/auth/hooks/useRegister.ts
git commit -m "refactor|NELLA-34|20260223|Standardize auth mutations with useApiError"
```

---

### Task 5.2: Fix useCreateProject

**Files:**
- Modify: `src/modules/dashboard/hooks/useProjects.ts`

**Step 1: Add missing onError handler**

Replace the file content:

```typescript
// src/modules/dashboard/hooks/useProjects.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { useApiError } from '@/shared/hooks/useApiError'
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
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (name: string) =>
      apiClient.post<Project>('/api/projects', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.projects() })
      toast.success('Proyecto creado correctamente')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al crear proyecto',
      })
    },
  })
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/modules/dashboard/hooks/useProjects.ts
git commit -m "refactor|NELLA-34|20260223|Add error handling to useCreateProject mutation"
```

---

### Task 5.3: Fix useWorkflowCredentials

**Files:**
- Modify: `src/modules/workflows/hooks/useWorkflowCredentials.ts`

**Step 1: Replace console.log/error with toast and useApiError**

Replace the file content:

```typescript
// src/modules/workflows/hooks/useWorkflowCredentials.ts
"use client"

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workflowService } from '@/modules/workflows/services/workflow-service'
import { useApiError } from '@/shared/hooks/useApiError'
import type { WorkflowCredentials } from '@/modules/workflows/types/workflow-types'

export function useWorkflowCredentials(workflowId: string) {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  const [isValidating, setIsValidating] = useState(false)

  const { data: credentials } = useQuery({
    queryKey: ['workflow-credentials', workflowId],
    queryFn: async () => {
      const creds = await workflowService.getCredentials(workflowId)
      return creds
    },
    staleTime: 10 * 60 * 1000,
  })

  const { mutate: updateCredential, isPending: isUpdating } = useMutation({
    mutationFn: async (newCreds: WorkflowCredentials) => {
      await workflowService.updateCredentials(workflowId, newCreds)
      return newCreds
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-credentials', workflowId] })
      toast.success('Credenciales actualizadas correctamente')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al actualizar credenciales',
      })
    },
  })

  const validateCredential = async (type: 'whatsapp' | 'openai' | 'anthropic', token: string) => {
    setIsValidating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const isValid = await workflowService.validateCredential(type, token)

      if (isValid) {
        toast.success(`Token de ${type} validado correctamente`)
      } else {
        toast.error(`Token de ${type} inválido`)
      }

      return isValid
    } catch (error) {
      handleError(error, {
        showToast: true,
        fallbackMessage: `Error al validar token de ${type}`,
      })
      return false
    } finally {
      setIsValidating(false)
    }
  }

  return {
    credentials: credentials || {
      whatsapp_token: '',
      openai_api_key: '',
      anthropic_api_key: ''
    },
    updateCredential,
    validateCredential,
    isUpdating,
    isValidating,
  }
}
```

**Step 2: Verify TypeScript compiles and tests pass**

Run: `npx tsc --noEmit && npx vitest run`

**Step 3: Commit**

```bash
git add src/modules/workflows/hooks/useWorkflowCredentials.ts
git commit -m "refactor|NELLA-34|20260223|Replace console.log with toast in useWorkflowCredentials"
```

---

## PASO 6 — Path Aliases

### Task 6.1: Add path aliases to tsconfig.json

**Files:**
- Modify: `tsconfig.json`

**Step 1: Add the prescribed aliases**

Update the `paths` section in `tsconfig.json`:

```json
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@shared/*": ["./src/shared/*"],
      "@modules/*": ["./src/modules/*"],
      "@components/*": ["./src/components/*"]
    },
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: PASS — new aliases don't break existing `@/` imports.

**Note:** Do NOT refactor existing `@/core/...` imports to `@core/...` in this PR. The aliases are additive. Future code should prefer the short aliases; existing code will be migrated gradually.

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "feat|NELLA-34|20260223|Add path aliases core shared modules components"
```

---

## PASO 7 — Environment Documentation

### Task 7.1: Create .env.example

**Files:**
- Create: `.env.example`

**Step 1: Create the file**

```bash
# .env.example
# Backend NestJS URL (server-side only)
BACKEND_URL=http://localhost:3000

# Public domain for tenant detection
NEXT_PUBLIC_APP_DOMAIN=localhost

# Public backend URL (for client-side awareness if needed)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Tenant subdomain fallback for localhost development
NEXT_PUBLIC_TENANT_SUBDOMAIN=acme

# Chatwoot configuration (server-side only)
CHATWOOT_URL=http://localhost:3001
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs|NELLA-34|20260223|Add .env.example for dev onboarding"
```

---

## PASO 8 — Refactor Oversized File

### Task 8.1: Extract BulkUpdatesTab component

**Files:**
- Create: `src/modules/workflows/components/administration/BulkUpdatesTab.tsx`
- Modify: `src/app/(dashboard)/settings/administration/page.tsx`

**Step 1: Extract lines 138-643 from page.tsx into a new component**

Create `src/modules/workflows/components/administration/BulkUpdatesTab.tsx` containing the `BulkUpdatesTab` function component. Copy lines 138-643 from the page, adding necessary imports at the top.

**Step 2: Extract MigracionesTab component**

Create `src/modules/workflows/components/administration/MigracionesTab.tsx` containing lines 645-1178 from the page.

**Step 3: Update page.tsx to import extracted components**

Replace the page to only contain the layout and tab switching logic (~135 lines):

```tsx
// src/app/(dashboard)/settings/administration/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HudBackground } from "@/modules/auth/components/hud-background";
import { HudCorners } from "@/components/ui/hud-corners";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, Users, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { BulkUpdatesTab } from "@/modules/workflows/components/administration/BulkUpdatesTab";
import { MigracionesTab } from "@/modules/workflows/components/administration/MigracionesTab";

export default function AdministracionPage() {
  // ... keep lines 24-134 as is, but import components instead of inline
```

The page should now be ~50 lines. Each extracted tab component should be ~500 lines or less.

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add src/modules/workflows/components/administration/ src/app/\(dashboard\)/settings/administration/page.tsx
git commit -m "refactor|NELLA-34|20260223|Extract admin tabs to keep files under 500 lines"
```

---

## Final Validation

### Task FINAL: Full build + lint + test verification

**Step 1: Run all unit tests**

Run: `npx vitest run`

Expected: All tests pass (50+ tests).

**Step 2: TypeScript check**

Run: `npx tsc --noEmit`

Expected: 0 errors.

**Step 3: Build**

Run: `npx next build`

Expected: Build succeeds.

**Step 4: Verify no localStorage reads in modules**

Run: `grep -r "localStorage.getItem" src/modules/ --include="*.ts" --include="*.tsx"`

Expected: Only `workflow-storage.ts` (workflow config, not auth).

**Step 5: Verify no orphaned directory imports**

Run:
```bash
grep -r "from '@/hooks/" src/ --include="*.ts" --include="*.tsx" -l
grep -r "from '@/stores/" src/ --include="*.ts" --include="*.tsx" -l
grep -r "from '@/types/" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: All return empty.

**Step 6: Push and update PR**

```bash
git push origin feature/nella-36
```

---

## Acceptance Criteria Summary

| Criterio | Verificacion |
|---------|-------------|
| Token refresh en 401 | api-client intenta refresh antes de logout |
| Loop prevention | Flag `isRefreshing` previene refresh concurrentes |
| No refresh en auth endpoints | `/api/auth/*` no dispara refresh |
| useApiError maneja 400 | Test verifica "Datos invalidos" |
| useAuthValidation existe | Hook en core/routes/hooks/ con tests |
| usePermissions existe | Hook con hasPermission + hasAnyPermission + tests |
| ProtectedRoute usa nuevos hooks | Importa useAuthValidation, no useAuthStore directo |
| src/stores/ eliminado | Todos los imports usan core/store |
| src/types/ eliminado | Todos los imports usan modules/*/types |
| src/hooks/ eliminado | Todos los imports usan modules/*/hooks o shared/hooks |
| core/config/ existe | queryClient extraido |
| core/types/ existe | api.types.ts con genericos |
| shared/utils,data,layouts existen | Barrels creados |
| Mutations estandarizadas | useLogin, useRegister, useCreateProject, useWorkflowCredentials usan useApiError |
| Path aliases configurados | tsconfig tiene @core, @shared, @modules, @components |
| .env.example existe | Documentacion para onboarding |
| admin page < 500 lineas | Tabs extraidos a componentes separados |
