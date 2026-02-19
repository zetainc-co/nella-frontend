'use client'

import { useQuery } from '@tanstack/react-query'
import type { ProjectMetrics } from '@/types/auth-types'

export type Period = 'all' | '30d' | 'prev_month' | 'quarter' | 'year'

async function fetchMetrics(projectId: string, period: Period): Promise<ProjectMetrics> {
  const headers: Record<string, string> = {}
  try {
    const stored = JSON.parse(localStorage.getItem('nella-auth-storage') || 'null')
    const session = stored?.state?.session
    if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`
    if (session?.tenantSlug) headers['X-Tenant-Id'] = session.tenantSlug
  } catch {
    // localStorage not available (SSR safety)
  }

  const url = `/api/metrics/${projectId}?period=${encodeURIComponent(period)}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('Failed to fetch metrics')
  return res.json()
}

export function useMetrics(projectId: string | null, period: Period = 'all') {
  return useQuery<ProjectMetrics>({
    queryKey: ['metrics', projectId, period],
    queryFn: () => fetchMetrics(projectId!, period),
    enabled: !!projectId,
    staleTime: 10_000,
  })
}
