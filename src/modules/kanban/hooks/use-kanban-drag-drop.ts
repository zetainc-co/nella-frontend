'use client'

import { useState } from 'react'
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import { useKanbanLeads } from './use-kanban-leads'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import { useProjectStore } from '@/core/store/project-store'
import { queryKeys } from '@/core/api/query-keys'
import type { Lead, LeadStage } from '@/modules/kanban/types/kanban-types'

export function useKanbanDragDrop() {
  const { data: leads = [] } = useKanbanLeads()
  const moveLeadToStage = useKanbanStore(s => s.moveLeadToStage)
  const selectedProjectId = useProjectStore(s => s.selectedProjectId)
  const queryClient = useQueryClient()
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find(l => String(l.id) === String(event.active.id))
    setActiveLead(lead || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)

    if (!over) return

    const leadId = Number(active.id)
    const newStage = over.id as LeadStage
    const lead = leads.find(l => l.id === leadId)

    if (!lead || lead.stage === newStage) return

    // Optimistic update in React Query cache
    queryClient.setQueryData(
      [...queryKeys.kanban.leads(), selectedProjectId],
      (old: Lead[] | undefined) =>
        old?.map(l => (l.id === leadId ? { ...l, stage: newStage } : l)),
    )

    moveLeadToStage(leadId, newStage)
  }

  return {
    activeLead,
    handleDragStart,
    handleDragEnd
  }
}
