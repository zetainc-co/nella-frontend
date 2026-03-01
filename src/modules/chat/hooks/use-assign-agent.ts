import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatwootService } from '../services/chatwoot'
import { toast } from 'sonner'

/**
 * Assign or unassign agent from conversation
 */
export function useAssignAgent(conversationId: number) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (agentId: number | null) => {
      if (agentId === null) {
        // Desasignar agente
        return chatwootService.updateConversationStatus(conversationId, {
          assignee_id: null,
        })
      } else {
        // Asignar agente
        return chatwootService.assignConversation(conversationId, agentId)
      }
    },
    onSuccess: (data, agentId) => {
      const message = agentId === null
        ? 'Conversación desasignada exitosamente'
        : 'Agente asignado exitosamente'

      console.log(`✅ ${message}:`, data)
      toast.success(message)

      // Refetch conversations para actualizar UI
      queryClient.refetchQueries({ queryKey: ['conversations'] })
      queryClient.refetchQueries({ queryKey: ['conversation', conversationId] })
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
