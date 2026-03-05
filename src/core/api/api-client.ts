import { useAuthStore } from '@/core/store/auth-store'

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

function getAuthHeaders(): Record<string, string> {
  const { session } = useAuthStore.getState()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`
  if (session?.tenantSlug) headers['X-Tenant-Id'] = session.tenantSlug
  return headers
}

async function attemptTokenRefresh(): Promise<boolean> {
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
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...(options.headers as Record<string, string> | undefined),
          },
        })

        if (retryResponse.ok) {
          // Handle 204 No Content
          if (retryResponse.status === 204) {
            return undefined as T
          }
          const data = await retryResponse.json()
          return data as T
        }

        if (retryResponse.status === 401) {
          forceLogout()
        }

        let retryData: unknown
        try { retryData = await retryResponse.json() } catch { /* empty */ }
        const message = (retryData as { message?: string })?.message ?? 'Error en la solicitud'
        const error = new Error(message)
        ;(error as Error & { status?: number }).status = retryResponse.status
        throw error
      }
    }

    forceLogout()
  }

  // Handle 204 No Content (e.g., DELETE requests)
  if (response.status === 204) {
    return undefined as T
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
