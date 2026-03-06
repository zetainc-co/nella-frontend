import { create } from 'zustand'
import { toast } from 'sonner'
import { apiClient } from '@/core/api/api-client'
import { useProjectStore } from '@/core/store/project-store'
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

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  leads: [],
  filters: {
    searchQuery: '',
  },
  selectedLeadId: null,
  isLoading: false,
  error: null,

  fetchContacts: async () => {
    if (get().leads.length === 0) {
      set({ isLoading: true })
    }

    try {
      const selectedProjectId = useProjectStore.getState().selectedProjectId

      const endpoint = selectedProjectId
        ? `/api/contacts?project_id=${selectedProjectId}`
        : '/api/contacts'

      const raw = await apiClient.get<{ items: BackendContact[] } | BackendContact[]>(endpoint)
      const contacts: BackendContact[] = Array.isArray(raw) ? raw : ((raw as { items: BackendContact[] })?.items ?? [])
      const leads = contacts.map(transformContactToLead)
      set({ leads, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar contactos'
      set({ isLoading: false, error: message })
    }
  },

  upsertContact: (contact: BackendContact) => {
    const lead = transformContactToLead(contact)

    set(state => {
      const exists = state.leads.find(l => l.id === lead.id)
      if (exists) {
        return { leads: state.leads.map(l => l.id === lead.id ? lead : l) }
      }
      return { leads: [...state.leads, lead] }
    })
  },

  moveLeadToStage: (leadId: number, newStage: LeadStage) => {
    const lead = get().leads.find(l => l.id === leadId)
    if (!lead) return
    if (lead.stage === newStage) return

    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId ? { ...l, stage: newStage } : l
      )
    }))

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

  getFilteredLeads: () => {
    const { leads, filters } = get()

    return leads.filter(lead => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchName = lead.name?.toLowerCase().includes(query)
        const matchPhone = lead.phone.toLowerCase().includes(query)
        if (!matchName && !matchPhone) return false
      }
      return true
    })
  },

  getLeadsByStage: (stage: LeadStage) => {
    return get().getFilteredLeads().filter(lead => lead.stage === stage)
  }
}))
