// src/types/kanban-types.ts
export type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed'

export type SourceChannel = 'instagram' | 'facebook' | 'tiktok' | 'whatsapp'

export type LeadProbability = 'high' | 'medium' | 'low'

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
  created_at: string
  time_in_stage: string
  probability?: number // Porcentaje de probabilidad de cierre (0-100)
  probability_label?: LeadProbability // 'high', 'medium', 'low'
}

export interface KanbanFilters {
  searchQuery: string
  channels: SourceChannel[]
  assignedTo: string | null // ID del vendedor seleccionado
  onlyMyLeads: boolean
}

export interface KanbanUser {
  id: string
  role: 'admin' | 'sales_agent'
  name: string
}

export interface KanbanColumnConfig {
  stage: LeadStage
  title: string
}
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

export interface LeadModalProps {
  open: boolean
  onClose: () => void
}


export interface KanbanStore {
  // Estado
  leads: Lead[]
  filters: KanbanFilters
  selectedLeadId: string | null
  currentUser: KanbanUser
  salesAgents: KanbanUser[] // Lista de vendedores

  // Acciones
  moveLeadToStage: (leadId: string, newStage: LeadStage) => void
  setSearchQuery: (query: string) => void
  setChannelFilters: (channels: SourceChannel[]) => void
  setAssignedToFilter: (userId: string | null) => void
  toggleOnlyMyLeads: () => void
  setSelectedLead: (leadId: string | null) => void

  // Selectores
  getFilteredLeads: () => Lead[]
  getLeadsByStage: (stage: LeadStage) => Lead[]
}
