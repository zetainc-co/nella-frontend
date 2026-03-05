import { apiClient } from '@/core/api/api-client'
import type {
  Message,
  CreateMessageDto,
  MessageResponse,
  MessageListResponse,
} from '../../types/nella-api'

/**
 * Servicio para gestionar Messages
 */
export const messagesService = {
  /**
   * Obtener mensajes de una conversación
   */
  getByConversation: (conversationId: string) =>
    apiClient.get<MessageListResponse>(
      `/messages/conversation/${conversationId}`
    ),

  /**
   * Obtener solo mensajes de IA de una conversación
   */
  getAIMessages: (conversationId: string) =>
    apiClient.get<MessageListResponse>(
      `/messages/conversation/${conversationId}/ai`
    ),

  /**
   * Obtener mensaje por ID
   */
  getById: (id: string) => apiClient.get<MessageResponse>(`/messages/${id}`),

  /**
   * Enviar un nuevo mensaje (emite evento WebSocket automáticamente)
   */
  send: (data: CreateMessageDto) =>
    apiClient.post<MessageResponse>('/messages', data),

  /**
   * Enviar mensaje de texto simple
   */
  sendText: (conversationId: string, body: string, fromCustomer = true) =>
    apiClient.post<MessageResponse>('/messages', {
      conversation_id: conversationId,
      body,
      from_customer: fromCustomer,
      message_type: 'text',
    }),

  /**
   * Enviar mensaje de agente
   */
  sendAgentMessage: (
    conversationId: string,
    body: string,
    senderId: string
  ) =>
    apiClient.post<MessageResponse>('/messages', {
      conversation_id: conversationId,
      body,
      from_customer: false,
      sender_id: senderId,
      message_type: 'text',
    }),

  /**
   * Enviar mensaje con archivo adjunto
   */
  sendWithAttachment: (
    conversationId: string,
    body: string,
    mediaUrl: string,
    mediaType: string,
    fromCustomer = true
  ) =>
    apiClient.post<MessageResponse>('/messages', {
      conversation_id: conversationId,
      body,
      media_url: mediaUrl,
      media_type: mediaType,
      from_customer: fromCustomer,
      message_type: getMessageTypeFromMediaType(mediaType),
    }),

  /**
   * Eliminar mensaje
   */
  delete: (id: string) =>
    apiClient.delete<{ status: number; message: string }>(`/messages/${id}`),
}

/**
 * Helper: determina el tipo de mensaje basado en el MIME type
 */
function getMessageTypeFromMediaType(
  mediaType: string
): 'text' | 'image' | 'file' | 'video' | 'audio' {
  if (mediaType.startsWith('image/')) return 'image'
  if (mediaType.startsWith('video/')) return 'video'
  if (mediaType.startsWith('audio/')) return 'audio'
  return 'file'
}
