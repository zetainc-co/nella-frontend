// src/components/calendario/calendar-sidebar.tsx
// Server Component — no hooks required; composes Client Component children
import { MiniCalendar } from './mini-calendar'
import { ProjectFilters } from './project-filters'
import { UpcomingEvents } from './upcoming-events'

export function CalendarSidebar() {
  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar divide-y divide-border">
      <div className="m-4 border border-border rounded-lg">
        <MiniCalendar />
      </div>
      <div className="m-4 border border-border rounded-lg">
        <ProjectFilters />
      </div>
      <div className="m-4 border border-border rounded-lg">
        <UpcomingEvents />
      </div>
    </div>
  )
}
