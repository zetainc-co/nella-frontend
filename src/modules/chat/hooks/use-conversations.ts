'use client'
import { useQuery } from '@tanstack/react-query'
import { conversationsService } from '../services/nella-api'
import { useChatStore } from '../store/chat-store'
import { useCurrentUserId } from './use-current-user-id'
import { useAuthStore } from '@/core/store/auth-store'
import type { Conversation } from '../types/nella-api'

// Tipo adaptado para compatibilidad con UI existente
export interface ConversationWithMode extends Conversation {
  agentMode: 'ai' | 'human'
  lastMessage?: string
  meta?: {
    sender?: {
      name: string
      phone_number: string | null
    }
    assignee?: {
      id: string
    } | null
  }
}

export function useConversations() {
  const filter = useChatStore((s) => s.filter)
  const searchQuery = useChatStore((s) => s.searchQuery)
  const currentUserId = useCurrentUserId()
  const session = useAuthStore((s) => s.session)

  return useQuery({
    queryKey: ['conversations', filter, searchQuery],
    enabled: !!session?.tenantSlug, // Solo hacer solicitud si hay session con tenant
    queryFn: async () => {
      const params: any = {}

      // Filtrar por agente si es "mine"
      if (filter === 'mine' && currentUserId) {
        params.agentId = currentUserId
      }

      const response = await conversationsService.getAll(params)
      // El apiClient devuelve directamente el data de la respuesta
      return Array.isArray(response) ? response : response.data
    },
    select: (conversations) => {
      let filtered = conversations

      // Filtrar por status
      if (filter === 'resolved') {
        filtered = filtered.filter((c) => c.status === 'closed')
      } else if (filter !== 'all') {
        filtered = filtered.filter((c) => c.status === 'active')
      }

      // Filtrar por asignación
      if (filter === 'mine' && currentUserId) {
        filtered = filtered.filter((c) => c.assigned_agent_id === currentUserId)
      } else if (filter === 'unassigned') {
        filtered = filtered.filter((c) => !c.assigned_agent_id)
      }

      // Filtrar por modo agente (usando metadata o lógica custom)
      if (filter === 'ai_active') {
        filtered = filtered.filter((c) => c.metadata?.agent_mode === 'ai')
      } else if (filter === 'human') {
        filtered = filtered.filter((c) => c.metadata?.agent_mode === 'human')
      }

      // Búsqueda local (requiere cargar contactos - por ahora skip)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter((c) => {
          // Buscar en metadata si existe nombre/teléfono
          const name = c.metadata?.contact_name?.toLowerCase() || ''
          const phone = c.metadata?.contact_phone || ''
          return name.includes(q) || phone.includes(q)
        })
      }

      // Enriquecer con agentMode y lastMessage
      return filtered.map((c) => ({
        ...c,
        agentMode: (c.metadata?.agent_mode || 'human') as 'ai' | 'human',
        lastMessage: c.metadata?.last_message_preview || '',
        // Agregar meta para compatibilidad con UI existente
        meta: {
          sender: {
            name: c.metadata?.contact_name || `Contact ${c.contact_id}`,
            phone_number: c.metadata?.contact_phone || null,
          },
          assignee: c.assigned_agent_id
            ? { id: c.assigned_agent_id }
            : null,
        },
      })) as ConversationWithMode[]
    },
    refetchInterval: 30_000, // Fallback si socket falla
    staleTime: 10_000,
  })
}
