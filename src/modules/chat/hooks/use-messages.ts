'use client'
import { useQuery } from '@tanstack/react-query'
import { chatwootService } from '../services/chatwoot'

export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return { payload: [] }
      const response = await chatwootService.getMessages(conversationId)
      return response
    },
    enabled: !!conversationId,
    select: (data) =>
      [...data.payload].sort((a, b) => a.created_at - b.created_at),
    staleTime: 5_000,
  })
}
