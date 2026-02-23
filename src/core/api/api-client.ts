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
