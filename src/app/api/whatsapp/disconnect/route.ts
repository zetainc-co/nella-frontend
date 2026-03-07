import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders } from '@/core/api/backend-proxy'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'



export async function DELETE(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/whatsapp/disconnect`, {
      method: 'DELETE',
      headers: backendHeaders(request),
    })

    let data: unknown
    try {
      data = await response.json()
    } catch {
      return NextResponse.json({ error: 'Invalid response from backend' }, { status: response.status || 502 })
    }

    if (!response.ok) {
      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/whatsapp/disconnect DELETE]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
