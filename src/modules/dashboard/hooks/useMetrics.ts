'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { getMockApiMetricsForProject } from '@/modules/dashboard/mocks/api-metrics.mock'
import type { ProjectMetrics } from '@/modules/dashboard/types/dashboard-types'

export type Period = 'all' | '30d' | 'prev_month' | 'quarter' | 'year'

export function useMetrics(projectId: string | null, period: Period = 'all') {
  return useQuery<ProjectMetrics>({
    queryKey: queryKeys.dashboard.metrics(projectId ?? '', period),
    queryFn: async () => {
      try {
        const response = await apiClient.get<ProjectMetrics>(
          `/api/metrics/${projectId}?period=${encodeURIComponent(period)}`
        )
        return response
      } catch (error) {
        // Fallback to mock data if API fails
        console.warn(`[useMetrics] API failed for project ${projectId}, using mock data`, error)
        return getMockApiMetricsForProject(projectId ?? '')
      }
    },
    enabled: !!projectId,
    staleTime: 10_000,
  })
}
