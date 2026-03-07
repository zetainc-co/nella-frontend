import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders } from '@/core/api/backend-proxy'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'



export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  try {
    const { tenantId, id } = await params

    const response = await fetch(`${BACKEND_URL}/dify/agents/${tenantId}/${id}`, {
      method: 'DELETE',
      headers: backendHeaders(request),
    })

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (!response.ok) {
      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/dify/agents DELETE]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
