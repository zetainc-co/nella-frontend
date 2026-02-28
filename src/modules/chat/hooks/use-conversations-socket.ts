'use client'
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@/core/store/auth-store'
import type { ConversationsListResponse, MessagesResponse, ChatwootMessage, ChatwootConversation } from '../types'

// queryFn stores response.data (already unwrapped), so cache holds this inner shape
type ConversationsCacheEntry = ConversationsListResponse['data']

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export function useConversationsSocket() {
  const queryClient = useQueryClient()
  const tenantId = useAuthStore((s) => s.session?.tenantId)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!tenantId) return

    const socket = io(`${BACKEND_URL}/chat-conversations`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })
    socketRef.current = socket

    // Join tenant room on every connect/reconnect
    socket.on('connect', () => {
      console.log('🟢 Socket connected — joining tenant', tenantId)
      socket.emit('join-tenant', tenantId)
    })

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected from chat-conversations')
    })

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection error:', err.message)
    })

    // ── message:created ──────────────────────────────────────────────────────
    socket.on('message:created', (message: ChatwootMessage) => {
      const convId = message.conversation_id
      if (!convId) return

      // 1. Append to messages cache (with dedup guard)
      queryClient.setQueryData<MessagesResponse>(
        ['messages', convId],
        (prev) => {
          if (!prev) return prev
          if (prev.payload.some((m) => m.id === message.id)) return prev
          return { ...prev, payload: [...prev.payload, message] }
        }
      )

      // 2. Update last_non_activity_message in all conversations caches
      if (message.message_type !== 'activity') {
        queryClient.setQueriesData<ConversationsCacheEntry>(
          { queryKey: ['conversations'] },
          (prev) => {
            if (!prev) return prev
            return {
              ...prev,
              payload: prev.payload.map((c) =>
                c.id === convId
                  ? {
                      ...c,
                      last_non_activity_message: message,
                      unread_count:
                        message.message_type === 'incoming'
                          ? c.unread_count + 1
                          : c.unread_count,
                    }
                  : c
              ),
            }
          }
        )
      }
    })

    // ── conversation:updated ─────────────────────────────────────────────────
    socket.on('conversation:updated', (conversation: ChatwootConversation) => {
      queryClient.setQueriesData<ConversationsCacheEntry>(
        { queryKey: ['conversations'] },
        (prev) => {
          if (!prev) return prev
          return {
            ...prev,
            payload: prev.payload.map((c) => (c.id === conversation.id ? conversation : c)),
          }
        }
      )
    })

    // ── conversation:created ─────────────────────────────────────────────────
    socket.on('conversation:created', (conversation: ChatwootConversation) => {
      queryClient.setQueriesData<ConversationsCacheEntry>(
        { queryKey: ['conversations'] },
        (prev) => {
          if (!prev) return prev
          if (prev.payload.some((c) => c.id === conversation.id)) return prev
          return { ...prev, payload: [conversation, ...prev.payload] }
        }
      )
    })

    // ── conversation:status-changed ──────────────────────────────────────────
    socket.on(
      'conversation:status-changed',
      ({ conversationId, status }: { conversationId: number; status: string }) => {
        queryClient.setQueriesData<ConversationsCacheEntry>(
          { queryKey: ['conversations'] },
          (prev) => {
            if (!prev) return prev
            return {
              ...prev,
              payload: prev.payload.map((c) =>
                c.id === conversationId ? { ...c, status: status as ChatwootConversation['status'] } : c
              ),
            }
          }
        )
      }
    )

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [tenantId, queryClient])

  return { socket: socketRef.current }
}
