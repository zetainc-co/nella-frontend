import { describe, it, expect, beforeEach } from 'vitest'
import { transformContactToLead, useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import { mockContact } from '../../../../mocks/contacts.mock'
import type { BackendContact } from '@/modules/contacts/types/contacts'

describe('transformContactToLead', () => {
  it('transforms a contact with HOT LEAD status to "contacted" stage', () => {
    const lead = transformContactToLead(mockContact)

    expect(lead.id).toBe(mockContact.id)
    expect(lead.name).toBe(mockContact.name)
    expect(lead.phone).toBe(mockContact.phone)
    expect(lead.email).toBe(mockContact.email)
    expect(lead.stage).toBe('contacted') // HOT LEAD -> contacted
    expect(lead.lead_status).toBe('HOT LEAD')
    expect(lead.probability).toBe(90)
    expect(lead.probability_label).toBe('high')
  })

  it('transforms a contact with COLD LEAD status to "new" stage', () => {
    const coldContact: BackendContact = {
      ...mockContact,
      lead_status: 'COLD LEAD',
    }

    const lead = transformContactToLead(coldContact)

    expect(lead.stage).toBe('new')
    expect(lead.probability).toBe(30)
    expect(lead.probability_label).toBe('low')
  })

  it('transforms a contact with WARM LEAD status to "proposal" stage', () => {
    const warmContact: BackendContact = {
      ...mockContact,
      lead_status: 'WARM LEAD',
    }

    const lead = transformContactToLead(warmContact)

    expect(lead.stage).toBe('proposal')
    expect(lead.probability).toBe(60)
    expect(lead.probability_label).toBe('medium')
  })

  it('transforms a contact with DESCARTADO status to "closed" stage', () => {
    const discardedContact: BackendContact = {
      ...mockContact,
      lead_status: 'DESCARTADO',
    }

    const lead = transformContactToLead(discardedContact)

    expect(lead.stage).toBe('closed')
    expect(lead.probability).toBe(0)
    expect(lead.probability_label).toBe('low')
  })

  it('defaults to "new" stage for unknown lead_status', () => {
    const unknownContact: BackendContact = {
      ...mockContact,
      lead_status: 'UNKNOWN_STATUS',
    }

    const lead = transformContactToLead(unknownContact)

    expect(lead.stage).toBe('new')
    expect(lead.probability).toBe(30) // default badge
    expect(lead.probability_label).toBe('low')
  })

  it('defaults to "new" stage when lead_status is null', () => {
    const nullStatusContact: BackendContact = {
      ...mockContact,
      lead_status: null as unknown as string,
    }

    const lead = transformContactToLead(nullStatusContact)

    expect(lead.stage).toBe('new')
  })
})

describe('useKanbanStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useKanbanStore.setState({
      leads: [],
      filters: { searchQuery: '' },
      selectedLeadId: null,
      isLoading: false,
      error: null,
    })
  })

  it('getLeadsByStage returns only leads matching the stage', () => {
    const hotLead = transformContactToLead(mockContact) // stage = 'contacted'
    const coldLead = transformContactToLead({ ...mockContact, id: 2, lead_status: 'COLD LEAD' }) // stage = 'new'

    useKanbanStore.setState({ leads: [hotLead, coldLead] })

    const contacted = useKanbanStore.getState().getLeadsByStage('contacted')
    expect(contacted).toHaveLength(1)
    expect(contacted[0].id).toBe(mockContact.id)

    const newLeads = useKanbanStore.getState().getLeadsByStage('new')
    expect(newLeads).toHaveLength(1)
    expect(newLeads[0].id).toBe(2)
  })

  it('setSearchQuery filters leads by name', () => {
    const lead1 = transformContactToLead({ ...mockContact, name: 'Juan Pérez' })
    const lead2 = transformContactToLead({ ...mockContact, id: 2, name: 'María López' })

    useKanbanStore.setState({ leads: [lead1, lead2] })
    useKanbanStore.getState().setSearchQuery('Juan')

    const filtered = useKanbanStore.getState().getFilteredLeads()
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('Juan Pérez')
  })

  it('upsertContact adds new lead when it does not exist', () => {
    useKanbanStore.getState().upsertContact(mockContact)

    const leads = useKanbanStore.getState().leads
    expect(leads).toHaveLength(1)
    expect(leads[0].id).toBe(mockContact.id)
  })

  it('upsertContact updates existing lead', () => {
    useKanbanStore.getState().upsertContact(mockContact)
    useKanbanStore.getState().upsertContact({ ...mockContact, name: 'Updated Name' })

    const leads = useKanbanStore.getState().leads
    expect(leads).toHaveLength(1)
    expect(leads[0].name).toBe('Updated Name')
  })

  it('moveLeadToStage changes the stage of a lead', () => {
    const lead = transformContactToLead(mockContact)
    useKanbanStore.setState({ leads: [lead] })

    useKanbanStore.getState().moveLeadToStage(lead.id, 'proposal')

    const updatedLeads = useKanbanStore.getState().leads
    expect(updatedLeads[0].stage).toBe('proposal')
  })
})
