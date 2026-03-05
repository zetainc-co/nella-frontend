'use client'
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { chatWebSocket } from '../services/nella-api'
import { useCurrentUserId } from './use-current-user-id'

export function useConversationsSocket(currentConversationId: string | null) {
  const queryClient = useQueryClient()
  const userId = useCurrentUserId()

  useEffect(() => {
    // Conectar al WebSocket
    chatWebSocket.connect()

    // Unirse a la conversación actual si existe
    if (currentConversationId && userId) {
      chatWebSocket.joinConversation(currentConversationId, userId)
    }

    // Escuchar nuevos mensajes
    const handleNewMessage = (data: any) => {
      console.log('💬 New message:', data.message.id)

      // Invalidar mensajes de esa conversación
      queryClient.invalidateQueries({
        queryKey: ['messages', data.conversationId],
      })

      // Invalidar conversaciones (para actualizar lastMessage)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    // Escuchar actualizaciones de conversación
    const handleConversationUpdate = (data: any) => {
      console.log('🔄 Conversation updated:', data.conversationId)

      // Invalidar conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    // Escuchar cambios de estado
    const handleStatusChanged = (data: any) => {
      console.log(
        `🔔 Conversation ${data.conversationId} status changed to ${data.status}`
      )

      // Invalidar conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    // Escuchar asignaciones de agente
    const handleAgentAssigned = (data: any) => {
      console.log(
        `👤 Agent ${data.agentId} assigned to conversation ${data.conversationId}`
      )

      // Invalidar conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    // Escuchar cambios de labels
    const handleLabelsUpdated = (data: any) => {
      console.log(`🏷️  Labels updated for conversation ${data.conversationId}`)

      // Invalidar conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    // Registrar listeners
    chatWebSocket.onNewMessage(handleNewMessage)
    chatWebSocket.onConversationUpdate(handleConversationUpdate)
    chatWebSocket.onStatusChanged(handleStatusChanged)
    chatWebSocket.onAgentAssigned(handleAgentAssigned)
    chatWebSocket.onLabelsUpdated(handleLabelsUpdated)

    // Cleanup
    return () => {
      if (currentConversationId) {
        chatWebSocket.leaveConversation(currentConversationId)
      }

      chatWebSocket.offNewMessage(handleNewMessage)
      // Note: no hay métodos off para los otros eventos aún,
      // pero el servicio los limpiará al desconectar
    }
  }, [queryClient, currentConversationId, userId])

  return {
    socket: chatWebSocket.getSocket(),
    isConnected: chatWebSocket.isConnected(),
  }
}
