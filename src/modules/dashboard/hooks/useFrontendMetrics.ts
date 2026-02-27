'use client'

import { useMemo } from 'react'
import {
  getTeamPerformanceMockData,
  getLeadsChartMockData,
  getAIOptimizationMockData,
  type TeamMember,
  type ChartDataPoint,
  type AIOptimizationMetric,
} from '@/modules/dashboard/mocks/frontend-metrics.mock'

/**
 * Hook that provides frontend-only metrics (no API calls)
 * These metrics don't have backend endpoints and are served as mocks
 */
export function useFrontendMetrics(projectId: string) {
  const teamPerformance = useMemo(() => getTeamPerformanceMockData(projectId), [projectId])
  const leadsChart = useMemo(() => getLeadsChartMockData(projectId), [projectId])
  const aiOptimization = useMemo(() => getAIOptimizationMockData(), [])

  return {
    teamPerformance,
    leadsChart,
    aiOptimization,
    isLoading: false,
  }
}
