// src/app/api/auth/google-calendar/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl, extractAuthHeaders } from '@/core/api/backend-proxy'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(getBackendUrl('/auth/google-calendar/status'), {
      headers: extractAuthHeaders(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/auth/google-calendar/status GET] Error:', error)
    return NextResponse.json({ error: 'Error al verificar estado de Google Calendar' }, { status: 500 })
  }
}
