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

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Demo con Ana',
    client: 'Ana García',
    project: 'MundoStetic',
    startTime: '09:00',
    endTime: '10:30',
    date: '2026-02-16',
    confirmationStatus: 'confirmed',
    layer: 'my-agenda',
  },
  {
    id: '2',
    title: 'Seguimiento propuesta',
    client: 'Carlos López',
    project: 'TechCorp',
    startTime: '11:00',
    endTime: '11:45',
    date: '2026-02-16',
    confirmationStatus: 'pending',
    layer: 'team-agenda',
  },
  {
    id: '3',
    title: 'Revisión de Proyecto',
    client: 'María Torres',
    project: 'TechCorp',
    startTime: '10:00',
    endTime: '11:00',
    date: '2026-02-20',
    confirmationStatus: 'confirmed',
    layer: 'team-agenda',
  },
  {
    id: '4',
    title: 'Cita IA - Onboarding',
    client: 'Luis Fernández',
    project: 'NellaSales',
    startTime: '14:00',
    endTime: '14:30',
    date: '2026-02-18',
    confirmationStatus: 'confirmed',
    layer: 'ai-appointments',
  },
  {
    id: '5',
    title: 'Demo NellaSales',
    client: 'Sofia Ruiz',
    project: 'NellaSales',
    startTime: '15:00',
    endTime: '16:00',
    date: '2026-02-19',
    confirmationStatus: 'pending',
    layer: 'my-agenda',
  },
]

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

  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
  getFilteredEvents: () => CalendarEvent[]
  getEventsForDate: (dateStr: string) => CalendarEvent[]

  toggleProjectFilter: (project: ProjectName) => void
  toggleLayerFilter: (layer: CalendarLayer) => void

  setBlockDuration: (duration: BlockDuration) => void
  updateAvailability: (availability: AvailabilityDay[]) => void
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: MOCK_EVENTS,
  currentWeekStart: startOfWeek(new Date('2026-02-16'), { weekStartsOn: 1 }),
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

  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        { ...event, id: `evt-${Date.now()}` },
      ],
    })),

  getFilteredEvents: () => {
    const { events, activeProjectFilters, activeLayerFilters } = get()
    return events.filter((e) => {
      const projectOk =
        activeProjectFilters.length === 0 || activeProjectFilters.includes(e.project)
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

  setBlockDuration: (duration) => set({ blockDuration: duration }),

  updateAvailability: (availability) => set({ availability }),
}))
