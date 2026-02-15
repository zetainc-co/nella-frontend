import { create } from 'zustand'
import { toast } from 'sonner'
import type { Lead, LeadStage, KanbanFilters, KanbanUser, SourceChannel } from '@/types/kanban-types'

// ============================================
// Mock Data - 12 Leads
// ============================================

const MOCK_LEADS: Lead[] = [
  // Nuevo (3 leads)
  {
    id: '1',
    name: 'Juan Pérez',
    phone: '+57 300 123 4567',
    email: 'juan@techsolutions.co',
    company: 'Tech Solutions SAS',
    stage: 'new',
    source_channel: 'instagram',
    ai_summary: 'Interesado en plan premium para su empresa. Preguntó por precios y demo del sistema.',
    assigned_to: 'user-1',
    created_at: '2026-02-14T08:30:00Z',
    time_in_stage: '2 horas'
  },
  {
    id: '2',
    name: null,
    phone: '+57 301 234 5678',
    email: null,
    company: null,
    stage: 'new',
    source_channel: 'facebook',
    ai_summary: 'Lead recién llegado desde campaña de Facebook. Primera interacción pendiente.',
    assigned_to: null,
    created_at: '2026-02-14T09:15:00Z',
    time_in_stage: '1 hora'
  },
  {
    id: '3',
    name: 'María García',
    phone: '+57 302 345 6789',
    email: 'maria.garcia@gmail.com',
    company: null,
    stage: 'new',
    source_channel: 'tiktok',
    ai_summary: 'Consultó por servicios de marketing digital. Responde muy rápido en WhatsApp.',
    assigned_to: 'user-2',
    created_at: '2026-02-14T07:00:00Z',
    time_in_stage: '3 horas'
  },

  // Contactado (4 leads)
  {
    id: '4',
    name: 'Carlos Rodríguez',
    phone: '+57 303 456 7890',
    email: 'carlos@startupxyz.co',
    company: 'StartupXYZ',
    stage: 'contacted',
    source_channel: 'whatsapp',
    ai_summary: 'IA conversando activamente. Interés en automatización de ventas. Solicitó cotización.',
    assigned_to: 'user-1',
    created_at: '2026-02-13T15:30:00Z',
    time_in_stage: '1 día'
  },
  {
    id: '5',
    name: 'Ana Martínez',
    phone: '+57 304 567 8901',
    email: 'ana.martinez@empresa.com',
    company: 'Distribuidora Nacional',
    stage: 'contacted',
    source_channel: 'instagram',
    ai_summary: 'Necesita solución para equipo de 10 vendedores. Respondió 3 veces en las últimas 6 horas.',
    assigned_to: 'user-1',
    created_at: '2026-02-13T12:00:00Z',
    time_in_stage: '1 día'
  },
  {
    id: '6',
    name: 'Luis Fernández',
    phone: '+57 305 678 9012',
    email: null,
    company: null,
    stage: 'contacted',
    source_channel: 'facebook',
    ai_summary: 'Preguntó por integración con WhatsApp Business API. Dudas sobre costo mensual.',
    assigned_to: 'user-2',
    created_at: '2026-02-14T06:00:00Z',
    time_in_stage: '4 horas'
  },
  {
    id: '7',
    name: 'Sandra López',
    phone: '+57 306 789 0123',
    email: 'sandra@tiendaonline.co',
    company: 'Tienda Online Colombia',
    stage: 'contacted',
    source_channel: 'tiktok',
    ai_summary: 'E-commerce buscando automatizar atención al cliente. Interés alto, pidió caso de éxito.',
    assigned_to: 'user-2',
    created_at: '2026-02-13T18:00:00Z',
    time_in_stage: '16 horas'
  },

  // Propuesta (3 leads)
  {
    id: '8',
    name: 'Roberto Gómez',
    phone: '+57 307 890 1234',
    email: 'roberto.gomez@agencia.co',
    company: 'Agencia Digital Pro',
    stage: 'proposal',
    source_channel: 'whatsapp',
    ai_summary: 'Propuesta enviada para plan Enterprise. Esperando aprobación del presupuesto interno.',
    assigned_to: 'user-1',
    created_at: '2026-02-12T10:00:00Z',
    time_in_stage: '2 días'
  },
  {
    id: '9',
    name: 'Patricia Ruiz',
    phone: '+57 308 901 2345',
    email: 'patricia@constructora.co',
    company: 'Constructora del Valle',
    stage: 'proposal',
    source_channel: 'instagram',
    ai_summary: 'Interesada en demo personalizado. Propuesta presentada ayer, siguiente paso: reunión.',
    assigned_to: 'user-1',
    created_at: '2026-02-11T14:30:00Z',
    time_in_stage: '3 días'
  },
  {
    id: '10',
    name: 'Diego Torres',
    phone: '+57 309 012 3456',
    email: 'diego.torres@retail.co',
    company: 'Retail Solutions',
    stage: 'proposal',
    source_channel: 'facebook',
    ai_summary: 'Comparando con competencia. IA presentó diferenciadores clave. Responde activamente.',
    assigned_to: 'user-2',
    created_at: '2026-02-13T09:00:00Z',
    time_in_stage: '1 día'
  },

  // Cierre (2 leads)
  {
    id: '11',
    name: 'Claudia Herrera',
    phone: '+57 310 123 4567',
    email: 'claudia@consultoria.co',
    company: 'Consultoría Empresarial',
    stage: 'closed',
    source_channel: 'whatsapp',
    ai_summary: 'Aceptó propuesta. Agendó llamada de onboarding para mañana. Deal confirmado.',
    assigned_to: 'user-1',
    created_at: '2026-02-10T11:00:00Z',
    time_in_stage: '4 días'
  },
  {
    id: '12',
    name: 'Fernando Castro',
    phone: '+57 311 234 5678',
    email: 'fernando@logistica.co',
    company: 'Logística Express',
    stage: 'closed',
    source_channel: 'instagram',
    ai_summary: 'Cerrado exitosamente. Firmó contrato anual. Implementación programada para próxima semana.',
    assigned_to: 'user-1',
    created_at: '2026-02-09T16:00:00Z',
    time_in_stage: '5 días'
  }
]

