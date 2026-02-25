'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/core/api/api-client';
import { queryKeys } from '@/core/api/query-keys';
import {
  mockTeam,
  mockTrends,
  mockAiSavings,
  calculatePipelineValue,
  calculateRoas,
} from '@/lib/mock-data/dashboard-metrics';

export type Period = 'all' | '30d' | 'prev_month' | 'quarter' | 'year';

export interface BackendMetrics {
  totalLeads: number;
  activeLeads: number;
  revenueMonth: number;
  trafficSources: Array<{ source: string; count: number }>;
  funnel: Array<{ status: string; count: number }>;
}

export interface DashboardMetrics {
  totalLeads: number;
  activeLeads: number;
  totalRevenue: number;
  trafficSources: Array<{ source: string; count: number }>;
  funnel: Array<{ status: string; count: number }>;

  pipelineValue: number;
  roas: string;
  teamPerformance: typeof mockTeam;
  trends: typeof mockTrends;
  aiSavings: typeof mockAiSavings;

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

export function useMetricsData(projectId: string, period: Period = '30d') {
  const searchParams = useSearchParams();
  const urlPeriod = (searchParams?.get('period') as Period) || period;
  const urlProjectId = searchParams?.get('project') || projectId;

  return useQuery<DashboardMetrics>({
    queryKey: queryKeys.dashboard.metrics(urlProjectId, urlPeriod),
    queryFn: async () => {
      try {
        const response = await withTimeout(
          apiClient.get<BackendMetrics>(
            `/api/metrics/project/${urlProjectId}?period=${urlPeriod}`
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
          teamPerformance: mockTeam,
          trends: mockTrends,
          aiSavings: mockAiSavings,
          period: urlPeriod,
          projectId: urlProjectId,
        };
      } catch (error) {
        const isTimeout = error instanceof Error && error.message === 'Timeout';
        if (isTimeout) {
          toast.warning('Timeout al cargar metricas, usando datos de prueba');
        } else {
          toast.warning('Error al cargar metricas, usando datos de prueba');
        }

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
          pipelineValue: calculatePipelineValue(130800000),
          roas: calculateRoas(130800000),
          teamPerformance: mockTeam,
          trends: mockTrends,
          aiSavings: mockAiSavings,
          period: urlPeriod,
          projectId: urlProjectId,
        };
      }
    },
    enabled: !!urlProjectId,
    staleTime: 60000,
    retry: false,
  });
}
