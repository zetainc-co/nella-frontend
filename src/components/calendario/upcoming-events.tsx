// src/components/calendario/upcoming-events.tsx
'use client'

import { format, parseISO, isAfter, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCalendarStore } from '@/stores/calendar-store'
import { getProjectColors } from '@/types/calendar-types'

export function UpcomingEvents() {
  const { getFilteredEvents } = useCalendarStore()

  const today = startOfToday()

  const upcoming = getFilteredEvents()
    .filter(e => isAfter(parseISO(e.date), today) || e.date === format(today, 'yyyy-MM-dd'))
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      return dateCompare !== 0 ? dateCompare : a.startTime.localeCompare(b.startTime)
    })
    .slice(0, 4)

  return (
    <div className="px-3 py-2">
      <span className="text-sm font-semibold text-foreground block mb-2">Próximos Eventos</span>

      {upcoming.length === 0 ? (
        <p className="text-xs text-muted-foreground">No hay eventos próximos</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map(event => {
            const colors = getProjectColors(event.project)
            const parsedDate = parseISO(event.date)
            const dayLabel = format(parsedDate, "d 'de' MMM", { locale: es })

            return (
              <div
                key={event.id}
                className="rounded-md p-2 text-sm"
                style={{ backgroundColor: colors.bg, borderLeft: `3px solid ${colors.border}` }}
              >
                <p className="font-medium text-foreground text-xs truncate">{event.title}</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  {dayLabel} · {event.startTime} - {event.endTime}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
