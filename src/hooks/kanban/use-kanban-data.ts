'use client'

import { useKanbanStore } from '@/stores/kanban-store'
import type { LeadStage } from '@/types/kanban-types'

export function useKanbanData() {
  const { leads, getFilteredLeads } = useKanbanStore()

  const filteredLeads = getFilteredLeads()

  /**
   * Obtiene el conteo de leads en una etapa específica
   */
  const getStageCount = (stage: LeadStage): number => {
    return filteredLeads.filter(lead => lead.stage === stage).length
  }

  /**
   * Obtiene los leads filtrados de una etapa específica
   */
  const getLeadsForStage = (stage: LeadStage) => {
    return filteredLeads.filter(lead => lead.stage === stage)
  }

  return {
    leads,
    filteredLeads,
    getStageCount,
    getLeadsForStage
  }
}

