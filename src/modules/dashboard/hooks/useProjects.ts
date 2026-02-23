'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import type { Project } from '@/modules/dashboard/types/dashboard-types'

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: queryKeys.dashboard.projects(),
    queryFn: () => apiClient.get<Project[]>('/api/projects'),
    staleTime: 30_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      apiClient.post<Project>('/api/projects', { name }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.projects() }),
  })
}
