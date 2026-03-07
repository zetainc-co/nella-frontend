'use client'

import { useState, useMemo } from 'react'
import type { ContactDetail } from '@/modules/contacts/types/contact-types'
import type { BackendContact } from '@/modules/contacts/types/contacts'
import { useContacts, useContactsSSE } from '@/modules/contacts/hooks/useContacts'
import { useProjectStore } from '@/core/store/project-store'
import { STATUS_TO_STAGE, mapLeadStatusToStage, STAGE_BADGE } from '@/modules/kanban/hooks/use-kanban-constants'
import type { LeadStage } from '@/modules/kanban/types/kanban-types'

const ITEMS_PER_PAGE = 5

function getContactStage(status: string | null, lead_status: string | null): LeadStage {
  if (status) {
    const mapped = STATUS_TO_STAGE[status.toLowerCase()]
    if (mapped) return mapped
  }
  return mapLeadStatusToStage(lead_status)
}

function mapBackendContact(c: BackendContact): ContactDetail {
  const stage = getContactStage(c.status, c.lead_status)
  const { probability, displayLabel } = STAGE_BADGE[stage]

  return {
    id: String(c.id),
    name: c.name || c.phone,
    phone: c.phone,
    email: c.email || '',
    tags: c.tags || [],
    lead_status: c.lead_status,
    handoff_active: c.handoff_active,
    ai_summary: c.ai_summary || '',
    last_interaction_at: c.last_interaction_at,
    stage: displayLabel,
    time: c.last_interaction_at
      ? new Date(c.last_interaction_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })
      : '-',
    company: '-',
    role: '-',
    location: '-',
    score: probability,
    scoreLabel: displayLabel,
    channel: 'WhatsApp',
    channelDetail: '-',
    lastConversation: c.ai_summary || '-',
  }
}

export function useContactsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContact, setSelectedContact] = useState<ContactDetail | null>(null)

  const selectedProjectId = useProjectStore((s) => s.selectedProjectId)

  const { data: backendContacts = [], isLoading } = useContacts(
    selectedProjectId ? { project_id: selectedProjectId } : undefined
  )
  useContactsSSE()

  const contacts = useMemo(() => backendContacts.map(mapBackendContact), [backendContacts])

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStage = selectedStage === 'Todos' || contact.stage === selectedStage
      return matchesSearch && matchesStage
    })
  }, [contacts, searchTerm, selectedStage])

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE)
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const stageCounts = useMemo(() => {
    const counts = { Nuevo: 0, Calificado: 0, Negociación: 0, Lead: 0 }
    filteredContacts.forEach(c => {
      if (c.stage in counts) counts[c.stage as keyof typeof counts]++
    })
    return counts
  }, [filteredContacts])

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  return {
    searchTerm,
    selectedStage,
    currentPage,
    selectedContact,
    setSelectedContact,
    setCurrentPage,
    isLoading,
    filteredContacts,
    paginatedContacts,
    totalPages,
    stageCounts,
    handleStageChange,
    handleSearchChange,
  }
}
