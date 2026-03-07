import { NextRequest, NextResponse } from 'next/server'
import { unwrapBackend } from '@/core/api/backend-proxy'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/tenants/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Error al registrar la organización') },
        { status: response.status }
      )
    }

    return NextResponse.json(unwrapBackend(data), { status: 201 })
  } catch (error) {
    console.error('[API/auth/register] Error:', error)
    return NextResponse.json(
      { error: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' },
      { status: 503 }
    )
  }
}
