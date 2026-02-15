'use client'

import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'
import { LeadCard } from './lead-card'
import { useDroppable } from '@dnd-kit/core'
import type { KanbanColumnProps } from '@/types/kanban-types'

export function KanbanColumn({ stage, title, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { stage }
  })

  const leadsInStage = leads.filter(lead => lead.stage === stage)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-card border rounded-lg p-4 mt-1 h-[600px]',
        'w-full md:w-[280px] lg:w-[350px] 2xl:w-auto',
        'shrink-0 flex flex-col transition-all',
        isOver && 'ring-2 ring-primary-neon/30 bg-primary-neon/5'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {leadsInStage.length}
        </span>
      </div>

      {/* Leads */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
        {leadsInStage.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Inbox className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">No hay leads en esta etapa</p>
          </div>
        ) : (
          leadsInStage.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