// ============================================
// Store Interface
// ============================================

interface KanbanStore {
  // Estado
  leads: Lead[]
  filters: KanbanFilters
  selectedLeadId: string | null
  currentUser: KanbanUser

  // Acciones
  moveLeadToStage: (leadId: string, newStage: LeadStage) => void
  setSearchQuery: (query: string) => void
  setChannelFilters: (channels: SourceChannel[]) => void
  toggleOnlyMyLeads: () => void
  setSelectedLead: (leadId: string | null) => void

  // Selectores
  getFilteredLeads: () => Lead[]
  getLeadsByStage: (stage: LeadStage) => Lead[]
}

// ============================================
// Store Implementation
// ============================================

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  // Estado inicial
  leads: MOCK_LEADS,
  filters: {
    searchQuery: '',
    channels: [],
    onlyMyLeads: false
  },
  selectedLeadId: null,
  currentUser: {
    id: 'user-1',
    role: 'admin',
    name: 'Usuario Demo'
  },

  // Acción: Mover lead a nueva etapa
  moveLeadToStage: (leadId: string, newStage: LeadStage) => {
    const lead = get().leads.find(l => l.id === leadId)
    if (!lead) return

    // Validación 1: No retroceder etapas
    const stageOrder: LeadStage[] = ['new', 'contacted', 'proposal', 'closed']
    const currentIndex = stageOrder.indexOf(lead.stage)
    const newIndex = stageOrder.indexOf(newStage)

    if (newIndex < currentIndex) {
      toast.error('No puedes retroceder un lead a una etapa anterior')
      return
    }

    // Validación 2: Solo Admin puede cerrar
    if (newStage === 'closed' && get().currentUser.role !== 'admin') {
      toast.error('Solo administradores pueden cerrar leads')
      return
    }

    // Actualizar estado
    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId
          ? { ...l, stage: newStage, time_in_stage: 'Ahora' }
          : l
      )
    }))

    const stageNames = {
      new: 'Nuevo',
      contacted: 'Contactado',
      proposal: 'Propuesta',
      closed: 'Cierre'
    }

    toast.success(`Lead movido a ${stageNames[newStage]}`)
  },

  // Acción: Actualizar búsqueda
  setSearchQuery: (query: string) => {
    set(state => ({
      filters: { ...state.filters, searchQuery: query }
    }))
  },

  // Acción: Actualizar filtro de canales
  setChannelFilters: (channels: SourceChannel[]) => {
    set(state => ({
      filters: { ...state.filters, channels }
    }))
  },

  // Acción: Toggle "Solo mis leads"
  toggleOnlyMyLeads: () => {
    set(state => ({
      filters: { ...state.filters, onlyMyLeads: !state.filters.onlyMyLeads }
    }))
  },

  // Acción: Seleccionar lead (para panel lateral)
  setSelectedLead: (leadId: string | null) => {
    set({ selectedLeadId: leadId })
  },

  // Selector: Obtener leads filtrados
  getFilteredLeads: () => {
    const { leads, filters, currentUser } = get()

    return leads.filter(lead => {
      // Filtro de búsqueda
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchName = lead.name?.toLowerCase().includes(query)
        const matchPhone = lead.phone.toLowerCase().includes(query)
        if (!matchName && !matchPhone) return false
      }

      // Filtro de canales
      if (filters.channels.length > 0) {
        if (!filters.channels.includes(lead.source_channel)) return false
      }

      // Filtro "Solo mis leads"
      if (filters.onlyMyLeads) {
        if (lead.assigned_to !== currentUser.id) return false
      }

      return true
    })
  },

  // Selector: Obtener leads por etapa
  getLeadsByStage: (stage: LeadStage) => {
    return get().getFilteredLeads().filter(lead => lead.stage === stage)
  }
}))
