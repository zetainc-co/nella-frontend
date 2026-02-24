// src/components/calendario/calendar-event-card.tsx
'use client'

import { getProjectColors } from '@/modules/calendar/types/calendar-types'
import type { CalendarEvent } from '@/modules/calendar/types/calendar-types'

interface CalendarEventCardProps {
  event: CalendarEvent
  onClick?: (event: CalendarEvent) => void
}

function getEventPositionStyle(event: CalendarEvent): React.CSSProperties {
  const [startH, startM] = event.startTime.split(':').map(Number)
  const [endH, endM] = event.endTime.split(':').map(Number)
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  const durationMinutes = endMinutes - startMinutes

  return {
    position: 'absolute',
    top: `${startMinutes}px`,
    height: `${Math.max(durationMinutes, 30)}px`,
    left: '2px',
    right: '2px',
    zIndex: 10,
  }
}

export function CalendarEventCard({ event, onClick }: CalendarEventCardProps) {
  const colors = getProjectColors(event.project)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    onClick?.(event)
  }

  return (
    <div
      style={{
        ...getEventPositionStyle(event),
        backgroundColor: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
      }}
      className="rounded-r-md px-2 py-1 cursor-pointer overflow-hidden hover:brightness-110 transition-all"
      title={`${event.title} — ${event.client}`}
      onClick={handleClick}
    >
      <div
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 mb-0.5"
        style={{ backgroundColor: colors.bg }}
      >
        <span className="text-[10px] font-semibold" style={{ color: colors.text }}>
          {event.project}
        </span>
      </div>
      <p className="text-xs font-medium text-foreground leading-tight truncate">
        {event.title}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {event.startTime} - {event.endTime}
      </p>
    </div>
  )
}
