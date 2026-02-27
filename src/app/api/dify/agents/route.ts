import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders, unwrapBackend } from '@/lib/backend-fetch'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL}/dify/agents`, {
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
      const d = data as { message?: string | string[]; error?: string }
      const raw = d?.message ?? d?.error ?? 'Backend error'
      const message = Array.isArray(raw) ? raw[0] : raw
      return NextResponse.json({ message }, { status: response.status })
    }

    return NextResponse.json(unwrapBackend(data), { status: 201 })
  } catch (error) {
    console.error('[API/dify/agents POST]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
