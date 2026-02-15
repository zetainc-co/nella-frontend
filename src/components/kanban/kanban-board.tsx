'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { KanbanColumn } from './kanban-column'
import { KanbanFilters } from './kanban-filters'
import { LeadDetailsPanel } from './lead-details-panel'
import { KanbanSkeleton } from './kanban-skeleton'
import { LeadCard } from './lead-card'
import { useKanbanStore } from '@/stores/kanban-store'
import type { LeadStage } from '@/types/kanban-types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function KanbanBoard() {
  const {
    moveLeadToStage,
    setSelectedLead,
    getFilteredLeads,
    leads
  } = useKanbanStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activeLead, setActiveLead] = useState<typeof leads[0] | null>(null)

  const filteredLeads = getFilteredLeads()

  // Simular loading inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find(l => l.id === event.active.id)
    setActiveLead(lead || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)

    if (!over) return

    const leadId = active.id as string
    const newStage = over.id as LeadStage

    moveLeadToStage(leadId, newStage)
  }

  const handleLeadClick = (leadId: string) => {
    setSelectedLead(leadId)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setTimeout(() => setSelectedLead(null), 200)
  }

  if (isLoading) {
    return <KanbanSkeleton />
  }

  const columns = [
    { stage: 'new' as LeadStage, title: 'Nuevo' },
    { stage: 'contacted' as LeadStage, title: 'Contactado' },
    { stage: 'proposal' as LeadStage, title: 'En Propuesta' },
    { stage: 'closed' as LeadStage, title: 'Cierre' }
  ]

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <KanbanFilters />

      {/* Desktop/Tablet: Drag and Drop Kanban */}
      <div className="hidden md:block">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex overflow-x-auto snap-x snap-mandatory 2xl:grid 2xl:grid-cols-4 gap-4 custom-scrollbar pb-4">
            {columns.map(({ stage, title }) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                title={title}
                leads={filteredLeads}
                onLeadClick={handleLeadClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? (
              <LeadCard lead={activeLead} onClick={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Mobile: Tabs (sin drag-and-drop) */}
      <div className="md:hidden">
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            {columns.map(({ stage, title }) => {
              const count = filteredLeads.filter(l => l.stage === stage).length
              return (
                <TabsTrigger key={stage} value={stage} className="text-xs">
                  {title} ({count})
                </TabsTrigger>
              )
            })}
          </TabsList>

          {columns.map(({ stage }) => {
            const leadsInStage = filteredLeads.filter(l => l.stage === stage)
            return (
              <TabsContent key={stage} value={stage} className="space-y-3 mt-4">
                {leadsInStage.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay leads en esta etapa
                  </p>
                ) : (
                  leadsInStage.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={() => handleLeadClick(lead.id)}
                    />
                  ))
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>

      {/* Panel lateral */}
      <LeadDetailsPanel open={isPanelOpen} onClose={handlePanelClose} />
    </div>
  )
}
