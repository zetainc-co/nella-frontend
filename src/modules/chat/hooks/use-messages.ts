'use client'
import { useQuery } from '@tanstack/react-query'
import { messagesService } from '../services/nella-api'
import type { Message } from '../types/nella-api'

// Tipo adaptado para compatibilidad con UI existente
export interface MessageWithCompat extends Message {
  content?: string // alias para body
  sender?: {
    id: string
    name: string
    type: string
  } | null
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []
      const response = await messagesService.getByConversation(conversationId)
      // El apiClient devuelve directamente el data de la respuesta
      return Array.isArray(response) ? response : response.data
    },
    enabled: !!conversationId,
    select: (messages: Message[]) => {
      // Ordenar por fecha de creación (ASC - más antiguos primero)
      const sorted = [...messages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      // Enriquecer para compatibilidad con UI existente
      return sorted.map((msg) => ({
        ...msg,
        content: msg.body, // alias
        sender: msg.sender_id
          ? {
              id: msg.sender_id,
              name: 'Agent', // TODO: cargar nombre real del agente
              type: 'user',
            }
          : null,
      })) as MessageWithCompat[]
    },
    staleTime: 5_000,
  })
}
