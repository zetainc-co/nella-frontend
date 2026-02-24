import type { BackendContact } from '@/modules/contacts/types/contacts'

export const mockContact: BackendContact = {
  id: 1,
  phone: '+573001234567',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  lead_status: 'HOT LEAD',
  handoff_active: false,
  ai_summary: 'Interesado en plan premium',
  last_interaction_at: '2026-02-23T00:00:00Z',
  next_purchase_prediction: null,
  referral_code: null,
  tags: [],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-23T00:00:00Z',
}

export const mockContacts: BackendContact[] = [mockContact]
