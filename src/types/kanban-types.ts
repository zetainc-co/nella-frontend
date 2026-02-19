// src/types/kanban-types.ts
import type { BackendContact } from '@/types/contacts'

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
  // Estado
  leads: Lead[]
  filters: KanbanFilters
  selectedLeadId: number | null
  isLoading: boolean
  error: string | null

  // Acciones
  fetchContacts: () => Promise<void>
  upsertContact: (contact: BackendContact) => void
  moveLeadToStage: (leadId: number, newStage: LeadStage) => void
  setSearchQuery: (query: string) => void
  setSelectedLead: (leadId: number | null) => void

  // Selectores
  getFilteredLeads: () => Lead[]
  getLeadsByStage: (stage: LeadStage) => Lead[]
}
