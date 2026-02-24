// src/app/api/calendar/booking-links/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl, extractAuthHeaders } from '@/lib/backend-proxy'
import { unwrapBackend } from '@/lib/backend-fetch'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(getBackendUrl('/calendar/booking-links'), {
      headers: extractAuthHeaders(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[API/calendar/booking-links GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener links de agendamiento' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(getBackendUrl('/calendar/booking-links'), {
      method: 'POST',
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

    return NextResponse.json(unwrapBackend(data), { status: 201 })
  } catch (error) {
    console.error('[API/calendar/booking-links POST] Error:', error)
    return NextResponse.json({ error: 'Error al crear el link de agendamiento' }, { status: 500 })
  }
}
