'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

let socket: Socket | null = null

export function useConversationsSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Conectar al namespace de chat-conversations
    if (!socket) {
      socket = io(`${BACKEND_URL}/chat-conversations`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })

      socket.on('connect', () => {
        console.log('🟢 Socket.io connected to chat-conversations')
      })

      socket.on('disconnect', () => {
        console.log('🔴 Socket.io disconnected from chat-conversations')
      })

      socket.on('connect_error', (err) => {
        console.warn('⚠️ Socket.io connection error:', err.message)
      })
    }

    // Escuchar eventos de conversaciones
    socket.on('conversation:created', (conversation) => {
      console.log('📬 New conversation created:', conversation.id)
      // Invalidar cache para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    socket.on('conversation:updated', (conversation) => {
      console.log('🔄 Conversation updated:', conversation.id)
      // Invalidar cache para refrescar
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      // También invalidar mensajes de esa conversación
      queryClient.invalidateQueries({
        queryKey: ['messages', conversation.id],
      })
    })

    socket.on('message:created', (message) => {
      console.log('💬 New message created:', message.id)
      // Invalidar conversaciones (para actualizar lastMessage)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      // Invalidar mensajes de esa conversación
      queryClient.invalidateQueries({
        queryKey: ['messages', message.conversation_id],
      })
    })

    socket.on('conversation:status-changed', ({ conversationId, status }) => {
      console.log(`🔔 Conversation ${conversationId} status changed to ${status}`)
      // Invalidar conversaciones para refrescar el estado
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return () => {
      // Limpiar listeners al desmontar
      if (socket) {
        socket.off('conversation:created')
        socket.off('conversation:updated')
        socket.off('message:created')
        socket.off('conversation:status-changed')
      }
    }
  }, [queryClient])

  return { socket }
}
