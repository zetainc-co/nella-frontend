'use client'

import { useMemo } from 'react'
import { useKanbanLeads } from './use-kanban-leads'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import type { LeadStage } from '@/modules/kanban/types/kanban-types'

export function useKanbanData() {
  const { data: leads = [] } = useKanbanLeads()
  const filters = useKanbanStore(s => s.filters)

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchName = lead.name?.toLowerCase().includes(query)
        const matchPhone = lead.phone.toLowerCase().includes(query)
        if (!matchName && !matchPhone) return false
      }
      return true
    })
  }, [leads, filters.searchQuery])

  const getStageCount = (stage: LeadStage): number => {
    return filteredLeads.filter(lead => lead.stage === stage).length
  }

  const getLeadsForStage = (stage: LeadStage) => {
    return filteredLeads.filter(lead => lead.stage === stage)
  }

  return {
    leads,
    filteredLeads,
    getStageCount,
    getLeadsForStage,
  }
}
