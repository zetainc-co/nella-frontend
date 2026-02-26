import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders, unwrapBackend } from '@/lib/backend-fetch'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * GET /api/chatwoot-agents/inboxes - List all inboxes
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/chatwoot-agents/inboxes`, {
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
    console.error('[API/chatwoot-agents/inboxes GET]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
