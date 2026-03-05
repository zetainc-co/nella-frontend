import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword, tenantSlug } = await request.json()

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (tenantSlug) headers['X-Tenant-Id'] = tenantSlug

    const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, code, newPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Código inválido o expirado' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/auth/reset-password] Error:', error)
    return NextResponse.json(
      { error: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' },
      { status: 503 }
    )
  }
}
