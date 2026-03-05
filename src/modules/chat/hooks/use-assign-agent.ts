import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  conversationsService,
  assignmentsService,
} from '../services/nella-api'
import { toast } from 'sonner'
import { useCurrentUserId } from './use-current-user-id'

/**
 * Assign or unassign agent from conversation
 */
export function useAssignAgent(conversationId: string) {
  const queryClient = useQueryClient()
  const currentUserId = useCurrentUserId()

  const mutation = useMutation({
    mutationFn: async (agentId: string | null) => {
      if (agentId === null) {
        // Desasignar: actualizar conversación
        return conversationsService.update(conversationId, {
          assigned_agent_id: null,
        })
      } else {
        // Asignar: crear assignment + actualizar conversación
        await assignmentsService.assignAgent(
          conversationId,
          agentId,
          currentUserId || undefined
        )

        return conversationsService.update(conversationId, {
          assigned_agent_id: agentId,
        })
      }
    },
    onSuccess: (data, agentId) => {
      const message =
        agentId === null
          ? 'Conversación desasignada exitosamente'
          : 'Agente asignado exitosamente'

      console.log(`✅ ${message}:`, data)
      toast.success(message)

      // Refetch conversations para actualizar UI
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
    },
    onError: (error: any) => {
      console.error('❌ Error asignando agente:', error)
      toast.error(error.message || 'Error al asignar agente')
    },
  })

  return {
    assignAgent: mutation.mutate,
    isAssigning: mutation.isPending,
  }
}
