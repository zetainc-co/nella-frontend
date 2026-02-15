'use client'

import { useState } from 'react'
import { useKanbanStore } from '@/stores/kanban-store'

/**
 * Hook personalizado para manejar el panel lateral de detalles del lead
 * Gestiona la apertura/cierre y sincronización con el lead seleccionado
 */
export function useKanbanPanel() {
  const { setSelectedLead } = useKanbanStore()
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  /**
   * Abre el panel con el lead seleccionado
   */
  const openPanel = (leadId: string) => {
    setSelectedLead(leadId)
    setIsPanelOpen(true)
  }

  /**
   * Cierra el panel y limpia el lead seleccionado
   * Usa un timeout para permitir la animación de cierre
   */
  const closePanel = () => {
    setIsPanelOpen(false)
    setTimeout(() => setSelectedLead(null), 200)
  }

  return {
    isPanelOpen,
    openPanel,
    closePanel
  }
}

