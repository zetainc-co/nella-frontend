import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders, unwrapBackend } from '@/lib/backend-fetch'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * GET /api/chatwoot-agents - List all agents
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/chatwoot-agents`, {
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
      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[API/chatwoot-agents GET]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}

/**
 * POST /api/chatwoot-agents - Create a new agent
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL}/chatwoot-agents`, {
      method: 'POST',
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

    return NextResponse.json(unwrapBackend(data), { status: 201 })
  } catch (error) {
    console.error('[API/chatwoot-agents POST]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
