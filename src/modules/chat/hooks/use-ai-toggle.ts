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
    onSuccess: (data) => {
      console.log('✅ IA detenida exitosamente:', data)
      toast.success('IA detenida. Un agente humano tomará el control.')
      // Refetch inmediato para actualizar la UI
      queryClient.refetchQueries({ queryKey: ['conversations'] })
      queryClient.refetchQueries({ queryKey: ['conversation', conversationId] })
    },
    onError: (error: any) => {
      console.error('❌ Error al detener IA:', error)
      toast.error(error.message || 'Error al detener la IA')
    },
  })

  const startAI = useMutation({
    mutationFn: () => chatwootService.startAI(conversationId),
    onSuccess: (data) => {
      console.log('✅ IA activada exitosamente:', data)
      toast.success('IA activada. El bot continuará la conversación.')
      // Refetch inmediato para actualizar la UI
      queryClient.refetchQueries({ queryKey: ['conversations'] })
      queryClient.refetchQueries({ queryKey: ['conversation', conversationId] })
    },
    onError: (error: any) => {
      console.error('❌ Error al activar IA:', error)
      toast.error(error.message || 'Error al activar la IA')
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
