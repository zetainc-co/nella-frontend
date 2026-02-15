'use client'

import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import { useKanbanConstants } from '@/hooks/kanban'
import type { LeadCardProps } from '@/types/kanban-types'

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const { getChannelIcon, getChannelColor } = useKanbanConstants()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead }
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined

  const ChannelIcon = getChannelIcon(lead.source_channel)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-card border rounded-lg p-3 cursor-pointer transition-all',
        'tech-glow',
        isDragging && 'opacity-50 shadow-2xl scale-105 cursor-grabbing',
        !isDragging && 'hover:shadow-lg'
      )}
    >
      {/* Header Compacto: Icono + Nombre + Fecha */}
      <div className="flex items-center gap-2 mb-2">
        {/* Icono de red social */}
        <ChannelIcon className={cn('w-4 h-4 shrink-0', getChannelColor(lead.source_channel))} />

        {/* Nombre o teléfono */}
        <h3 className="font-semibold text-foreground text-sm line-clamp-1 flex-1">
          {lead.name || lead.phone}
        </h3>

        {/* Fecha/hora */}
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {lead.time_in_stage}
        </span>
      </div>

      {/* Descripción/Resumen IA */}
      <p className="text-xs text-muted-foreground line-clamp-2">
        {lead.ai_summary}
      </p>
    </div>
  )
}
