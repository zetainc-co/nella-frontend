// src/types/kanban-types.ts

export type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed'

export type LeadProbability = 'high' | 'medium' | 'low'

export interface Lead {
  id: number
  name: string | null
  phone: string
  email?: string | null
  stage: LeadStage
  lead_status: string | null
  ai_summary: string | null
  handoff_active: boolean
  created_at: string
  updated_at: string
  probability: number
  probability_label: LeadProbability
}

export interface KanbanFilters {
  searchQuery: string
}

export interface KanbanColumnConfig {
  stage: LeadStage
  title: string
}

export interface KanbanColumnProps {
  stage: LeadStage
  title: string
  leads: Lead[]
  onLeadClick: (leadId: number) => void
}

export interface LeadCardProps {
  lead: Lead
  onClick: () => void
}

export interface LeadDetailsPanelProps {
  open: boolean
  onClose: () => void
}

export interface LeadModalProps {
  open: boolean
  onClose: () => void
}

export interface KanbanStore {
  // UI State
  filters: KanbanFilters
  selectedLeadId: number | null

  // Actions
  moveLeadToStage: (leadId: number, newStage: LeadStage) => void
  setSearchQuery: (query: string) => void
  setSelectedLead: (leadId: number | null) => void
}
