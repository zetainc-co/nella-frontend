// src/app/api/calendar/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl, extractAuthHeaders, unwrapBackend } from '@/core/api/backend-proxy'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    const params = new URLSearchParams()
    if (user_id) params.set('user_id', user_id)

    const url = user_id
      ? `${getBackendUrl('/calendar/availability')}?${params.toString()}`
      : getBackendUrl('/calendar/availability')

    const response = await fetch(url, {
      headers: extractAuthHeaders(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const rawData = unwrapBackend(data)
    // Normalizar: el backend puede devolver el array directo o { data: [...] }
    const availability = Array.isArray(rawData) ? rawData : []
    return NextResponse.json({ data: availability }, { status: 200 })
  } catch (error) {
    console.error('[API/calendar/availability GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener disponibilidad' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(getBackendUrl('/calendar/availability'), {
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
    console.error('[API/calendar/availability PUT] Error:', error)
    return NextResponse.json({ error: 'Error al guardar disponibilidad' }, { status: 500 })
  }
}
