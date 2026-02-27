// src/modules/dashboard/hooks/useProjects.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { useApiError } from '@/shared/hooks/useApiError'
import { getMockProjects } from '@/modules/dashboard/mocks/projects.mock'
import type { Project } from '@/modules/dashboard/types/dashboard-types'

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: queryKeys.dashboard.projects(),
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ items: Project[] } | Project[]>('/api/projects')
        // Backend wraps list in { items: [...] }
        return Array.isArray(res) ? res : res.items
      } catch (error) {
        // Fallback to mock projects if API fails
        return getMockProjects()
      }
    },
    staleTime: 30_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (name: string) =>
      apiClient.post<Project>('/api/projects', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.projects() })
      toast.success('Proyecto creado correctamente')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al crear proyecto',
      })
    },
  })
}
