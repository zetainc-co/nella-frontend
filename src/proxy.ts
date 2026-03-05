// src/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

/**
 * Extrae el tenant slug del subdominio del host.
 *
 * Producción:  test.nella.app  + APP_DOMAIN=nella.app  → "test"
 * Local:       test.localhost   + APP_DOMAIN=localhost  → "test"
 * Sin tenant:  localhost:3001   + APP_DOMAIN=localhost  → null
 */
function extractTenantSlug(hostname: string): string | null {
  // Quitar el puerto si existe
  const host = hostname.split(':')[0]

  const appDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost').split(':')[0]

  if (!host.endsWith(`.${appDomain}`)) return null

  const subdomain = host.slice(0, host.length - appDomain.length - 1)

  // Rechazar "www" y subdominos compuestos (e.g. "a.b.nella.app")
  if (!subdomain || subdomain === 'www' || subdomain.includes('.')) return null

  return subdomain
}

export function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url)

  // API routes receive tenantSlug from the request body — skip header injection
  // (header rewriting on POST requests can break routing in Next.js dev mode)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const hostname = request.headers.get('host') || ''
  const tenantSlug = extractTenantSlug(hostname)

  const requestHeaders = new Headers(request.headers)

  if (tenantSlug) {
    requestHeaders.set('X-Tenant-Id', tenantSlug)
  } else {
    requestHeaders.delete('X-Tenant-Id')
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  // Aplica a todas las rutas excepto _next internals y archivos estáticos
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
