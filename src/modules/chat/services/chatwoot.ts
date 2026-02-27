import { apiClient } from '@/core/api/api-client'
import type {
  ConversationsListResponse,
  MessagesResponse,
  ContactsSearchResponse,
} from '../types'

export const chatwootService = {
  getConversations: (params?: {
    status?: string
    assignee_type?: string
    inbox_id?: number
    page?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.assignee_type) queryParams.append('assignee_type', params.assignee_type)
    if (params?.inbox_id) queryParams.append('inbox_id', params.inbox_id.toString())
    if (params?.page) queryParams.append('page', params.page.toString())

    const queryString = queryParams.toString()
    const url = `/chatwoot-conversations/conversations${queryString ? `?${queryString}` : ''}`

    return apiClient.get<ConversationsListResponse>(url)
  },

  getConversation: (conversationId: number) =>
    apiClient.get<any>(
      `/chatwoot-conversations/conversations/${conversationId}`
    ),

  getMessages: (conversationId: number) =>
    apiClient.get<MessagesResponse>(
      `/chatwoot-conversations/conversations/${conversationId}/messages`
    ),

  sendMessage: (
    conversationId: number,
    payload: {
      content: string
      message_type: 'incoming' | 'outgoing'
      private?: boolean
    }
  ) =>
    apiClient.post<any>(
      `/chatwoot-conversations/conversations/${conversationId}/messages`,
      payload
    ),

  searchContacts: (query: string) =>
    apiClient.get<ContactsSearchResponse>(
      `/chatwoot-conversations/contacts/search?q=${encodeURIComponent(query)}`
    ),

  getContactConversations: (contactId: number) =>
    apiClient.get<any>(
      `/chatwoot-conversations/contacts/${contactId}/conversations`
    ),

  stopAI: (conversationId: number, agentId: number) =>
    apiClient.post<any>(
      `/chatwoot-conversations/conversations/${conversationId}/stop-ai`,
      { agent_id: agentId }
    ),

  startAI: (conversationId: number) =>
    apiClient.post<any>(
      `/chatwoot-conversations/conversations/${conversationId}/start-ai`,
      {}
    ),
}
