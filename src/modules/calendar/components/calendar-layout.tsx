// src/components/calendario/calendar-layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { CalendarSidebar } from './calendar-sidebar'
import { CalendarWeekView } from './calendar-week-view'
import { NewEventModal } from './modals/new-event-modal'
import { AvailabilityModal } from './modals/availability-modal'
import { LinksModal } from './modals/links-modal'
import { EventDetailsModal } from './modals/event-details-modal'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import type { CalendarEvent } from '@/types/calendar-types'

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_denied: 'Rechazaste la autorización en Google.',
  missing_token: 'Token faltante al iniciar el flujo de conexión.',
  invalid_token: 'El token de sesión es inválido o expiró.',
  tenant_not_found: 'El tenant no existe.',
  oauth_failed: 'Error interno al conectar con Google Calendar.',
}

export function CalendarLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false)
  const [isLinksOpen, setIsLinksOpen] = useState(false)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [newEventDate, setNewEventDate] = useState<string | undefined>()
  const [newEventTime, setNewEventTime] = useState<string | undefined>()

  const { refetchEvents } = useCalendarEvents()

  // Handle Google Calendar OAuth callback query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const errorCode = params.get('error')

    if (connected === 'true') {
      toast.success('Google Calendar conectado exitosamente')
      // Clean query params from URL without page reload
      window.history.replaceState({}, '', window.location.pathname)
    } else if (errorCode) {
      const errorMsg = GOOGLE_ERROR_MESSAGES[errorCode] ?? 'Error al conectar Google Calendar.'
      toast.error('Error al conectar Google Calendar', { description: errorMsg })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleOpenNewEvent(date?: string, time?: string) {
    setNewEventDate(date)
    setNewEventTime(time)
    setIsNewEventOpen(true)
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event)
    setIsEventDetailsOpen(true)
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card overflow-hidden">
        <CalendarSidebar />
      </aside>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-card border-border">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <CalendarSidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main calendar area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarWeekView
          onOpenNewEvent={handleOpenNewEvent}
          onOpenLinks={() => setIsLinksOpen(true)}
          onOpenAvailability={() => setIsAvailabilityOpen(true)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Modals */}
      <NewEventModal
        open={isNewEventOpen}
        onClose={() => setIsNewEventOpen(false)}
        initialDate={newEventDate}
        initialTime={newEventTime}
        onEventCreated={refetchEvents}
      />
      <AvailabilityModal
        open={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
      />
      <LinksModal
        open={isLinksOpen}
        onClose={() => setIsLinksOpen(false)}
      />
      <EventDetailsModal
        open={isEventDetailsOpen}
        onClose={() => {
          setIsEventDetailsOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
      />
    </div>
  )
}
