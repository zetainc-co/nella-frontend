/**
 * Nella Native Backend API Types
 * Sistema de chat independiente de Chatwoot
 */

// ============= Inboxes =============
export interface Inbox {
  id: string
  name: string
  channel_type: 'whatsapp' | 'web' | 'email' | 'api'
  is_active: boolean
  settings: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface CreateInboxDto {
  name: string
  channel_type?: 'whatsapp' | 'web' | 'email' | 'api'
  is_active?: boolean
  settings?: Record<string, any>
}

export interface InboxResponse {
  status: number
  message: string
  data: Inbox
}

export interface InboxListResponse {
  status: number
  message: string
  data: Inbox[]
}

// ============= Conversations =============
export interface ConversationMetadata {
  // Contact metadata (from contact join)
  contact_name?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  contact_lead_status?: string | null
  contact_status?: string | null
  contact_source?: string | null
  contact_handoff_active?: boolean
  contact_ai_summary?: string | null
  contact_last_interaction_at?: string | null
  contact_next_purchase_prediction?: string | null
  contact_referral_code?: string | null
  contact_tags?: string[]

  // Agent metadata (from assigned_agent join)
  assigned_agent_name?: string | null
  assigned_agent_email?: string | null

  // Other metadata
  [key: string]: any
}

export interface Conversation {
  id: string
  contact_id: number
  status: 'active' | 'closed'
  inbox_id: string | null
  assigned_agent_id: string | null
  last_message_at: string | null
  label_ids: string[]
  priority: 'low' | 'medium' | 'high'
  metadata: ConversationMetadata | null
  created_at: string
  updated_at: string
}

export interface CreateConversationDto {
  contact_id: number
  inbox_id?: string
  status?: 'active' | 'closed'
  assigned_agent_id?: string
  label_ids?: string[]
  priority?: 'low' | 'medium' | 'high'
  metadata?: Record<string, any>
}

export interface UpdateConversationDto {
  contact_id?: number
  inbox_id?: string
  status?: 'active' | 'closed'
  assigned_agent_id?: string | null // Acepta null para desasignar
  label_ids?: string[]
  priority?: 'low' | 'medium' | 'high'
  metadata?: Record<string, any>
}

export interface ConversationResponse {
  status: number
  message: string
  data: Conversation
}

export interface ConversationListResponse {
  status: number
  message: string
  data: Conversation[]
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// ============= Messages =============
export interface Message {
  id: string
  conversation_id: string
  body: string | null
  media_url: string | null
  media_type: string | null
  from_customer: boolean
  sender_id: string | null
  message_type: 'text' | 'image' | 'file' | 'video' | 'audio'
  attachments: any[] | null
  is_ai_response: boolean
  ai_intent: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export interface CreateMessageDto {
  conversation_id: string
  body?: string
  media_url?: string
  media_type?: string
  from_customer?: boolean
  sender_id?: string
  message_type?: 'text' | 'image' | 'file' | 'video' | 'audio'
  attachments?: any[]
  is_ai_response?: boolean
  ai_intent?: string
  metadata?: Record<string, any>
}

export interface MessageResponse {
  status: number
  message: string
  data: Message
}

export interface MessageListResponse {
  status: number
  message: string
  data: Message[]
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// ============= Labels =============
export interface Label {
  id: string
  name: string
  color: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateLabelDto {
  name: string
  color?: string
  description?: string
  is_active?: boolean
}

export interface UpdateLabelDto {
  name?: string
  color?: string
  description?: string
  is_active?: boolean
}

export interface LabelResponse {
  status: number
  message: string
  data: Label
}

export interface LabelListResponse {
  status: number
  message: string
  data: Label[]
}

// ============= Assignments =============
export interface Assignment {
  id: string
  conversation_id: string
  agent_id: string
  assigned_by: string | null
  created_at: string
}

export interface CreateAssignmentDto {
  conversation_id: string
  agent_id: string
  assigned_by?: string
}

export interface AssignmentResponse {
  status: number
  message: string
  data: Assignment
}

export interface AssignmentListResponse {
  status: number
  message: string
  data: Assignment[]
}

// ============= WebSocket Events =============
export interface WebSocketMessage {
  conversationId: string
  message: Message
}

export interface WebSocketConversationUpdate {
  conversationId: string
  update: Partial<Conversation>
}

export interface WebSocketAgentAssigned {
  conversationId: string
  agentId: string
}

export interface WebSocketLabelsUpdated {
  conversationId: string
  labels: string[]
}

export interface WebSocketStatusChanged {
  conversationId: string
  status: string
}

export interface WebSocketUserTyping {
  conversationId: string
  userId: string
  userName?: string
  isTyping: boolean
}
