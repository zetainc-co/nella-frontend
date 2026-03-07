import { create } from 'zustand'
import { toast } from 'sonner'
import { apiClient } from '@/core/api/api-client'
import type { BackendContact } from '@/modules/contacts/types/contacts'
import { mapLeadStatusToStage, mapStageToBadge, STATUS_TO_STAGE, STAGE_TO_STATUS } from '@/modules/kanban/hooks/use-kanban-constants'
import type { Lead, LeadStage, KanbanStore } from '@/modules/kanban/types/kanban-types'

export function transformContactToLead(contact: BackendContact): Lead {
  const stageFromStatus = contact.status
    ? STATUS_TO_STAGE[contact.status.toLowerCase()]
    : undefined
  const stage = stageFromStatus ?? mapLeadStatusToStage(contact.lead_status)
  const badge = mapStageToBadge(stage)

  return {
    id: contact.id,
    name: contact.name || null,
    phone: contact.phone,
    email: contact.email || null,
    stage,
    lead_status: contact.lead_status,
    ai_summary: contact.ai_summary || null,
    handoff_active: contact.handoff_active ?? false,
    created_at: contact.created_at,
    updated_at: contact.updated_at,
    probability: badge.probability,
    probability_label: badge.label,
  }
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  filters: {
    searchQuery: '',
  },
  selectedLeadId: null,

  moveLeadToStage: (leadId: number, newStage: LeadStage) => {
    const stageNames: Record<LeadStage, string> = {
      new: 'Nuevo',
      contacted: 'Calificado',
      proposal: 'Negociación',
      closed: 'Cerrado'
    }

    const patch = STAGE_TO_STATUS[newStage]
    apiClient.patch(`/api/contacts/${leadId}`, {
      status: patch.status,
      ...(patch.lead_status !== null ? { lead_status: patch.lead_status } : {}),
    }).catch(err => console.error('moveLeadToStage PATCH error:', err))

    toast.success(`Lead movido a ${stageNames[newStage]}`)
  },

  setSearchQuery: (query: string) => {
    set(state => ({
      filters: { ...state.filters, searchQuery: query }
    }))
  },

  setSelectedLead: (leadId: number | null) => {
    set({ selectedLeadId: leadId })
  },
}))
