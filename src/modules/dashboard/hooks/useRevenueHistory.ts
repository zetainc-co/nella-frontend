'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/api-client';
import { queryKeys } from '@/core/api/query-keys';

export interface RevenueHistoryData {
  date: string;
  revenue: number;
  leads: number;
}

export function useRevenueHistory(projectId: string | null) {
  return useQuery<{ history: RevenueHistoryData[] }>({
    queryKey: [...queryKeys.dashboard.data(projectId ?? ''), 'revenue-history'],
    queryFn: () =>
      apiClient.get<{ history: RevenueHistoryData[] }>(
        `/api/dashboard/${projectId}/revenue-history`
      ),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}
