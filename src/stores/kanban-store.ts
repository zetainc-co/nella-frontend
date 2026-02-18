import { create } from 'zustand'
import { toast } from 'sonner'
import type { Lead, LeadStage, KanbanFilters, KanbanUser, SourceChannel, KanbanStore } from '@/types/kanban-types'

const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Ana Gómez',
    phone: '+57 300 123 4567',
    email: 'ana@techcorp.co',
    company: 'TechCorp SA',
    stage: 'new',
    source_channel: 'instagram',
    ai_summary: 'Interesada en plan Premium, presupuesto aprobado',
    assigned_to: 'user-1',
    created_at: '2026-02-14T08:30:00Z',
    time_in_stage: '2 horas',
    probability: 85,
    probability_label: 'high'
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    phone: '+57 301 234 5678',
    email: 'carlos@innova.co',
    company: 'Innova Digital',
    stage: 'new',
    source_channel: 'facebook',
    ai_summary: 'Requiere demo técnica, decisión en 2 semanas',
    assigned_to: 'user-2',
    created_at: '2026-02-14T09:15:00Z',
    time_in_stage: '1 hora',
    probability: 72,
    probability_label: 'medium'
  },

  // Calificado (2 leads)
  {
    id: '4',
    name: 'Laura Martínez',
    phone: '+57 303 456 7890',
    email: 'laura@global.co',
    company: 'Global Solutions',
    stage: 'contacted',
    source_channel: 'whatsapp',
    ai_summary: 'Alta intención de compra, comparando con competencia',
    assigned_to: 'user-1',
    created_at: '2026-02-13T15:30:00Z',
    time_in_stage: '1 día',
    probability: 90,
    probability_label: 'high'
  },
  {
    id: '5',
    name: 'Pedro Sánchez',
    phone: '+57 304 567 8901',
    email: 'pedro@startupxyz.co',
    company: 'StartUp XYZ',
    stage: 'contacted',
    source_channel: 'instagram',
    ai_summary: 'Necesita propuesta personalizada, bajo presupuesto',
    assigned_to: 'user-2',
    created_at: '2026-02-13T12:00:00Z',
    time_in_stage: '1 día',
    probability: 45,
    probability_label: 'low'
  },
  // Negociación (2 leads)
  {
    id: '8',
    name: 'Diana Torres',
    phone: '+57 307 890 1234',
    email: 'diana@medicplus.co',
    company: 'Medic Plus',
    stage: 'proposal',
    source_channel: 'whatsapp',
    ai_summary: 'En proceso de aprobación interna, muy interesada',
    assigned_to: 'user-1',
    created_at: '2026-02-12T10:00:00Z',
    time_in_stage: '2 días',
    probability: 78,
    probability_label: 'medium'
  },
  {
    id: '9',
    name: 'Patricia Vargas',
    phone: '+57 308 901 2345',
    email: 'patricia@retailpro.co',
    company: 'Retail Pro',
    stage: 'proposal',
    source_channel: 'instagram',
    ai_summary: 'Lista para cerrar, esperando orden de compra',
    assigned_to: 'user-2',
    created_at: '2026-02-11T14:30:00Z',
    time_in_stage: '3 días',
    probability: 95,
    probability_label: 'high'
  },
  // Cerrado (1 lead)
  {
    id: '11',
    name: 'Roberto Díaz',
    phone: '+57 310 123 4567',
    email: 'roberto@fashiongroup.co',
    company: 'Fashion Group',
    stage: 'closed',
    source_channel: 'whatsapp',
    ai_summary: 'Contrato firmado, implementación en progreso',
    assigned_to: 'user-1',
    created_at: '2026-02-10T11:00:00Z',
    time_in_stage: '4 días',
    probability: 100,
    probability_label: 'high'
  }
]

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  leads: MOCK_LEADS,
  filters: {
    searchQuery: '',
    channels: [],
    assignedTo: null,
    onlyMyLeads: false
  },
  selectedLeadId: null,
  currentUser: {
    id: 'user-1',
    role: 'admin',
    name: 'Usuario Demo'
  },
  salesAgents: [
    {
      id: 'user-1',
      role: 'admin',
      name: 'María González'
    },
    {
      id: 'user-2',
      role: 'sales_agent',
      name: 'Carlos Ramírez'
    }
  ],

  moveLeadToStage: (leadId: string, newStage: LeadStage) => {
    const lead = get().leads.find(l => l.id === leadId)
    if (!lead) return

    // Si es la misma etapa, no hacer nada
    if (lead.stage === newStage) return

    // Solo validar permisos para cerrar
    if (newStage === 'closed' && get().currentUser.role !== 'admin') {
      toast.error('Solo administradores pueden cerrar leads')
      return
    }

    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId
          ? { ...l, stage: newStage, time_in_stage: 'Ahora' }
          : l
      )
    }))

    const stageNames = {
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

  setChannelFilters: (channels: SourceChannel[]) => {
    set(state => ({
      filters: { ...state.filters, channels }
    }))
  },

  setAssignedToFilter: (userId: string | null) => {
    set(state => ({
      filters: { ...state.filters, assignedTo: userId }
    }))
  },

  toggleOnlyMyLeads: () => {
    set(state => ({
      filters: { ...state.filters, onlyMyLeads: !state.filters.onlyMyLeads }
    }))
  },

  setSelectedLead: (leadId: string | null) => {
    set({ selectedLeadId: leadId })
  },

  getFilteredLeads: () => {
    const { leads, filters, currentUser } = get()

    return leads.filter(lead => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchName = lead.name?.toLowerCase().includes(query)
        const matchPhone = lead.phone.toLowerCase().includes(query)
        if (!matchName && !matchPhone) return false
      }

      if (filters.channels.length > 0) {
        if (!filters.channels.includes(lead.source_channel)) return false
      }

      if (filters.assignedTo) {
        if (lead.assigned_to !== filters.assignedTo) return false
      }

      if (filters.onlyMyLeads) {
        if (lead.assigned_to !== currentUser.id) return false
      }

      return true
    })
  },

  getLeadsByStage: (stage: LeadStage) => {
    return get().getFilteredLeads().filter(lead => lead.stage === stage)
  }
}))
