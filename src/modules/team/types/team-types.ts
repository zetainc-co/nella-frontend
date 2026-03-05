// Agent/User types - based on nella_backend UserResponseDto
export interface Agent {
  id: string // UUID
  email: string
  full_name: string
  role: 'admin' | 'agent' | 'viewer'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateAgentDto {
  email: string
  full_name: string
  role: 'admin' | 'agent' | 'viewer'
  password?: string // Optional - if not provided, activation email is sent
}

export interface UpdateAgentDto {
  full_name?: string
  role?: 'admin' | 'agent' | 'viewer'
  is_active?: boolean
}

export interface InboxMember {
  user_ids: number[]
}

export interface Inbox {
  id: number
  name: string
  channel_type: string
}

export interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
}
