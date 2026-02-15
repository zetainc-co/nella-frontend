'use client'

import { DndContext, DragOverlay } from '@dnd-kit/core'
import { KanbanColumn } from './kanban-column'
import { KanbanFilters } from './kanban-filters'
import { LeadModal } from './lead-modal'
import { KanbanSkeleton } from './kanban-skeleton'
import { LeadCard } from './lead-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useKanbanDragDrop,
  useKanbanPanel,
  useKanbanLoading,
  useKanbanData,
  useKanbanConstants
} from '@/hooks/kanban'

export function KanbanBoard() {
  // Hooks personalizados
  const isLoading = useKanbanLoading()
  const { filteredLeads, getStageCount, getLeadsForStage } = useKanbanData()
  const { activeLead, handleDragStart, handleDragEnd } = useKanbanDragDrop()
  const { isPanelOpen, openPanel, closePanel } = useKanbanPanel()
  const { KANBAN_COLUMNS } = useKanbanConstants()

  if (isLoading) {
    return <KanbanSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <KanbanFilters />

      {/* Desktop/Tablet: Drag and Drop Kanban */}
      <div className="hidden md:block">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex overflow-x-auto snap-x snap-mandatory 2xl:grid 2xl:grid-cols-4 gap-4 custom-scrollbar pb-4">
            {KANBAN_COLUMNS.map(({ stage, title }) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                title={title}
                leads={filteredLeads}
                onLeadClick={openPanel}
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
                      onClick={() => openPanel(lead.id)}
                    />
                  ))
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>

      {/* Panel lateral */}
      <LeadModal open={isPanelOpen} onClose={closePanel} />
    </div>
  )
}
