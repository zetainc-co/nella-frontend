import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders, unwrapBackend } from '@/core/api/backend-proxy'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'



export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL}/dify/validate`, {
      method: 'POST',
      headers: backendHeaders(request),
      body: JSON.stringify(body),
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

    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[API/dify/validate POST]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
