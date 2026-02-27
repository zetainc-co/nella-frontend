'use client'
import { useQuery } from '@tanstack/react-query'
import { chatwootService } from '../services/chatwoot'
import { useChatStore } from '../store/chat-store'
import type { ConversationWithMode } from '../types'

export function useConversations() {
  const filter = useChatStore((s) => s.filter)
  const searchQuery = useChatStore((s) => s.searchQuery)

  return useQuery({
    queryKey: ['conversations', filter, searchQuery],
    queryFn: async () => {
      const params: any = {}

      if (filter === 'resolved') {
        params.status = 'resolved'
      } else if (filter !== 'all') {
        params.status = 'open'
      }

      const response = await chatwootService.getConversations(params)
      return response.data
    },
    select: (data) => {
      let conversations = data.payload

      // Filtrar por modo agente basado en status
      if (filter === 'ai_active') {
        conversations = conversations.filter((c) => c.status === 'pending')
      } else if (filter === 'human') {
        conversations = conversations.filter((c) => c.status === 'open')
      }

      // Búsqueda local por nombre/teléfono
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        conversations = conversations.filter(
          (c) =>
            c.meta.sender.name.toLowerCase().includes(q) ||
            c.meta.sender.phone_number?.includes(q)
        )
      }

      // Enriquecer con agentMode basado en status de Chatwoot
      return conversations.map((c) => ({
        ...c,
        agentMode: c.status === 'pending' ? 'ai' : 'human',
        lastMessage: c.last_non_activity_message?.content || c.meta.sender.phone_number || '',
      })) as ConversationWithMode[]
    },
    refetchInterval: 30_000, // Fallback si socket falla
    staleTime: 10_000,
  })
}
