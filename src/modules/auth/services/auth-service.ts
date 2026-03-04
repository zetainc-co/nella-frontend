import type { RegistrationFormData, User, Session } from '@/modules/auth/types/auth-types'

function getTenantSubdomain(): string {
  if (typeof window === 'undefined') return ''
  const hostname = window.location.hostname
  const appDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost').split(':')[0]

  // zetainc.localhost → "zetainc", acme.nella.app → "acme"
  if (hostname.endsWith(`.${appDomain}`)) {
    const subdomain = hostname.slice(0, hostname.length - appDomain.length - 1)
    if (subdomain && subdomain !== 'www' && !subdomain.includes('.')) {
      return subdomain
    }
  }

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
      throw new Error(data.error ?? 'Credenciales invalidas')
    }

    // NestJS returns { data: { accessToken, ... } } or { accessToken, ... } depending on interceptor
    const response = (data.data ?? data) as LoginResponse

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

    const response = (data.data ?? data) as LoginResponse

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

  async forgotPassword(email: string): Promise<void> {
    const tenantSlug = getTenantSubdomain()

    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, tenantSlug }),
    })

    // Always resolves — endpoint always returns 200 regardless of email existence
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const tenantSlug = getTenantSubdomain()

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword, tenantSlug }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error ?? 'Código inválido o expirado')
    }
  },
}
