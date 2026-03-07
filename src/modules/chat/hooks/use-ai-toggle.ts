import { useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsService } from '../services/nella-api'
import { toast } from 'sonner'

interface UseAIToggleProps {
  conversationId: string
  currentMode: 'ai' | 'human'
}

/**
 * Hook para alternar entre modo AI y Human en una conversación
 * Actualiza el campo metadata.agent_mode en la conversación
 */
export function useAIToggle({ conversationId, currentMode }: UseAIToggleProps) {
  const queryClient = useQueryClient()

  const stopAI = useMutation({
    mutationFn: (agentId: string) =>
      conversationsService.update(conversationId, {
        assigned_agent_id: agentId,
        metadata: { agent_mode: 'human' },
      }),
    onSuccess: () => {
      toast.success('IA detenida. Un agente humano tomará el control.')
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
    },
    onError: (error: any) => {
      console.error('❌ Error al detener IA:', error)
      toast.error(error.message || 'Error al detener la IA')
    },
  })

  const startAI = useMutation({
    mutationFn: () =>
      conversationsService.update(conversationId, {
        assigned_agent_id: null, // Desasignar agente humano
        metadata: { agent_mode: 'ai' },
      }),
    onSuccess: () => {
      toast.success('IA activada. El bot continuará la conversación.')
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
    },
    onError: (error: any) => {
      console.error('❌ Error al activar IA:', error)
      toast.error(error.message || 'Error al activar la IA')
    },
  })

  const toggleAI = (agentId?: string) => {
    if (currentMode === 'ai') {
      // Detener IA - necesitamos el agentId
      if (!agentId) {
        toast.error('Se requiere un agente para tomar control')
        return
      }
      stopAI.mutate(agentId)
    } else {
      // Activar IA
      startAI.mutate()
    }
  }

  return {
    toggleAI,
    isLoading: stopAI.isPending || startAI.isPending,
    isStoppingAI: stopAI.isPending,
    isStartingAI: startAI.isPending,
  }
}
