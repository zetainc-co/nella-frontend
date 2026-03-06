import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders, unwrapBackend } from '@/core/api/backend-proxy'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * Get Chatwoot embed URL with auto-login token
 * GET /api/chatwoot/embed-url/:tenantId
 *
 * Proxies to backend to generate JWT token for Chatwoot auto-login.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params

  try {
    const response = await fetch(
      `${BACKEND_URL}/chatwoot/embed-url/${tenantId}`,
      {
        method: 'GET',
        headers: backendHeaders(request),
      }
    )

    let data: unknown
    try {
      data = await response.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: response.status || 502 }
      )
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Chatwoot no configurado. Contacta al administrador.' },
          { status: 404 }
        )
      }

      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[Chatwoot Embed URL] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener URL de Chatwoot' },
      { status: 500 }
    )
  }
}
