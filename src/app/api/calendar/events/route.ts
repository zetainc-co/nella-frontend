// src/app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl, extractAuthHeaders, unwrapBackend } from '@/core/api/backend-proxy'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const layer = searchParams.get('layer')
    const project = searchParams.get('project')
    const user_id = searchParams.get('user_id')

    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (layer) params.set('layer', layer)
    if (project) params.set('project', project)
    if (user_id) params.set('user_id', user_id)

    const response = await fetch(`${getBackendUrl('/calendar/events')}?${params.toString()}`, {
      headers: extractAuthHeaders(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const rawData = unwrapBackend(data)

    // Normalizar: el backend puede devolver { items: [...] }, [...] directo, o { data: [...] }
    let events: unknown[]
    if (Array.isArray(rawData)) {
      events = rawData
    } else if (rawData && typeof rawData === 'object' && 'items' in rawData) {
      events = (rawData as { items: unknown[] }).items ?? []
    } else {
      events = []
    }

    return NextResponse.json({ data: events }, { status: 200 })
  } catch (error) {
    console.error('[API/calendar/events GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(getBackendUrl('/calendar/events'), {
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
    console.error('[API/calendar/events POST] Error:', error)
    return NextResponse.json({ error: 'Error al crear el evento' }, { status: 500 })
  }
}
