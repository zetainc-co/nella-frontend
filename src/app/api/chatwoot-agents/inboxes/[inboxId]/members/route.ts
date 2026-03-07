import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders, unwrapBackend } from '@/core/api/backend-proxy'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * GET /api/chatwoot-agents/inboxes/:inboxId/members - List inbox members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inboxId: string }> },
) {
  try {
    const { inboxId } = await params

    const response = await fetch(
      `${BACKEND_URL}/chatwoot-agents/inboxes/${inboxId}/members`,
      {
        method: 'GET',
        headers: backendHeaders(request),
      },
    )

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
    console.error('[API/chatwoot-agents/inboxes/:inboxId/members GET]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}

/**
 * POST /api/chatwoot-agents/inboxes/:inboxId/members - Add members to inbox
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inboxId: string }> },
) {
  try {
    const { inboxId } = await params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const response = await fetch(
      `${BACKEND_URL}/chatwoot-agents/inboxes/${inboxId}/members`,
      {
        method: 'POST',
        headers: backendHeaders(request),
        body: JSON.stringify(body),
      },
    )

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
    console.error('[API/chatwoot-agents/inboxes/:inboxId/members POST]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}

/**
 * PATCH /api/chatwoot-agents/inboxes/:inboxId/members - Update inbox members
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ inboxId: string }> },
) {
  try {
    const { inboxId } = await params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const response = await fetch(
      `${BACKEND_URL}/chatwoot-agents/inboxes/${inboxId}/members`,
      {
        method: 'PATCH',
        headers: backendHeaders(request),
        body: JSON.stringify(body),
      },
    )

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
    console.error('[API/chatwoot-agents/inboxes/:inboxId/members PATCH]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
