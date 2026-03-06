// src/components/calendario/upcoming-events.tsx
'use client'

import { format, parseISO, isAfter, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Sparkles } from 'lucide-react'
import { useCalendarStore } from '@/modules/calendar/stores/calendar-store'
import { getProjectColors } from '@/modules/calendar/types/calendar-types'

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
    <div className="px-4 py-4">
      <span className="text-sm font-bold block mb-3" style={{ color: '#f0f4ff' }}>
        Próximos Eventos
      </span>

      {upcoming.length === 0 ? (
        <p className="text-xs" style={{ color: 'rgba(240,244,255,0.4)' }}>
          No hay eventos próximos
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.map(event => {
            const colors = getProjectColors(event.project)

            return (
              <div
                key={event.id}
                className="rounded-lg p-3 relative"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Project badge */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="size-3" style={{ color: colors.border }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: colors.border }}
                  >
                    {event.project}
                  </span>
                </div>

                {/* Event title */}
                <h4
                  className="text-sm font-bold mb-1 pr-4"
                  style={{ color: '#f0f4ff' }}
                >
                  {event.title}
                </h4>

                {/* Time */}
                <p
                  className="text-xs mb-1"
                  style={{ color: 'rgba(240,244,255,0.5)' }}
                >
                  {event.startTime} - {event.endTime}
                </p>

                {/* Client name */}
                <p
                  className="text-xs"
                  style={{ color: 'rgba(240,244,255,0.35)' }}
                >
                  {event.client}
                </p>

                {/* Color dot */}
                <div
                  className="absolute top-3 right-3 size-2.5 rounded-full"
                  style={{ backgroundColor: colors.border }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
