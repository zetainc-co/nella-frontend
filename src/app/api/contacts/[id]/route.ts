import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders } from '@/lib/backend-fetch'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const response = await fetch(`${BACKEND_URL}/contacts/${id}`, {
      method: 'GET',
      headers: backendHeaders(request),
    })

    let data: unknown
    try {
      data = await response.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: response.status || 502 },
      )
    }

    if (!response.ok) {
      const message = (data as { message?: string })?.message ?? 'Contacto no encontrado'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/contacts/[id] GET]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL}/contacts/${id}`, {
      method: 'PATCH',
      headers: backendHeaders(request),
      body: JSON.stringify(body),
    })

    let data: unknown
    try {
      data = await response.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: response.status || 502 },
      )
    }

    if (!response.ok) {
      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/contacts/[id] PATCH]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const response = await fetch(`${BACKEND_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: backendHeaders(request),
    })

    if (!response.ok) {
      let data: unknown
      try {
        data = await response.json()
      } catch {
        return NextResponse.json({ error: 'Backend error' }, { status: response.status })
      }
      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[API/contacts/[id] DELETE]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
