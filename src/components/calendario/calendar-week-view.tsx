// src/components/calendario/calendar-week-view.tsx
'use client'

import { useRef, useEffect } from 'react'
import { addDays, format, isToday, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Link2, Settings2, Plus, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarEventCard } from './calendar-event-card'
import { CalendarTimeIndicator } from './calendar-time-indicator'
import { useCalendarStore } from '@/stores/calendar-store'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface CalendarWeekViewProps {
  onOpenNewEvent: (date?: string, time?: string) => void
  onOpenLinks: () => void
  onOpenAvailability: () => void
  onOpenSidebar: () => void
}

export function CalendarWeekView({
  onOpenNewEvent,
  onOpenLinks,
  onOpenAvailability,
  onOpenSidebar,
}: CalendarWeekViewProps) {
  const { currentWeekStart, goToNextWeek, goToPrevWeek, getEventsForDate } =
    useCalendarStore()

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * 60 - 30
    }
  }, [])

  const monday = startOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  const monthLabel = format(monday, 'MMMM yyyy', { locale: es })
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  function handleCellClick(dayDate: Date, hour: number) {
    const dateStr = format(dayDate, 'yyyy-MM-dd')
    const timeStr = `${String(hour).padStart(2, '0')}:00`
    onOpenNewEvent(dateStr, timeStr)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={onOpenSidebar}
          >
            <Menu className="size-5" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevWeek}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-foreground min-w-[160px] text-center">
              {capitalizedMonth}
            </h2>
            <button
              onClick={goToNextWeek}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenLinks}
            className="hidden sm:flex items-center gap-1.5 text-xs"
          >
            <Link2 className="size-3.5" />
            <span className="hidden md:inline">Links de Cita</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAvailability}
            className="hidden sm:flex items-center gap-1.5 text-xs"
          >
            <Settings2 className="size-3.5" />
            <span className="hidden md:inline">Configurar Disponibilidad</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenNewEvent()}
            className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Nuevo Evento</span>
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div
        className="grid shrink-0 border-b border-border bg-background"
        style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}
      >
        <div className="border-r border-border" />
        {weekDays.map(day => {
          const isCurrentDay = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className="text-center py-3 border-l border-border"
            >
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {format(day, 'EEE', { locale: es })}
              </p>
              <p
                className={`text-2xl font-bold mt-0.5 ${
                  isCurrentDay ? 'text-primary' : 'text-foreground'
                }`}
              >
                {format(day, 'd')}
              </p>
            </div>
          )
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: '52px repeat(7, 1fr)',
            height: `${24 * 60}px`,
          }}
        >
          {/* Time labels */}
          <div className="relative border-r border-border">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="absolute right-2 text-[11px] text-muted-foreground -translate-y-2"
                style={{ top: `${hour * 60}px` }}
              >
                {hour === 0 ? '' : `${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayEvents = getEventsForDate(dateStr)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={dateStr}
                className={`relative border-l border-border ${
                  isCurrentDay ? 'bg-primary/[0.02]' : ''
                }`}
              >
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/30 cursor-pointer hover:bg-accent/20 transition-colors"
                    style={{ top: `${hour * 60}px`, height: '60px' }}
                    onClick={() => handleCellClick(day, hour)}
                  />
                ))}

                {dayEvents.map(event => (
                  <CalendarEventCard key={event.id} event={event} />
                ))}

                {isCurrentDay && <CalendarTimeIndicator />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
