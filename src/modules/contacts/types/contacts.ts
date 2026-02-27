export interface BackendContact {
  id: number
  phone: string
  name: string
  email: string
  lead_status: string
  status: string | null
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
  lead_status?: string | null
  status?: string
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
