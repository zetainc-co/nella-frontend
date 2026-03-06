// Campos reales del backend (nella_contacts)
export interface ContactDetail {
  id: string
  phone: string
  name: string
  email: string
  lead_status: string
  handoff_active: boolean
  ai_summary: string
  last_interaction_at: string
  tags: string[]

  // Campos UI (hardcodeados hasta que el backend los tenga)
  stage: string
  time: string
  company: string
  role: string
  location: string
  score: number
  scoreLabel: string
  channel: string
  channelDetail: string
  lastConversation: string
}

export interface ContactDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: ContactDetail | null
}

export interface CreateContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: ContactDetail | null
}

export interface ContactHeaderProps {
  contact: ContactDetail
  onEdit?: () => void
}
