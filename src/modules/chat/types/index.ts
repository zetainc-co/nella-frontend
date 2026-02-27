// Chatwoot API Types

export type ConversationStatus = 'open' | 'resolved' | 'pending' | 'snoozed'
export type MessageType = 'incoming' | 'outgoing' | 'activity'
export type AgentMode = 'ai' | 'human'

export interface ChatwootContactMeta {
  id: number
  name: string
  phone_number: string | null
  thumbnail: string | null
}

export interface ChatwootConversation {
  id: number
  inbox_id: number
  status: ConversationStatus
  timestamp: number
  unread_count: number
  labels: string[]
  meta: {
    sender: ChatwootContactMeta
    assignee: any | null
  }
  messages?: ChatwootMessage[]
  last_non_activity_message?: ChatwootMessage | null
}

export interface ChatwootMessage {
  id: number
  content: string | null
  message_type: MessageType
  content_type: 'text' | 'input_select' | 'cards' | 'form'
  private: boolean
  created_at: number
  conversation_id: number
  sender: {
    id: number
    name: string
    type: 'user' | 'contact' | 'agent_bot'
    avatar_url?: string | null
  } | null
  attachments: any[]
  _pending?: boolean
}

export interface ChatwootContact {
  id: number
  name: string
  email: string | null
  phone_number: string | null
  thumbnail: string | null
  additional_attributes?: Record<string, unknown>
  custom_attributes?: Record<string, unknown>
}

// API Response Types
export interface ConversationsListResponse {
  data: {
    meta: {
      mine_count: number
      assigned_count: number
      unassigned_count: number
      all_count: number
    }
    payload: ChatwootConversation[]
  }
}

export interface MessagesResponse {
  payload: ChatwootMessage[]
}

export interface ContactsSearchResponse {
  meta: {
    count: number
    current_page: number
    has_more: boolean
  }
  payload: ChatwootContact[]
}

// Enriched types for UI
export interface ConversationWithMode extends ChatwootConversation {
  agentMode: AgentMode
  lastMessage?: string
}

// Component Props Types
export interface ConversationListProps {
  conversations: ConversationWithMode[]
  isLoading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
}

export interface ConversationItemProps {
  conversation: ConversationWithMode
  isSelected: boolean
  onClick: () => void
}

export interface ChatThreadProps {
  conversation: ConversationWithMode | null
  messages: ChatwootMessage[]
  isLoading: boolean
  isSending: boolean
  onSendMessage: (content: string) => void
}

export interface ContactHeaderProps {
  conversation: ConversationWithMode
}

export interface MessageBubbleProps {
  message: ChatwootMessage
}

export interface MessageInputProps {
  onSend: (content: string) => void
  isPending: boolean
  disabled?: boolean
}
