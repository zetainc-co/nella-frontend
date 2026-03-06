'use client'

import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'
import { LeadCard } from './lead-card'
import { useDroppable } from '@dnd-kit/core'
import type { KanbanColumnProps } from '@/modules/kanban/types/kanban-types'

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
        'rounded-lg p-0 h-[calc(100vh-250px)] min-h-[500px]',
        'w-full md:w-[280px] lg:w-[320px] 2xl:w-auto',
        'shrink-0 flex flex-col transition-all',
        'border-2 border-transparent',
        isOver && 'border-[#8B5CF6] border-dashed bg-[#8B5CF6]/5'
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 bg-[#1A1A1A] rounded-t-lg transition-colors",
        isOver && "bg-[#8B5CF6]/10"
      )}>
        <h2 className="font-semibold text-white text-base">{title}</h2>
        <span className="text-sm font-bold text-gray-100 bg-[#323237] px-2.5 py-0.5 rounded-full min-w-[28px] text-center">
          {leadsInStage.length}
        </span>
      </div>

      {/* Leads */}
      <div className={cn(
        "flex-1 space-y-3 overflow-y-auto custom-scrollbar bg-[#0d0d0d] rounded-b-lg p-4 transition-colors",
        isOver && "bg-[#8B5CF6]/5"
      )}>
        {leadsInStage.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
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
