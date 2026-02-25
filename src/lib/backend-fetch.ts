import { NextRequest } from 'next/server'

export function backendHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = request.headers.get('authorization')
  if (auth) headers['Authorization'] = auth
  const tenant = request.headers.get('x-tenant-id')
  if (tenant) headers['X-Tenant-Id'] = tenant
  return headers
}

/**
 * Unwrap NestJS createResponse envelope: { status, message, data } → data
 * If the response doesn't have that shape, returns it as-is.
 */
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
