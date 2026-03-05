import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'

/**
 * Agent type (User del tenant)
 * Los agentes son usuarios del sistema con role = 'agent' o 'admin'
 * Basado en UserResponseDto del backend
 */
export interface Agent {
  id: string // UUID
  email: string
  full_name: string
  role: 'admin' | 'agent' | 'viewer'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UpdateAgentDto {
  full_name?: string
  role?: 'admin' | 'agent' | 'viewer'
  is_active?: boolean
}

/**
 * Fetch list of all agents for the current tenant
 * Los agentes vienen de la tabla users filtrados por role
 */
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get<Agent[]>('/users?role=agent')
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - agents don't change frequently
  })
}

/**
 * Update an existing agent (role or availability status)
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ agentId, data }: { agentId: string; data: UpdateAgentDto }) => {
      const response = await apiClient.patch<Agent>(`/users/${agentId}`, data)
      return response
    },
    onSuccess: () => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

/**
 * Delete an agent from the account
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (agentId: string) => {
      await apiClient.delete(`/users/${agentId}`)
    },
    onSuccess: () => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}
