'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamService } from '../services/team-service'
import { useApiError } from '@/shared/hooks/useApiError'
import type { CreateAgentDto, UpdateAgentDto } from '../types/team-types'

const QUERY_KEY = ['agents']

/**
 * Hook para listar agents
 */
export function useAgents() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => teamService.listAgents(),
    staleTime: 1000 * 60, // 1 minuto
  })
}

/**
 * Hook para crear un agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (data: CreateAgentDto) => teamService.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al crear agente',
      })
    },
  })
}

/**
 * Hook para actualizar un agent
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: ({ agentId, data }: { agentId: number; data: UpdateAgentDto }) =>
      teamService.updateAgent(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al actualizar agente',
      })
    },
  })
}

/**
 * Hook para eliminar un agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (agentId: number) => teamService.deleteAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al eliminar agente',
      })
    },
  })
}
