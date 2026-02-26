// Agent types - based on nella_backend DTOs
export interface Agent {
  id: number
  account_id: number
  availability_status: 'available' | 'busy' | 'offline'
  auto_offline: boolean
  confirmed: boolean
  email: string
  provider: string
  available_name: string
  name: string
  role: 'agent' | 'administrator'
  thumbnail: string
  custom_role_id: number | null
}

export interface CreateAgentDto {
  name: string
  email: string
  role: 'agent' | 'administrator'
  availability_status?: 'available' | 'busy' | 'offline'
  auto_offline?: boolean
}

export interface UpdateAgentDto {
  role?: 'agent' | 'administrator'
  availability?: 'available' | 'busy' | 'offline'
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
