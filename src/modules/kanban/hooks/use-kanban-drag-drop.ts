'use client'

import { useState } from 'react'
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import type { Lead, LeadStage } from '@/modules/kanban/types/kanban-types'

export function useKanbanDragDrop() {
  const { leads, moveLeadToStage } = useKanbanStore()
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

    moveLeadToStage(leadId, newStage)
  }

  return {
    activeLead,
    handleDragStart,
    handleDragEnd
  }
}
