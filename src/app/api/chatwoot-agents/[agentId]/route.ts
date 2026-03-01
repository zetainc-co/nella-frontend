import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders, unwrapBackend } from '@/lib/backend-fetch'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

type RouteContext = {
  params: Promise<{ agentId: string }>
}

/**
 * PATCH /api/chatwoot-agents/:agentId - Update an agent
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { agentId } = await context.params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL}/chatwoot-agents/${agentId}`, {
      method: 'PATCH',
      headers: backendHeaders(request),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      let data: unknown
      try {
        data = await response.json()
      } catch {
        return NextResponse.json(
          { error: 'Invalid response from backend' },
          { status: response.status || 502 },
        )
      }
      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: response.status || 502 },
      )
    }

    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[API/chatwoot-agents/:agentId PATCH]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}

/**
 * DELETE /api/chatwoot-agents/:agentId - Delete an agent
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { agentId } = await context.params

    const response = await fetch(`${BACKEND_URL}/chatwoot-agents/${agentId}`, {
      method: 'DELETE',
      headers: backendHeaders(request),
    })

    if (!response.ok) {
      let data: unknown
      try {
        data = await response.json()
      } catch {
        return NextResponse.json(
          { error: 'Invalid response from backend' },
          { status: response.status || 502 },
        )
      }
      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[API/chatwoot-agents/:agentId DELETE]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
