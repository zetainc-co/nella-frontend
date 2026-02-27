'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatwootService } from '../services/chatwoot'
import type { ChatwootMessage } from '../types'

export function useSendMessage(conversationId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      content: string
      message_type: 'incoming' | 'outgoing'
      private?: boolean
    }) => {
      if (!conversationId) throw new Error('No conversation selected')
      const response = await chatwootService.sendMessage(conversationId, payload)
      return response.data
    },

    onMutate: async (payload) => {
      // Optimistic update
      const queryKey = ['messages', conversationId]
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData(queryKey)

      const optimisticMsg: ChatwootMessage = {
        id: Date.now(),
        content: payload.content,
        message_type: 'outgoing',
        content_type: 'text',
        private: payload.private ?? false,
        created_at: Math.floor(Date.now() / 1000),
        conversation_id: conversationId!,
        sender: { id: 0, name: 'Agent', type: 'user' },
        attachments: [],
        _pending: true,
      }

      queryClient.setQueryData<{ payload: ChatwootMessage[] }>(queryKey, (old) => ({
        payload: [...(old?.payload ?? []), optimisticMsg],
      }))

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['messages', conversationId],
          context.previous
        )
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      })
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      })
    },
  })
}
