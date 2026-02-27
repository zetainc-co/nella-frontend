import { NextRequest, NextResponse } from 'next/server'
import { backendHeaders, unwrapBackend } from '@/lib/backend-fetch'
import { getMockApiMetricsForProject } from '@/modules/dashboard/mocks/api-metrics.mock'
import type { ProjectMetrics } from '@/modules/dashboard/types/dashboard-types'

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
      // Fallback to mock data
      const mockData = getMockApiMetricsForProject(projectId)
      return NextResponse.json(mockData, { status: 200 })
    }
    if (!response.ok) {
      // Fallback to mock data when backend error
      const mockData = getMockApiMetricsForProject(projectId)
      return NextResponse.json(mockData, { status: 200 })
    }
    return NextResponse.json(unwrapBackend(data), { status: 200 })
  } catch (error) {
    console.error('[API/metrics GET]', error)
    // Fallback to mock data when backend unavailable
    return NextResponse.json(MOCK_METRICS, { status: 200 })
  }
}
