const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export interface BackendContact {
  id: number
  phone: string
  name: string
  email: string
  lead_status: string
  handoff_active: boolean
  ai_summary: string
  last_interaction_at: string
  next_purchase_prediction: string | null
  referral_code: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ContactsQuery {
  phone?: string
  lead_status?: string
}

export interface UpdateContactPayload {
  name?: string
  email?: string
  lead_status?: string
  handoff_active?: boolean
  ai_summary?: string
  referral_code?: string
  tags?: string[]
  next_purchase_prediction?: string
}

export interface CreateContactPayload {
  phone: string
  name?: string
  email?: string
  lead_status?: string
  handoff_active?: boolean
  referral_code?: string
  tags?: string[]
}

export const contactsApi = {
  getAll: async (query?: ContactsQuery): Promise<BackendContact[]> => {
    const params = new URLSearchParams()
    if (query?.phone) params.set('phone', query.phone)
    if (query?.lead_status) params.set('lead_status', query.lead_status)

    const url = `${API_URL}/contacts${params.toString() ? `?${params}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al cargar contactos')
    return res.json()
  },

  getById: async (id: number): Promise<BackendContact> => {
    const res = await fetch(`${API_URL}/contacts/${id}`)
    if (!res.ok) throw new Error('Contacto no encontrado')
    return res.json()
  },

  create: async (payload: CreateContactPayload): Promise<BackendContact> => {
    const res = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Error al crear contacto')
    return res.json()
  },

  update: async (id: number, payload: UpdateContactPayload): Promise<BackendContact> => {
    const res = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Error al actualizar contacto')
    return res.json()
  },

  remove: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/contacts/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar contacto')
  },
}
