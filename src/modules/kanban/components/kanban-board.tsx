'use client'

import { useState } from 'react'
import {
  useSensor,
  useSensors,
  DndContext,
  DragOverlay,
  PointerSensor,
} from '@dnd-kit/core'
import {
  useKanbanData,
  useKanbanSSE,
  useKanbanDragDrop,
  useKanbanConstants,
  useKanbanLeads,
} from '@/modules/kanban/hooks'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import { LeadCard } from './lead-card'
import { KanbanColumn } from './kanban-column'
import { KanbanFilters } from './kanban-filters'
import { KanbanSkeleton } from './kanban-skeleton'
import { LeadDetailsPanel } from './lead-details-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function KanbanBoard() {
  const [panelOpen, setPanelOpen] = useState(false)
  const setSelectedLead = useKanbanStore(state => state.setSelectedLead)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  useKanbanSSE()
  const { isLoading } = useKanbanLeads()
  const { filteredLeads, getStageCount, getLeadsForStage } = useKanbanData()
  const { activeLead, handleDragStart, handleDragEnd } = useKanbanDragDrop()
  const { KANBAN_COLUMNS } = useKanbanConstants()

  const handleLeadClick = (leadId: number) => {
    setSelectedLead(leadId)
    setPanelOpen(true)
  }

  if (isLoading) {
    return <KanbanSkeleton />
  }

  return (
    <div className="space-y-6">
      <KanbanFilters />

      {/* Desktop/Tablet */}
      <div className="hidden md:block">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex overflow-x-auto snap-x snap-mandatory 2xl:grid 2xl:grid-cols-4 gap-4 custom-scrollbar pb-4">
            {KANBAN_COLUMNS.map(({ stage, title }) => (
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

      {/* Mobile: Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            {KANBAN_COLUMNS.map(({ stage, title }) => {
              const count = getStageCount(stage)
              return (
                <TabsTrigger key={stage} value={stage} className="text-xs">
                  {title} ({count})
                </TabsTrigger>
              )
            })}
          </TabsList>

          {KANBAN_COLUMNS.map(({ stage }) => {
            const leadsInStage = getLeadsForStage(stage)
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

      <LeadDetailsPanel
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false)
          setSelectedLead(null)
        }}
      />
    </div>
  )
}
