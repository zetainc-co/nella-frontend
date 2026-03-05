'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesService } from '../services/nella-api'
import type { Message } from '../types/nella-api'
import type { MessageWithCompat } from './use-messages'

export function useSendMessage(conversationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      content: string
      message_type?: 'incoming' | 'outgoing'
      private?: boolean
    }) => {
      if (!conversationId) throw new Error('No conversation selected')

      const fromCustomer = payload.message_type === 'incoming'

      const response = await messagesService.sendText(
        conversationId,
        payload.content,
        fromCustomer
      )
      // El apiClient devuelve directamente el data de la respuesta
      return Array.isArray(response) ? response[0] : response.data || response
    },

    onMutate: async (payload) => {
      // Optimistic update
      const queryKey = ['messages', conversationId]
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData(queryKey)

      const optimisticMsg: MessageWithCompat = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId!,
        body: payload.content,
        content: payload.content, // alias
        media_url: null,
        media_type: null,
        from_customer: payload.message_type === 'incoming',
        sender_id: null,
        message_type: 'text',
        attachments: null,
        is_ai_response: false,
        ai_intent: null,
        metadata: null,
        created_at: new Date().toISOString(),
        sender: null,
        _pending: true,
      } as any

      queryClient.setQueryData<MessageWithCompat[]>(queryKey, (old) => [
        ...(old ?? []),
        optimisticMsg,
      ])

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

    onSuccess: () => {
      // El mensaje real vendrá por WebSocket, pero invalidamos por si acaso
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      })
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      })
    },
  })
}
