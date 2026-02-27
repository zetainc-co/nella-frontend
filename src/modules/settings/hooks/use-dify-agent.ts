'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { useApiError } from '@/shared/hooks/useApiError'

export interface DifyAgentInfo {
  name: string
  description: string
  mode: string
}

export interface DifyValidateResponse {
  success: boolean
  agent: DifyAgentInfo
}

export interface DifyAgent {
  id: string
  tenant_id: string
  agent_name: string
  dify_app_key: string
  agent_mode: string
  is_active: boolean
  created_at: string
}

export interface DifyConnectPayload {
  tenant_id: string
  dify_app_key: string
}

export function useValidateDifyAgent() {
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: (dify_app_key: string) =>
      apiClient.post<DifyValidateResponse>('/api/dify/validate', { dify_app_key }),
    onError: (error: Error) =>
      handleError(error, {
        showToast: true,
        fallbackMessage: 'No se encontró el agente. Verifica el App Key.',
      }),
  })
}

export function useConnectDifyAgent() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: (payload: DifyConnectPayload) =>
      apiClient.post<{ success: boolean; data: DifyAgent }>('/api/dify/agents', payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dify.agents(variables.tenant_id) })
      toast.success('Agente conectado correctamente')
    },
    onError: (error: Error) =>
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al conectar el agente',
      }),
  })
}

export function useRemoveDifyAgent() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: ({ tenantId, agentId }: { tenantId: string; agentId: string }) =>
      apiClient.delete<{ success: boolean }>(`/api/dify/agents/${tenantId}/${agentId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dify.agents(variables.tenantId) })
      toast.success('Agente desvinculado')
    },
    onError: (error: Error) =>
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al desvincular el agente',
      }),
  })
}

export function useGetDifyAgents(tenantId: string) {
  return useQuery<DifyAgent[]>({
    queryKey: queryKeys.dify.agents(tenantId),
    queryFn: async () => {
      const result = await apiClient.get<unknown>(`/api/dify/agents/${tenantId}`)
      if (Array.isArray(result)) return result as DifyAgent[]
      if (result && typeof result === 'object' && 'data' in result && Array.isArray((result as { data: unknown }).data)) {
        return (result as { data: DifyAgent[] }).data
      }
      return []
    },
    enabled: !!tenantId,
    staleTime: 30_000,
    retry: false,
  })
}
