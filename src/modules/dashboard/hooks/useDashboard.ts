'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/api-client';
import { queryKeys } from '@/core/api/query-keys';
import type { DashboardData } from '@/modules/dashboard/types/dashboard-types';

export function useDashboard(projectId: string | null) {
  return useQuery<DashboardData>({
    queryKey: queryKeys.dashboard.data(projectId ?? ''),
    queryFn: () =>
      apiClient.get<DashboardData>(`/api/dashboard/${projectId}`),
    enabled: !!projectId,
    staleTime: 30_000, // Data considered fresh for 30s
    refetchInterval: 30_000, // Auto-refetch every 30s
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 2, // Retry failed requests twice
  });
}
