// src/components/calendario/calendar-layout.tsx
'use client'

import { useState } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { CalendarSidebar } from './calendar-sidebar'
import { CalendarWeekView } from './calendar-week-view'
import { NewEventModal } from './modals/new-event-modal'
import { AvailabilityModal } from './modals/availability-modal'
import { LinksModal } from './modals/links-modal'

export function CalendarLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false)
  const [isLinksOpen, setIsLinksOpen] = useState(false)
  const [newEventDate, setNewEventDate] = useState<string | undefined>()
  const [newEventTime, setNewEventTime] = useState<string | undefined>()

  function handleOpenNewEvent(date?: string, time?: string) {
    setNewEventDate(date)
    setNewEventTime(time)
    setIsNewEventOpen(true)
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
          <div className="h-full overflow-y-auto">
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
        />
      </div>

      {/* Modals */}
      <NewEventModal
        open={isNewEventOpen}
        onClose={() => setIsNewEventOpen(false)}
        initialDate={newEventDate}
        initialTime={newEventTime}
      />
      <AvailabilityModal
        open={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
      />
      <LinksModal
        open={isLinksOpen}
        onClose={() => setIsLinksOpen(false)}
      />
    </div>
  )
}
