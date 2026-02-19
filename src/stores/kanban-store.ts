import { create } from 'zustand'
import { toast } from 'sonner'
import { contactsApi, type BackendContact } from '@/lib/contacts/contacts-api'
import { mapLeadStatusToStage, mapLeadStatusToBadge } from '@/hooks/kanban/use-kanban-constants'
import type { Lead, LeadStage, KanbanStore } from '@/types/kanban-types'

export function transformContactToLead(contact: BackendContact): Lead {
  const badge = mapLeadStatusToBadge(contact.lead_status)

  return {
    id: contact.id,
    name: contact.name || null,
    phone: contact.phone,
    email: contact.email || null,
    stage: mapLeadStatusToStage(contact.lead_status),
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
      const contacts = await contactsApi.getAll()
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
