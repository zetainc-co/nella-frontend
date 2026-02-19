import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders } from '@/lib/backend-fetch'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const period = request.nextUrl.searchParams.get('period') ?? 'all'
  try {
    const response = await fetch(
      `${BACKEND_URL}/metrics/project/${projectId}?period=${encodeURIComponent(period)}`,
      { method: 'GET', headers: backendHeaders(request) },
    )
    let data: unknown
    try {
      data = await response.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: response.status || 502 }
      )
    }
    if (!response.ok) {
      const message = (data as { message?: string })?.message ?? 'Backend error'
      return NextResponse.json({ error: message }, { status: response.status })
    }
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/metrics GET]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
