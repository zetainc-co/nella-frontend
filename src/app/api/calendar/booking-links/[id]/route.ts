// src/app/api/calendar/booking-links/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl, extractAuthHeaders } from '@/lib/backend-proxy'
import { unwrapBackend } from '@/lib/backend-fetch'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const response = await fetch(getBackendUrl(`/calendar/booking-links/${id}`), {
      method: 'PATCH',
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
    console.error('[API/calendar/booking-links/[id] PATCH] Error:', error)
    return NextResponse.json({ error: 'Error al actualizar el link' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const response = await fetch(getBackendUrl(`/calendar/booking-links/${id}`), {
      method: 'DELETE',
      headers: extractAuthHeaders(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[API/calendar/booking-links/[id] DELETE] Error:', error)
    return NextResponse.json({ error: 'Error al eliminar el link' }, { status: 500 })
  }
}
