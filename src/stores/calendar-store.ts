// src/stores/calendar-store.ts
import { create } from 'zustand'
import { startOfWeek, addWeeks, subWeeks } from 'date-fns'
import type {
  CalendarEvent,
  CalendarLayer,
  ProjectName,
  AvailabilityDay,
  BlockDuration,
} from '@/types/calendar-types'

const DEFAULT_AVAILABILITY: AvailabilityDay[] = [
  { day: 'lun', enabled: true,  slots: [{ start: '09:00', end: '18:00' }] },
  { day: 'mar', enabled: true,  slots: [{ start: '09:00', end: '18:00' }] },
  { day: 'mie', enabled: true,  slots: [{ start: '09:00', end: '18:00' }] },
  { day: 'jue', enabled: true,  slots: [{ start: '09:00', end: '18:00' }] },
  { day: 'vie', enabled: true,  slots: [{ start: '09:00', end: '18:00' }] },
  { day: 'sab', enabled: false, slots: [] },
  { day: 'dom', enabled: false, slots: [] },
]

// ─── Store interface ─────────────────────────────────────────────────────────

interface CalendarStore {
  events: CalendarEvent[]
  currentWeekStart: Date
  activeProjectFilters: ProjectName[]
  activeLayerFilters: CalendarLayer[]
  blockDuration: BlockDuration
  availability: AvailabilityDay[]

  goToNextWeek: () => void
  goToPrevWeek: () => void
  goToToday: () => void

  // API-driven actions
  setEvents: (events: CalendarEvent[]) => void
  addEvent: (event: CalendarEvent) => void
  setAvailability: (availability: AvailabilityDay[]) => void
  setBlockDuration: (duration: BlockDuration) => void
  updateAvailability: (availability: AvailabilityDay[]) => void

  getFilteredEvents: () => CalendarEvent[]
  getEventsForDate: (dateStr: string) => CalendarEvent[]

  toggleProjectFilter: (project: ProjectName) => void
  toggleLayerFilter: (layer: CalendarLayer) => void
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
  activeProjectFilters: [],
  activeLayerFilters: [],
  blockDuration: 30,
  availability: DEFAULT_AVAILABILITY,

  goToNextWeek: () =>
    set((state) => ({ currentWeekStart: addWeeks(state.currentWeekStart, 1) })),

  goToPrevWeek: () =>
    set((state) => ({ currentWeekStart: subWeeks(state.currentWeekStart, 1) })),

  goToToday: () =>
    set({ currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }) }),

  setEvents: (events) => set({ events }),

  addEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),

  setAvailability: (availability) => set({ availability }),

  setBlockDuration: (blockDuration) => set({ blockDuration }),

  updateAvailability: (availability) => set({ availability }),

  getFilteredEvents: () => {
    const { events, activeProjectFilters, activeLayerFilters } = get()
    return events.filter((e) => {
      const projectOk =
        activeProjectFilters.length === 0 ||
        (activeProjectFilters as string[]).includes(e.project)
      const layerOk =
        activeLayerFilters.length === 0 || activeLayerFilters.includes(e.layer)
      return projectOk && layerOk
    })
  },

  getEventsForDate: (dateStr) => {
    const { getFilteredEvents } = get()
    return getFilteredEvents().filter((e) => e.date === dateStr)
  },

  toggleProjectFilter: (project) =>
    set((state) => ({
      activeProjectFilters: state.activeProjectFilters.includes(project)
        ? state.activeProjectFilters.filter((p) => p !== project)
        : [...state.activeProjectFilters, project],
    })),

  toggleLayerFilter: (layer) =>
    set((state) => ({
      activeLayerFilters: state.activeLayerFilters.includes(layer)
        ? state.activeLayerFilters.filter((l) => l !== layer)
        : [...state.activeLayerFilters, layer],
    })),
}))
