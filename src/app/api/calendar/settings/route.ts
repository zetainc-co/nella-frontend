// src/app/api/calendar/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl, extractAuthHeaders } from '@/lib/backend-proxy'
import { unwrapBackend } from '@/lib/backend-fetch'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(getBackendUrl('/calendar/settings'), {
      headers: extractAuthHeaders(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[API/calendar/settings GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(getBackendUrl('/calendar/settings'), {
      method: 'PUT',
      headers: {
        ...extractAuthHeaders(request),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[API/calendar/settings PUT] Error:', error)
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
