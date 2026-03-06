import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export function getBackendUrl(path: string): string {
  return `${BACKEND_URL}${path}`
}

export function backendHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = request.headers.get('authorization') || request.headers.get('Authorization')
  if (auth) headers['Authorization'] = auth
  const tenant = request.headers.get('x-tenant-id') || request.headers.get('X-Tenant-Id')
  if (tenant) headers['X-Tenant-Id'] = tenant
  return headers
}

export { backendHeaders as extractAuthHeaders }

export function unwrapBackend(body: unknown): unknown {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    'message' in body
  ) {
    return (body as { data: unknown }).data
  }
  return body
}
