import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatwootService } from '../services/chatwoot'
import { toast } from 'sonner'

interface UseAIToggleProps {
  conversationId: number
  currentMode: 'ai' | 'human'
}

export function useAIToggle({ conversationId, currentMode }: UseAIToggleProps) {
  const queryClient = useQueryClient()

  const stopAI = useMutation({
    mutationFn: (agentId: number) => chatwootService.stopAI(conversationId, agentId),
    onSuccess: () => {
      toast.success('IA detenida. Un agente humano tomará el control.')
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al detener la IA')
    },
  })

  const startAI = useMutation({
    mutationFn: () => chatwootService.startAI(conversationId),
    onSuccess: () => {
      toast.success('IA activada. El bot continuará la conversación.')
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al activar la IA')
    },
  })

  const toggleAI = (agentId?: number) => {
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
