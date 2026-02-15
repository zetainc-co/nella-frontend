// src/types/kanban-types.ts

export type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed'

export type SourceChannel = 'instagram' | 'facebook' | 'tiktok' | 'whatsapp'

export interface Lead {
  id: string
  name: string | null
  phone: string
  email?: string | null
  company?: string | null
  stage: LeadStage
  source_channel: SourceChannel
  ai_summary: string
  assigned_to: string | null
  created_at: string // ISO 8601
  time_in_stage: string // "2 horas", "1 día"
}

export interface KanbanFilters {
  searchQuery: string
  channels: SourceChannel[]
  onlyMyLeads: boolean
}

export interface KanbanUser {
  id: string
  role: 'admin' | 'sales_agent'
  name: string
}

// ============================================
// Component Props Types
// ============================================

export interface KanbanColumnProps {
  stage: LeadStage
  title: string
  leads: Lead[]
  onLeadClick: (leadId: string) => void
}

export interface LeadCardProps {
  lead: Lead
  onClick: () => void
}

export interface LeadDetailsPanelProps {
  open: boolean
  onClose: () => void
}

