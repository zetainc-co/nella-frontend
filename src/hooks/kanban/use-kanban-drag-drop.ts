'use client'

import { useState } from 'react'
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useKanbanStore } from '@/stores/kanban-store'
import type { Lead, LeadStage } from '@/types/kanban-types'

/**
 * Hook personalizado para manejar la lógica de drag and drop del Kanban
 * Gestiona el estado del lead activo durante el arrastre y ejecuta el movimiento
 */
export function useKanbanDragDrop() {
  const { leads, moveLeadToStage } = useKanbanStore()
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  /**
   * Handler cuando inicia el drag
   * Encuentra el lead que se está arrastrando y lo guarda en el estado
   */
  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find(l => l.id === event.active.id)
    setActiveLead(lead || null)
  }

  /**
   * Handler cuando termina el drag
   * Mueve el lead a la nueva etapa si es válido
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)

    if (!over) return

    const leadId = active.id as string
    const newStage = over.id as LeadStage

    moveLeadToStage(leadId, newStage)
  }

  return {
    activeLead,
    handleDragStart,
    handleDragEnd
  }
}

