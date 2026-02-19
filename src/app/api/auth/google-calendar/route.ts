// src/app/api/auth/google-calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl, extractAuthHeaders } from '@/lib/backend-proxy'

export async function DELETE(request: NextRequest) {
  try {
    const response = await fetch(getBackendUrl('/auth/google-calendar'), {
      method: 'DELETE',
      headers: extractAuthHeaders(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/auth/google-calendar DELETE] Error:', error)
    return NextResponse.json({ error: 'Error al desconectar Google Calendar' }, { status: 500 })
  }
}
