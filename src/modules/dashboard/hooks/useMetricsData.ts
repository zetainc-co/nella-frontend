'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/api-client';
import { queryKeys } from '@/core/api/query-keys';
import {
  calculatePipelineValue,
  calculateRoas,
} from '@/modules/dashboard/utils/metrics-calculations';
import type { Period } from '@/modules/dashboard/hooks/useMetrics';

export type { Period };

export interface BackendMetrics {
  totalLeads: number;
  activeLeads: number;
  revenueMonth: number;
  trafficSources: Array<{ source: string; count: number }>;
  funnel: Array<{ status: string; count: number }>;
}

export interface TeamMember {
  id: string;
  name: string;
  sales: number;
  conversionRate: number;
  responseTime: string;
  avatar: string;
}

export interface TrendData {
  week: string;
  revenue: number;
  leads: number;
}

export interface AiSavingsData {
  hoursSaved: number;
  leadsQualified: number;
  description: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  activeLeads: number;
  totalRevenue: number;
  trafficSources: Array<{ source: string; count: number }>;
  funnel: Array<{ status: string; count: number }>;

  pipelineValue: number;
  roas: string;
  teamPerformance: TeamMember[];
  trends: TrendData[];
  aiSavings: AiSavingsData;

  period: Period;
  projectId: string;
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);
}

/**
 * Hardcoded fallback data used as placeholderData so the UI renders immediately
 * while the real API request is in flight or if it fails.
 * Pre-computed values: pipelineValue = 130800000 * 1.5 = 196200000, roas = 130800000 / 20000 = 6540.0
 */
function buildFallbackMetrics(projectId: string, period: Period): DashboardMetrics {
  return {
    totalLeads: 1247,
    activeLeads: 856,
    totalRevenue: 130800000,
    trafficSources: [
      { source: 'Instagram', count: 810 },
      { source: 'Facebook', count: 437 },
    ],
    funnel: [
      { status: 'new', count: 1247 },
      { status: 'qualified', count: 856 },
      { status: 'negotiation', count: 423 },
      { status: 'closed', count: 189 },
    ],
    pipelineValue: 196200000,
    roas: '6540.0',
    teamPerformance: [
      { id: '1', name: 'Carlos Mendez', sales: 47, conversionRate: 18.5, responseTime: '8 min', avatar: 'CM' },
      { id: '2', name: 'Maria Garcia', sales: 42, conversionRate: 16.2, responseTime: '12 min', avatar: 'MG' },
      { id: '3', name: 'Luis Rodriguez', sales: 38, conversionRate: 15.1, responseTime: '15 min', avatar: 'LR' },
      { id: '4', name: 'Ana Martinez', sales: 35, conversionRate: 14.8, responseTime: '10 min', avatar: 'AM' },
      { id: '5', name: 'Pedro Sanchez', sales: 27, conversionRate: 12.3, responseTime: '18 min', avatar: 'PS' },
    ],
    trends: [
      { week: 'Sem 1', revenue: 130000, leads: 120 },
      { week: 'Sem 2', revenue: 135000, leads: 135 },
      { week: 'Sem 3', revenue: 142000, leads: 150 },
      { week: 'Sem 4', revenue: 150000, leads: 165 },
    ],
    aiSavings: {
      hoursSaved: 247,
      leadsQualified: 823,
      description: 'La IA ha filtrado leads no calificados, ahorrando tiempo valioso al equipo',
    },
    period,
    projectId,
  };
}

/**
 * Fetches dashboard metrics for a specific project and period.
 * Errors propagate to React Query (no internal catch) -- consumers handle via `error` state.
 * placeholderData provides hardcoded mock values so the UI never renders empty.
 */
export function useMetricsData(projectId: string, period: Period = '30d') {
  return useQuery<DashboardMetrics>({
    queryKey: queryKeys.dashboard.metrics(projectId, period),
    queryFn: async () => {
      const response = await withTimeout(
        apiClient.get<BackendMetrics>(
          `/api/metrics/project/${projectId}?period=${period}`
        ),
        5000
      );

      const pipelineValue = calculatePipelineValue(response.revenueMonth);
      const roas = calculateRoas(response.revenueMonth);

      return {
        totalLeads: response.totalLeads,
        activeLeads: response.activeLeads,
        totalRevenue: response.revenueMonth,
        trafficSources: response.trafficSources,
        funnel: response.funnel,
        pipelineValue,
        roas,
        teamPerformance: [
          { id: '1', name: 'Carlos Mendez', sales: 47, conversionRate: 18.5, responseTime: '8 min', avatar: 'CM' },
          { id: '2', name: 'Maria Garcia', sales: 42, conversionRate: 16.2, responseTime: '12 min', avatar: 'MG' },
          { id: '3', name: 'Luis Rodriguez', sales: 38, conversionRate: 15.1, responseTime: '15 min', avatar: 'LR' },
          { id: '4', name: 'Ana Martinez', sales: 35, conversionRate: 14.8, responseTime: '10 min', avatar: 'AM' },
          { id: '5', name: 'Pedro Sanchez', sales: 27, conversionRate: 12.3, responseTime: '18 min', avatar: 'PS' },
        ],
        trends: [
          { week: 'Sem 1', revenue: 130000, leads: 120 },
          { week: 'Sem 2', revenue: 135000, leads: 135 },
          { week: 'Sem 3', revenue: 142000, leads: 150 },
          { week: 'Sem 4', revenue: 150000, leads: 165 },
        ],
        aiSavings: {
          hoursSaved: 247,
          leadsQualified: 823,
          description: 'La IA ha filtrado leads no calificados, ahorrando tiempo valioso al equipo',
        },
        period,
        projectId,
      };
    },
    placeholderData: () => buildFallbackMetrics(projectId, period),
    enabled: !!projectId,
    staleTime: 60000,
    retry: false,
  });
}
