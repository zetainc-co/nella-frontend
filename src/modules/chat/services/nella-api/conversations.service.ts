import { apiClient } from '@/core/api/api-client'
import type {
  Conversation,
  CreateConversationDto,
  UpdateConversationDto,
  ConversationResponse,
  ConversationListResponse,
} from '../../types/nella-api'

/**
 * Servicio para gestionar Conversations
 */
export const conversationsService = {
  /**
   * Listar todas las conversaciones
   */
  getAll: (params?: {
    contactId?: number
    inboxId?: string
    agentId?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.contactId)
      queryParams.append('contactId', params.contactId.toString())
    if (params?.inboxId) queryParams.append('inboxId', params.inboxId)
    if (params?.agentId) queryParams.append('agentId', params.agentId)

    const queryString = queryParams.toString()
    const url = `/conversations${queryString ? `?${queryString}` : ''}`

    return apiClient.get<ConversationListResponse>(url)
  },

  /**
   * Obtener conversación por ID
   */
  getById: (id: string) =>
    apiClient.get<ConversationResponse>(`/conversations/${id}`),

  /**
   * Obtener conversaciones de un contacto
   */
  getByContactId: (contactId: number) =>
    apiClient.get<ConversationListResponse>(
      `/conversations?contactId=${contactId}`
    ),

  /**
   * Obtener conversaciones de un inbox
   */
  getByInboxId: (inboxId: string) =>
    apiClient.get<ConversationListResponse>(
      `/conversations?inboxId=${inboxId}`
    ),

  /**
   * Obtener conversaciones asignadas a un agente
   */
  getByAgentId: (agentId: string) =>
    apiClient.get<ConversationListResponse>(
      `/conversations?agentId=${agentId}`
    ),

  /**
   * Crear una nueva conversación
   */
  create: (data: CreateConversationDto) =>
    apiClient.post<ConversationResponse>('/conversations', data),

  /**
   * Actualizar conversación
   */
  update: (id: string, data: UpdateConversationDto) =>
    apiClient.patch<ConversationResponse>(`/conversations/${id}`, data),

  /**
   * Eliminar conversación
   */
  delete: (id: string) =>
    apiClient.delete<{ status: number; message: string }>(
      `/conversations/${id}`
    ),

  /**
   * Cerrar conversación
   */
  close: (id: string) =>
    apiClient.patch<ConversationResponse>(`/conversations/${id}`, {
      status: 'closed',
    }),

  /**
   * Reabrir conversación
   */
  reopen: (id: string) =>
    apiClient.patch<ConversationResponse>(`/conversations/${id}`, {
      status: 'active',
    }),

  /**
   * Asignar agente a conversación
   */
  assignAgent: (id: string, agentId: string) =>
    apiClient.patch<ConversationResponse>(`/conversations/${id}`, {
      assigned_agent_id: agentId,
    }),

  /**
   * Actualizar labels de conversación
   */
  updateLabels: (id: string, labelIds: string[]) =>
    apiClient.patch<ConversationResponse>(`/conversations/${id}`, {
      label_ids: labelIds,
    }),

  /**
   * Actualizar prioridad de conversación
   */
  updatePriority: (id: string, priority: 'low' | 'medium' | 'high') =>
    apiClient.patch<ConversationResponse>(`/conversations/${id}`, {
      priority,
    }),
}
