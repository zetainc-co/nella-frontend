// src/lib/backend-proxy.ts
// Server-side helper for proxying requests to the backend API
import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export function getBackendUrl(path: string): string {
  return `${BACKEND_URL}${path}`
}

export function extractAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}
  const auth = request.headers.get('Authorization')
  const tenantId = request.headers.get('X-Tenant-Id')
  if (auth) headers['Authorization'] = auth
  if (tenantId) headers['X-Tenant-Id'] = tenantId
  return headers
}
