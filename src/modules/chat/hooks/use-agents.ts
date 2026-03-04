import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'

export interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
  role: string
  availability_status: string
}

export interface UpdateAgentDto {
  role?: string
  availability_status?: string
}

/**
 * Fetch list of all agents for the current tenant
 */
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get<Agent[]>('/chatwoot-agents')
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
    mutationFn: async ({ agentId, data }: { agentId: number; data: UpdateAgentDto }) => {
      const response = await apiClient.patch<Agent>(`/chatwoot-agents/${agentId}`, data)
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
    mutationFn: async (agentId: number) => {
      await apiClient.delete(`/chatwoot-agents/${agentId}`)
    },
    onSuccess: () => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}
