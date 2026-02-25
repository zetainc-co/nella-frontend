'use client'

import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import { Badge } from '@/components/ui/badge'
import type { LeadCardProps } from '@/modules/kanban/types/kanban-types'

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(lead.id),
    data: { lead }
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getProbabilityLabel = () => {
    switch (lead.probability_label) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Media'
      case 'low':
        return 'Baja'
      default:
        return ''
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-[#1a1a1a] border-2 rounded-lg p-4 cursor-grab transition-all relative',
        'border-gray-800 hover:border-gray-700',
        isDragging && 'opacity-40 shadow-2xl scale-105 cursor-grabbing border-[#8BD21D] ring-2 ring-[#8BD21D]/30',
        !isDragging && 'hover:shadow-lg hover:shadow-[#8BD21D]/10'
      )}
    >
      <h3 className="font-semibold text-gray-200 text-base mb-1">
        {lead.name || lead.phone}
      </h3>

      <p className="text-sm text-gray-400 mb-3">&nbsp;</p>

      <p className="text-sm text-gray-300 mb-4 line-clamp-2">
        {lead.ai_summary || 'Sin resumen disponible'}
      </p>

      <div className="flex items-center justify-between">
        <Badge variant={lead.probability_label} size="default">
          {lead.probability}% {getProbabilityLabel()}
        </Badge>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold"
          style={{ backgroundColor: '#8BD21D' }}
        >
          {getInitials(lead.name)}
        </div>
      </div>
    </div>
  )
}
